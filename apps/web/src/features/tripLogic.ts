/**
 * Trip mode rules (TECH_DESIGN §9.14), kept free of React so they can be tested on their own.
 */
import type { DayRun, PlanDay, Stop, StopPlace } from '../api/itinerary';

export type LatLng = { lat: number; lng: number };

/** The Plan tab's button: "Start Day 1 · 5 places", "Continue Day 1 · 2 of 5 visited", or none for an empty day. */
export function startButton(day: PlanDay | undefined, run: DayRun | null) {
  const n = day?.stops.length ?? 0;
  if (!day || !n) return { show: false, running: false, label: '', meta: '' };
  const running = !!run && run.dayId === day.id;
  return {
    show: true,
    running,
    label: `${running ? 'Continue' : 'Start'} Day ${day.day}`,
    meta: running ? `${progress(day.stops, run.skipped).done} of ${n} visited` : `${n} ${n === 1 ? 'place' : 'places'}`,
  };
}

/** The stop to head to: first in plan order that is neither done nor skipped. Always from the current plan. */
export function nextStop(stops: Stop[], skipped: number[]): Stop | null {
  const skip = new Set(skipped);
  return stops.find((s) => !s.done && !skip.has(s.id)) ?? null;
}

export function progress(stops: Stop[], skipped: number[]) {
  const skip = new Set(skipped);
  const done = stops.filter((s) => s.done).length;
  const skippedHere = stops.filter((s) => !s.done && skip.has(s.id)).length;
  return { done, skipped: skippedHere, total: stops.length, left: stops.length - done - skippedHere };
}

/** Number of the stop you are heading to ("Stop 2 of 5"), counting done and skipped ones before it. */
export function stopNumber(stops: Stop[], stop: Stop | null) {
  return stop ? stops.findIndex((s) => s.id === stop.id) + 1 : stops.length;
}

export const metres = (a: LatLng, b: LatLng) => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

// Forts, hills, lakes and gardens spread over hundreds of metres, but we store one point (often the gate)
const BIG = /fort|trek|hill|ghat|lake|dam|garden|park|nature|caves?|valley|waterfall/i;

/** How close counts as "arrived": about 100 m in the city, 400 m at a fort or a lake. */
export function arrivalRadius(place: Pick<StopPlace, 'category' | 'kind'>) {
  return BIG.test(`${place.category ?? ''} ${place.kind ?? ''}`) ? 400 : 100;
}

export type Fix = LatLng & { accuracy: number; speed: number | null; at: number };

const WORST_ACCURACY_M = 50; // ignore readings worse than this (narrow peth lanes, indoors)
const DWELL_MS = 30_000; // stay nearby this long before we ask
const PASSING_MPS = 4; // ~15 km/h: riding past in an auto does not count

/**
 * Decides when to ask "You've arrived?". Only the stop you are heading to, only good GPS readings,
 * only after staying nearby for half a minute and not while moving fast. It never ticks anything
 * by itself, and asks once per stop.
 */
export class ArrivalWatch {
  private since: number | null = null;
  private target: number | null = null;

  /** Returns true the moment the traveller should be asked. */
  feed(fix: Fix, stop: Stop | null, asked: ReadonlySet<number>): boolean {
    if (!stop || stop.place.lat == null || stop.place.lng == null || asked.has(stop.id)) {
      this.reset();
      return false;
    }
    if (this.target !== stop.id) {
      this.reset();
      this.target = stop.id;
    }
    if (fix.accuracy > WORST_ACCURACY_M) return false; // a bad reading neither starts nor breaks the wait
    const inside = metres(fix, { lat: stop.place.lat, lng: stop.place.lng }) <= arrivalRadius(stop.place);
    const slow = fix.speed == null || fix.speed < PASSING_MPS;
    if (!inside || !slow) {
      this.since = null;
      return false;
    }
    this.since ??= fix.at;
    return fix.at - this.since >= DWELL_MS;
  }

  reset() {
    this.since = null;
    this.target = null;
  }
}

/** Google's directions link takes a destination plus up to 9 stops on the way. */
const GOOGLE_MAX_STOPS = 10;

/**
 * "Open the whole day in Google Maps": the stops still to visit, in order, from where you are.
 * No API key; Google Maps opens with the route. Stops without a location are left out.
 */
export function googleDayUrl(stops: Stop[], mode: 'walk' | 'auto' = 'auto') {
  const pts = stops.flatMap((s) => (s.place.lat != null && s.place.lng != null ? [`${s.place.lat.toFixed(6)},${s.place.lng.toFixed(6)}`] : []));
  if (!pts.length) return null;
  const used = pts.slice(0, GOOGLE_MAX_STOPS);
  const dest = used[used.length - 1];
  const via = used.slice(0, -1);
  const q = new URLSearchParams({ api: '1', destination: dest, travelmode: mode === 'walk' ? 'walking' : 'driving' });
  if (via.length) q.set('waypoints', via.join('|'));
  return { url: `https://www.google.com/maps/dir/?${q.toString()}`, count: used.length, more: pts.length > used.length };
}

/** Minutes after midnight, Pune time. */
export function puneMinutes(now = new Date()) {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(now)
    .split(':')
    .map(Number);
  return h * 60 + m;
}

const clock = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

/** "Usually closed now · opens 8 AM", from our own hours (which may be out of date, hence "usually"). */
export function closedNote(place: Pick<StopPlace, 'opensAt' | 'closesAt'>, nowMin = puneMinutes()) {
  const { opensAt, closesAt } = place;
  if (opensAt == null || closesAt == null) return null;
  if (nowMin >= opensAt && nowMin < closesAt) return null;
  return nowMin < opensAt ? `Usually closed now · opens ${clock(opensAt)}` : `Usually closed now · closed at ${clock(closesAt)}`;
}

/** Rough travel time for the next-stop card (walking under 1.5 km, else by road in city traffic). */
export function travelGuess(m: number) {
  const walk = m < 1500;
  const min = Math.max(1, Math.round(walk ? m / 75 : m / 300 + 5));
  const dist = m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
  return `${dist} · about ${min} min ${walk ? 'walk' : 'by road'}`;
}
