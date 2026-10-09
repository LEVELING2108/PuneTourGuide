import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Never call the real routing servers from tests.
vi.mock('../src/clients/osrm', () => ({ osrmTable: vi.fn(), osrmRoute: vi.fn() }));

import { osrmRoute, osrmTable } from '../src/clients/osrm';
import { decodePolyline } from '../src/lib/polyline';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { nearestNeighbour, optimiseOrder, pathCost, twoOpt } from '../src/v1/routing/optimize';
import { instruction } from '../src/v1/routing/routing.service';
import { api, auth, resetUsers, signUp } from './helpers';

const table = vi.mocked(osrmTable);
const route = vi.mocked(osrmRoute);
const placeId = async (name: string) => (await prisma.place.findFirstOrThrow({ where: { name } })).id;

describe('optimiser', () => {
  // Stops on a line at 0, 10, 20, 30 visited as 0, 30, 10, 20.
  const line = [0, 30, 10, 20];
  const m = line.map((a) => line.map((b) => Math.abs(a - b)));

  it('keeps the first stop and finds the shortest open path', () => {
    const order = optimiseOrder(m);
    expect(order[0]).toBe(0);
    expect(pathCost(order, m)).toBe(30);
    expect(order).toEqual([0, 2, 3, 1]);
  });

  it('2-opt never makes a path worse and never returns worse than the current order', () => {
    const nn = nearestNeighbour(m);
    expect(pathCost(twoOpt(nn, m), m)).toBeLessThanOrEqual(pathCost(nn, m));
    const sorted = [0, 1, 2].map((a) => [0, 1, 2].map((b) => Math.abs(a - b)));
    expect(optimiseOrder(sorted)).toEqual([0, 1, 2]);
  });
});

describe('polyline + instructions', () => {
  it('decodes polyline6', () => {
    // Google's reference polyline, encoded at precision 6 for these points
    expect(decodePolyline('_izlhA~rlgdF_{geC~ywl@_kwzCn`{nI', 6)).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]);
  });

  it('turns OSRM manoeuvres into short English', () => {
    const s = { name: 'Laxmi Road', distanceM: 0, durationS: 0, lat: 0, lng: 0 };
    expect(instruction({ ...s, type: 'turn', modifier: 'left' })).toBe('Turn left onto Laxmi Road');
    expect(instruction({ ...s, type: 'turn', modifier: 'slight right' })).toBe('Bear right onto Laxmi Road');
    expect(instruction({ ...s, type: 'arrive', modifier: null })).toBe('You have arrived');
    expect(instruction({ ...s, name: '', type: 'continue', modifier: 'straight' })).toBe('Continue straight');
  });
});

describe('/directions', () => {
  beforeAll(() => invalidateCache('tour:*'));

  it('validates points and keeps the quota to India', async () => {
    expect((await api().get('/api/v1/directions?from=abc&to=18.5,73.8')).status).toBe(400);
    expect((await api().get('/api/v1/directions?from=51.5,-0.12&to=18.5,73.8')).status).toBe(400);
    expect((await api().get('/api/v1/directions?from=18.5,73.8&to=18.51,73.81&mode=fly')).status).toBe(400);
  });

  it('proxies OSRM, adds instructions and caches', async () => {
    route.mockResolvedValueOnce({
      distanceM: 650.4,
      durationS: 480.2,
      geometry: [
        [18.5195, 73.8553],
        [18.5164, 73.8562],
      ],
      legs: [{ distanceM: 650.4, durationS: 480.2 }],
      steps: [
        { type: 'depart', modifier: null, name: 'Bajirao Road', distanceM: 200, durationS: 150, lat: 18.5195, lng: 73.8553 },
        { type: 'turn', modifier: 'left', name: 'Laxmi Road', distanceM: 450, durationS: 330, lat: 18.518, lng: 73.856 },
        { type: 'arrive', modifier: null, name: '', distanceM: 0, durationS: 0, lat: 18.5164, lng: 73.8562 },
      ],
    });
    const url = '/api/v1/directions?from=18.5195,73.8553&to=18.5164,73.8562&mode=walk';
    const res = await api().get(url);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ mode: 'walk', distanceM: 650, durationS: 480 });
    expect(res.body.data.steps[1].instruction).toBe('Turn left onto Laxmi Road');
    expect(route).toHaveBeenCalledWith(expect.any(Array), 'foot');

    const again = await api().get(url);
    expect(again.status).toBe(200);
    expect(route).toHaveBeenCalledTimes(1);
  });

  it('says so when routing is down', async () => {
    route.mockRejectedValueOnce(new Error('down'));
    const res = await api().get('/api/v1/directions?from=18.60,73.80&to=18.61,73.81&mode=auto');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('ROUTING_UNAVAILABLE');
  });
});

