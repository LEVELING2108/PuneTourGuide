import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { api, auth, resetUsers, signUp } from './helpers';

const placeId = async (name: string) => (await prisma.place.findFirstOrThrow({ where: { name } })).id;

describe('itinerary + routes', () => {
  beforeAll(async () => {
    await seedCatalogue();
    await invalidateCache('tour:*');
  });
  beforeEach(resetUsers);

  it('needs a login', async () => {
    expect((await api().get('/api/v1/itinerary')).status).toBe(401);
  });

  it('always has Day 1 and Day 2 starting today', async () => {
    const u = await signUp();
    const res = await api().get('/api/v1/itinerary').set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].label).toMatch(/^Day 1 · \w{3}$/);
    expect(res.body.data[1].label).toMatch(/^Day 2 · \w{3}$/);
  });

  it('adds a place to the plan, reports it on the place and removes it', async () => {
    const u = await signUp();
    const id = await placeId('Shaniwar Wada');
    const add = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: id });
    expect(add.status).toBe(201);
    expect(add.body.data.stop).toMatchObject({ time: '9:00 AM', done: false, place: { name: 'Shaniwar Wada' } });
    expect(add.body.data.day.weekday).toMatch(/day$/);

    const dup = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: id });
    expect(dup.status).toBe(409);

    const second = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId('Lal Mahal') });
    expect(second.body.data.stop.time).toBe('11:00 AM'); // 9:00 + 90 min visit + 30 min travel

    const detail = await api().get(`/api/v1/places/${id}`).set(auth(u.token));
    expect(detail.body.data.planStopId).toBe(add.body.data.stop.id);

    const del = await api().delete(`/api/v1/itinerary/stops/${add.body.data.stop.id}`).set(auth(u.token));
    expect(del.status).toBe(200);
    const after = await api().get(`/api/v1/places/${id}`).set(auth(u.token));
    expect(after.body.data.planStopId).toBeNull();
  });

  it('ticking a stop awards XP and a stamp exactly once', async () => {
    const u = await signUp();
    const add = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId('Sinhagad Fort') });
    const stopId = add.body.data.stop.id;

    const tick = await api().patch(`/api/v1/itinerary/stops/${stopId}`).set(auth(u.token)).send({ done: true });
    expect(tick.body.data).toMatchObject({ stampCollected: true, xpAwarded: 80, totalXp: 80, stop: { done: true } });

    await api().patch(`/api/v1/itinerary/stops/${stopId}`).set(auth(u.token)).send({ done: false });
    const again = await api().patch(`/api/v1/itinerary/stops/${stopId}`).set(auth(u.token)).send({ done: true });
    expect(again.body.data).toMatchObject({ stampCollected: false, xpAwarded: 0, totalXp: 80 });

    const stats = await api().get('/api/v1/users/me/stats').set(auth(u.token));
    expect(stats.body.data).toMatchObject({ xp: 80, stamps: 1, placesVisited: 1 });
  });

  it('cannot touch another user’s stops', async () => {
    const a = await signUp();
    const b = await signUp();
    const add = await api().post('/api/v1/itinerary/stops').set(auth(a.token)).send({ placeId: await placeId('Kasba Ganpati') });
    const res = await api().patch(`/api/v1/itinerary/stops/${add.body.data.stop.id}`).set(auth(b.token)).send({ done: true });
    expect(res.status).toBe(404);
    expect((await api().delete(`/api/v1/itinerary/stops/${add.body.data.stop.id}`).set(auth(b.token))).status).toBe(404);
  });

  it('lists curated routes and copies one into an empty day', async () => {
    const routes = await api().get('/api/v1/routes');
    expect(routes.status).toBe(200);
    const peth = routes.body.data.find((r: { slug: string }) => r.slug === 'peth-walk');
    expect(peth).toMatchObject({ title: 'Old Pune peth walk', mode: 'On foot', stopCount: 5 });

    const u = await signUp();
    const res = await api().post(`/api/v1/itinerary/from-route/${peth.id}`).set(auth(u.token)).send({});
    expect(res.status).toBe(201);
    expect(res.body.data.stops.map((s: { place: { name: string } }) => s.place.name)).toEqual([
      'Shaniwar Wada',
      'Lal Mahal',
      'Kasba Ganpati',
      'Dagdusheth Halwai Ganpati',
      'Raja Dinkar Kelkar Museum',
    ]);
  });

  it('adds places and routes to Day 2 when asked', async () => {
    const u = await signUp();
    const [, day2] = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
    const add = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId('Shaniwar Wada'), dayId: day2.id });
    expect(add.status).toBe(201);
    expect(add.body.data.day).toMatchObject({ id: day2.id, day: 2 });

    const routes = await api().get('/api/v1/routes');
    const temples = routes.body.data.find((r: { slug: string }) => r.slug !== 'peth-walk');
    const loaded = await api().post(`/api/v1/itinerary/from-route/${temples.id}`).set(auth(u.token)).send({ dayId: day2.id });
    expect(loaded.status).toBe(201);
    expect(loaded.body.data.id).toBe(day2.id);

    const plan = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
    expect(plan[0].stops).toHaveLength(0);
    expect(plan[1].stops[0].place.name).toBe('Shaniwar Wada');

    const other = await signUp();
    const foreign = await api().post('/api/v1/itinerary/stops').set(auth(other.token)).send({ placeId: await placeId('Lal Mahal'), dayId: day2.id });
    expect(foreign.status).toBe(404);
  });

  it('moves a stop to the end of another day', async () => {
    const u = await signUp();
    const [day1, day2] = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
    const wada = await placeId('Shaniwar Wada');
    const a = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: wada });
    await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: await placeId('Lal Mahal'), dayId: day2.id });

    const move = await api().patch(`/api/v1/itinerary/stops/${a.body.data.stop.id}`).set(auth(u.token)).send({ dayId: day2.id });
    expect(move.status).toBe(200);
    expect(move.body.data.stop.time).toBe('10:15 AM'); // after Lal Mahal: 9:00 + 45 min visit + 30 min travel

    const plan = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
    expect(plan[0].stops).toHaveLength(0);
    expect(plan[1].stops.map((s: { place: { name: string } }) => s.place.name)).toEqual(['Lal Mahal', 'Shaniwar Wada']);

    // The same place can't be on a day twice
    const again = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: wada, dayId: day1.id });
    const clash = await api().patch(`/api/v1/itinerary/stops/${again.body.data.stop.id}`).set(auth(u.token)).send({ dayId: day2.id });
    expect(clash.status).toBe(409);
    expect(clash.body.error.code).toBe('ALREADY_IN_PLAN');

    const other = await signUp();
    const [, otherDay2] = (await api().get('/api/v1/itinerary').set(auth(other.token))).body.data;
    const foreign = await api().patch(`/api/v1/itinerary/stops/${again.body.data.stop.id}`).set(auth(u.token)).send({ dayId: otherDay2.id });
    expect(foreign.status).toBe(404);
  });
});
