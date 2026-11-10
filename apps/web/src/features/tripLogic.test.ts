import { describe, expect, it } from 'vitest';
import type { Stop } from '../api/itinerary';
import { ArrivalWatch, arrivalRadius, closedNote, googleDayUrl, nextStop, progress, startButton, stopNumber, travelGuess, type Fix } from './tripLogic';

const WADA = { lat: 18.5195, lng: 73.8553 };

const stop = (id: number, extra: Partial<Stop['place']> = {}, done = false): Stop => ({
  id,
  time: '9:00 AM',
  order: id,
  done,
  place: {
    id,
    name: `Place ${id}`,
    nameMr: null,
    category: 'Heritage',
    kind: null,
    area: null,
    lat: WADA.lat + id * 0.01,
    lng: WADA.lng,
    weakSignal: false,
    xp: 40,
    visitMinutes: 60,
    hours: null,
    opensAt: null,
    closesAt: null,
    hospital: null,
    ...extra,
  },
});

/** A reading `m` metres north of `at`. */
const fix = (at: { lat: number; lng: number }, m: number, t: number, extra: Partial<Fix> = {}): Fix => ({
  lat: at.lat + m / 111_320,
  lng: at.lng,
  accuracy: 15,
  speed: 0.5,
  at: t,
  ...extra,
});

describe('next stop', () => {
  it('is the first stop in plan order that is neither done nor skipped', () => {
    const stops = [stop(1, {}, true), stop(2), stop(3), stop(4)];
    expect(nextStop(stops, [])?.id).toBe(2);
    expect(nextStop(stops, [2])?.id).toBe(3);
    expect(nextStop(stops, [2, 3, 4])).toBeNull();
    expect(stopNumber(stops, nextStop(stops, [2]))).toBe(3);
    expect(progress(stops, [2])).toEqual({ done: 1, skipped: 1, total: 4, left: 2 });
  });

  it('follows the plan as it is now (reordered or deleted stops, stale skips)', () => {
    const before = [stop(1), stop(2), stop(3)];
    expect(nextStop(before, [])?.id).toBe(1);
    const reordered = [before[2], before[0], before[1]];
    expect(nextStop(reordered, [])?.id).toBe(3);
    const deleted = [before[1], before[2]];
    expect(nextStop(deleted, [1])?.id).toBe(2); // the skip of a deleted stop changes nothing
  });
});

describe('arrival', () => {
  const s = { ...stop(1), place: { ...stop(1).place, lat: WADA.lat, lng: WADA.lng } };

  it('asks only after staying nearby for half a minute with good GPS', () => {
    const w = new ArrivalWatch();
    const asked = new Set<number>();
    expect(w.feed(fix(WADA, 40, 0), s, asked)).toBe(false);
    expect(w.feed(fix(WADA, 30, 20_000), s, asked)).toBe(false);
    expect(w.feed(fix(WADA, 20, 31_000), s, asked)).toBe(true);
  });

  it('ignores bad GPS readings, passing by fast and stops already asked about', () => {
    const w = new ArrivalWatch();
    expect(w.feed(fix(WADA, 20, 0, { accuracy: 80 }), s, new Set())).toBe(false);
    expect(w.feed(fix(WADA, 20, 40_000, { accuracy: 80 }), s, new Set())).toBe(false); // never started the wait
    const auto = new ArrivalWatch();
    expect(auto.feed(fix(WADA, 20, 0, { speed: 8 }), s, new Set())).toBe(false);
    expect(auto.feed(fix(WADA, 20, 40_000, { speed: 8 }), s, new Set())).toBe(false);
    const done = new ArrivalWatch();
    done.feed(fix(WADA, 20, 0), s, new Set([1]));
    expect(done.feed(fix(WADA, 20, 40_000), s, new Set([1]))).toBe(false);
  });

  it('walking away restarts the wait; a neighbouring place does not count', () => {
    const w = new ArrivalWatch();
    w.feed(fix(WADA, 20, 0), s, new Set());
    w.feed(fix(WADA, 300, 15_000), s, new Set()); // Lal Mahal is about 200-300 m away
    expect(w.feed(fix(WADA, 20, 31_000), s, new Set())).toBe(false);
    expect(w.feed(fix(WADA, 300, 70_000), s, new Set())).toBe(false);
  });

  it('gives forts and lakes a bigger circle than city spots', () => {
    expect(arrivalRadius({ category: 'Heritage', kind: null })).toBe(100);
    expect(arrivalRadius({ category: 'Forts', kind: 'trek' })).toBe(400);
    const fort = { ...s, place: { ...s.place, category: 'Forts' } };
    const w = new ArrivalWatch();
    w.feed(fix(WADA, 350, 0), fort, new Set());
    expect(w.feed(fix(WADA, 350, 31_000), fort, new Set())).toBe(true);
  });
});

describe('Google Maps day link', () => {
  it('goes through the stops in order, without the ones that have no location', () => {
    const link = googleDayUrl([stop(1), stop(2, { lat: null, lng: null }), stop(3)])!;
    const u = new URL(link.url);
    expect(u.searchParams.get('destination')).toBe(`${(WADA.lat + 0.03).toFixed(6)},${WADA.lng.toFixed(6)}`);
    expect(u.searchParams.get('waypoints')).toBe(`${(WADA.lat + 0.01).toFixed(6)},${WADA.lng.toFixed(6)}`);
    expect(u.searchParams.get('travelmode')).toBe('driving');
    expect(link).toMatchObject({ count: 2, more: false });
  });

  it('takes the next 10 stops of a long day', () => {
    const link = googleDayUrl(Array.from({ length: 13 }, (_, i) => stop(i + 1)))!;
    expect(link).toMatchObject({ count: 10, more: true });
    expect(new URL(link.url).searchParams.get('waypoints')!.split('|')).toHaveLength(9);
    expect(googleDayUrl([stop(1, { lat: null, lng: null })])).toBeNull();
  });
});

describe('notes', () => {
  it('says "usually closed" outside the opening hours', () => {
    const wada = { opensAt: 8 * 60, closesAt: 18 * 60 + 30 };
    expect(closedNote(wada, 10 * 60)).toBeNull();
    expect(closedNote(wada, 7 * 60)).toBe('Usually closed now · opens 8 AM');
    expect(closedNote(wada, 19 * 60)).toBe('Usually closed now · closed at 6:30 PM');
    expect(closedNote({ opensAt: null, closesAt: null }, 3 * 60)).toBeNull();
  });

  it('guesses walking or road time', () => {
    expect(travelGuess(600)).toBe('600 m · about 8 min walk');
    expect(travelGuess(6000)).toBe('6.0 km · about 25 min by road');
  });
});

describe('Plan tab button', () => {
  const day = { id: 1, day: 1, label: 'Day 1 · Thu', date: '2026-10-22', weekday: 'Thursday', stops: [stop(1, {}, true), stop(2), stop(3)] };
  const run = { id: 9, dayId: 1, dayNumber: 1, startedAt: '', endedAt: null, endReason: null, skipped: [2], summary: null };

  it('starts, continues, or hides for an empty day', () => {
    expect(startButton(day, null)).toEqual({ show: true, running: false, label: 'Start Day 1', meta: '3 places' });
    expect(startButton(day, run)).toEqual({ show: true, running: true, label: 'Continue Day 1', meta: '1 of 3 visited' });
    expect(startButton({ ...day, id: 2, day: 2 }, run).label).toBe('Start Day 2');
    expect(startButton({ ...day, stops: [] }, null).show).toBe(false);
    expect(startButton(undefined, null).show).toBe(false);
  });
});