describe('POST /itinerary/optimize', () => {
  beforeAll(async () => {
    await seedCatalogue();
    await invalidateCache('tour:*');
  });
  beforeEach(resetUsers);

  const plan = async (token: string, names: string[]) => {
    for (const n of names) await api().post('/api/v1/itinerary/stops').set(auth(token)).send({ placeId: await placeId(n) });
  };

  it('needs a login', async () => {
    expect((await api().post('/api/v1/itinerary/optimize').send({})).status).toBe(401);
  });

  it('reorders by travel time, re-times and reports minutes saved', async () => {
    const u = await signUp();
    await plan(u.token, ['Shaniwar Wada', 'Sinhagad Fort', 'Lal Mahal', 'Kasba Ganpati']);
    // Sinhagad is far from the three old-city stops; the best order visits it last.
    const far = 3600;
    table.mockResolvedValueOnce([
      [0, far, 300, 300],
      [far, 0, far, far],
      [300, far, 0, 300],
      [300, far, 300, 0],
    ]);
    const res = await api().post('/api/v1/itinerary/optimize').set(auth(u.token)).send({});
    expect(res.status).toBe(200);
    expect(res.body.data.minutesSaved).toBe(55); // 3600+3600+300 → 300+300+3600
    expect(res.body.data.estimated).toBe(false);
    const names = res.body.data.day.stops.map((s: { place: { name: string } }) => s.place.name);
    expect(names[0]).toBe('Shaniwar Wada');
    expect(names[3]).toBe('Sinhagad Fort');
    expect(res.body.data.day.stops[0].time).toBe('9:00 AM');

    // Already optimal now
    table.mockResolvedValueOnce([
      [0, 300, 300, far],
      [300, 0, 300, far],
      [300, 300, 0, far],
      [far, far, far, 0],
    ]);
    await invalidateCache('tour:table:*');
    const again = await api().post('/api/v1/itinerary/optimize').set(auth(u.token)).send({});
    expect(again.body.data.minutesSaved).toBe(0);
  });

  it('still optimises from straight-line estimates when routing is down', async () => {
    const u = await signUp();
    await plan(u.token, ['Shaniwar Wada', 'Sinhagad Fort', 'Lal Mahal', 'Kasba Ganpati']);
    table.mockRejectedValueOnce(new Error('down'));
    await invalidateCache('tour:table:*');
    const res = await api().post('/api/v1/itinerary/optimize').set(auth(u.token)).send({});
    expect(res.status).toBe(200);
    expect(res.body.data.estimated).toBe(true);
    expect(res.body.data.day.stops.at(-1).place.name).toBe('Sinhagad Fort');
  });

  it('cannot touch another user’s day', async () => {
    const a = await signUp();
    const b = await signUp();
    const days = await api().get('/api/v1/itinerary').set(auth(a.token));
    const res = await api().post('/api/v1/itinerary/optimize').set(auth(b.token)).send({ dayId: days.body.data[0].id });
    expect(res.status).toBe(404);
  });
});
