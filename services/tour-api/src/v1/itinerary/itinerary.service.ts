import { conflict, notFound } from '../../lib/errors';
import { optimiseOrder, pathCost } from '../routing/optimize';
import { routingService } from '../routing/routing.service';
import { itineraryRepo, type DayWithStops, type StopWithPlace } from './itinerary.repository';
import { addDays, dayLabel, formatTime, parseTime, puneToday, roundUp15, weekday } from './time';

const DEFAULT_START = 9 * 60; // 9:00 AM
const TRAVEL_BUFFER = 30;
const PLAN_DAYS = 2; // the Plan screen shows Day 1 / Day 2 tabs

const round1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);

export function toStopDto(s: StopWithPlace) {
  const p = s.place;
  return {
    id: s.id,
    time: s.time,
    order: s.order,
    done: s.done,
    place: p
      ? {
          id: p.id,
          name: p.name,
          nameMr: p.name_mr,
          category: p.category,
          kind: p.kind,
          area: p.area,
          lat: p.latitude,
          lng: p.longitude,
          weakSignal: p.weakSignal,
          xp: p.xp,
          visitMinutes: p.visitMinutes,
          hospital: p.nearestHospitalName ? { name: p.nearestHospitalName, km: round1(p.nearestHospitalKm) } : null,
        }
      : // Legacy stop that never matched a catalogue place
        { id: null, name: s.name, nameMr: s.name_mr, category: null, kind: null, area: null, lat: null, lng: null, weakSignal: false, xp: 30, visitMinutes: null, hospital: null },
  };
}

export function toDayDto(d: DayWithStops) {
  const date = d.date ?? puneToday();
  return {
    id: d.id,
    day: d.day,
    label: d.label,
    date: date.toISOString().slice(0, 10),
    weekday: weekday(date),
    stops: d.stops.map(toStopDto),
  };
}

/** Next free slot after the last stop of the day. */
function nextTime(day: DayWithStops): string {
  const last = day.stops[day.stops.length - 1];
  if (!last) return formatTime(DEFAULT_START);
  const start = parseTime(last.time) ?? DEFAULT_START;
  return formatTime(roundUp15(start + (last.place?.visitMinutes ?? 60) + TRAVEL_BUFFER));
}

export const itineraryService = {
  /**
   * The user's plan, always with Day 1 and Day 2. Undated (legacy) or past plans are moved to start today,
   * so the tabs read "Day 1 · <today>".
   */
  async days(userId: number): Promise<DayWithStops[]> {
    let days = await itineraryRepo.days(userId);
    const today = puneToday();
    const first = days[0]?.date;
    if (days.length && (!first || first < today)) {
      await Promise.all(days.map((d, i) => itineraryRepo.setDayDate(d.id, addDays(today, i), dayLabel(i + 1, addDays(today, i)))));
      days = await itineraryRepo.days(userId);
    }
    for (let n = days.length + 1; n <= PLAN_DAYS; n++) {
      const date = addDays(days[days.length - 1]?.date ?? addDays(today, -1), 1);
      days.push(await itineraryRepo.createDay({ userId, day: n, label: dayLabel(n, date), date }));
    }
    return days;
  },

  async plan(userId: number) {
    return (await this.days(userId)).map(toDayDto);
  },

  /** Day to add to when none is given: today's day if planned, else Day 1. */
  async targetDay(userId: number, dayId?: number) {
    const days = await this.days(userId);
    if (dayId) {
      const d = days.find((x) => x.id === dayId);
      if (!d) throw notFound('DAY_NOT_FOUND', 'That day is not in your plan');
      return d;
    }
    const today = puneToday().getTime();
    return days.find((d) => d.date?.getTime() === today) ?? days[0];
  },

  async addStop(userId: number, input: { placeId: number; dayId?: number; time?: string }) {
    const place = await itineraryRepo.place(input.placeId);
    if (!place) throw notFound('PLACE_NOT_FOUND', 'Place not found');
    const day = await this.targetDay(userId, input.dayId);
    if (day.stops.some((s) => s.placeId === place.id)) {
      throw conflict('ALREADY_IN_PLAN', `${place.name} is already in your plan for ${weekday(day.date ?? puneToday())}`);
    }
    const stop = await itineraryRepo.createStop({
      itineraryDayId: day.id,
      placeId: place.id,
      name: place.name,
      name_mr: place.name_mr,
      desc: place.description.slice(0, 200),
      desc_mr: place.description_mr?.slice(0, 200) ?? null,
      dotColor: '',
      tags: [{ label: place.category, type: 'category' }],
      time: input.time ?? nextTime(day),
      order: (day.stops[day.stops.length - 1]?.order ?? -1) + 1,
    });
    const fresh = await itineraryRepo.stop(userId, stop.id);
    return { stop: toStopDto(fresh!), day: { id: day.id, weekday: weekday(day.date ?? puneToday()) } };
  },

  async removeStop(userId: number, stopId: number) {
    const stop = await itineraryRepo.stop(userId, stopId);
    if (!stop) throw notFound('STOP_NOT_FOUND', 'Stop not found');
    await itineraryRepo.deleteStop(stop.id);
    return { id: stop.id, placeId: stop.placeId };
  },

  /** Tick visited → +XP and a passport stamp (once per place). */
  async updateStop(userId: number, stopId: number, patch: { done?: boolean; time?: string }) {
    const stop = await itineraryRepo.stop(userId, stopId);
    if (!stop) throw notFound('STOP_NOT_FOUND', 'Stop not found');
    let reward = { stampCollected: false, xpAwarded: 0, totalXp: undefined as number | undefined };
    if (patch.done !== undefined && patch.done !== stop.done) {
      reward = await itineraryRepo.setDone(userId, stop.id, patch.done, stop.placeId, stop.place?.xp ?? 30);
    }
    if (patch.time) await itineraryRepo.updateStop(stop.id, { time: patch.time });
    const fresh = await itineraryRepo.stop(userId, stopId);
    return { stop: toStopDto(fresh!), ...reward };
  },

  /**
   * Optimise a day (TECH_DESIGN §9.3). Visited stops stay where they are; the first stop still
   * to visit is the fixed start; the rest are reordered by travel time (NN + 2-opt) and re-timed.
   * Stops without coordinates keep their place at the end. Saves under a minute count as no change.
   */
  async optimize(userId: number, dayId?: number) {
    const day = await this.targetDay(userId, dayId);
    const done = day.stops.filter((s) => s.done);
    const pending = day.stops.filter((s) => !s.done);
    const routable = pending.filter((s) => s.place?.latitude != null && s.place?.longitude != null);
    const unroutable = pending.filter((s) => !routable.includes(s));
    // The fixed start is where you are in the day: the last visited stop, else the first stop.
    const anchor = [...done].reverse().find((s) => s.place?.latitude != null && s.place?.longitude != null);
    const seq = anchor ? [anchor, ...routable] : routable;
    const unchanged = { day: toDayDto(day), minutesSaved: 0, estimated: false };
    if (seq.length < 3) return unchanged; // with a fixed start, two stops have only one order

    const pts = seq.map((s) => ({ lat: s.place!.latitude!, lng: s.place!.longitude! }));
    const { seconds, estimated } = await routingService.matrix(pts, 'car');
    const order = optimiseOrder(seconds);
    const savedS = pathCost(seq.map((_, i) => i), seconds) - pathCost(order, seconds);
    if (savedS < 60) return { ...unchanged, estimated };

    // Re-time from the first stop still to visit: visit length + travel, rounded up to the quarter hour.
    const visitOrder = anchor ? order.slice(1) : order;
    let t = parseTime(routable[0].time) ?? DEFAULT_START;
    const timed = visitOrder.map((idx, n) => {
      if (n > 0) {
        const prevIdx = visitOrder[n - 1];
        t = roundUp15(t + (seq[prevIdx].place?.visitMinutes ?? 60) + seconds[prevIdx][idx] / 60);
      }
      return { stop: seq[idx], time: formatTime(t) };
    });
    const final = [...done.map((s) => ({ stop: s, time: undefined })), ...timed, ...unroutable.map((s) => ({ stop: s, time: undefined }))];
    await itineraryRepo.reorder(final.map((f, i) => ({ id: f.stop.id, order: i, time: f.time })));
    const fresh = await itineraryRepo.day(userId, day.id);
    return { day: toDayDto(fresh!), minutesSaved: Math.round(savedS / 60), estimated };
  },

  async routes() {
    const routes = await itineraryRepo.routes();
    return routes.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      mode: r.mode,
      summary: r.summary,
      deccanTitle: r.deccanTitle,
      deccanSummary: r.deccanSummary,
      tone: r.tone,
      stopCount: r.stops.length,
      maxHospitalKm: Math.max(0, ...r.stops.map((s) => s.place.nearestHospitalKm ?? 0)),
      weakSignal: r.stops.some((s) => s.place.weakSignal),
      stops: r.stops.map((s) => ({ placeId: s.place.id, name: s.place.name, nameMr: s.place.name_mr, time: s.time })),
    }));
  },

  /** Copy a curated route into a day: the given one, else the first empty day, else Day 1 (appended). */
  async fromRoute(userId: number, routeId: number, dayId?: number) {
    const route = await itineraryRepo.route(routeId);
    if (!route) throw notFound('ROUTE_NOT_FOUND', 'Route not found');
    const days = await this.days(userId);
    const day = dayId ? await this.targetDay(userId, dayId) : (days.find((d) => d.stops.length === 0) ?? days[0]);
    let order = (day.stops[day.stops.length - 1]?.order ?? -1) + 1;
    const existing = new Set(day.stops.map((s) => s.placeId));
    for (const rs of route.stops) {
      if (existing.has(rs.placeId)) continue;
      await itineraryRepo.createStop({
        itineraryDayId: day.id,
        placeId: rs.placeId,
        name: rs.place.name,
        name_mr: rs.place.name_mr,
        desc: rs.place.description.slice(0, 200),
        dotColor: '',
        tags: [{ label: rs.place.category, type: 'category' }],
        time: rs.time ?? formatTime(DEFAULT_START),
        order: order++,
      });
    }
    const fresh = await itineraryRepo.day(userId, day.id);
    return toDayDto(fresh!);
  },
};
