import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { api, auth, resetUsers, signUp } from './helpers';

const SHANIWAR = { lat: 18.5195, lng: 73.8553 };

describe('places', () => {
  beforeAll(async () => {
    await seedCatalogue();
    await invalidateCache('tour:*');
  });
  beforeEach(resetUsers);

  it('lists places nearest first with distance and nearest hospital', async () => {
    const res = await api().get('/api/v1/places').query({ near: `${SHANIWAR.lat},${SHANIWAR.lng}`, radiusKm: 5, limit: 5 });
    expect(res.status).toBe(200);
    const items = res.body.data;
    expect(items[0].name).toBe('Shaniwar Wada');
    expect(items[0].km).toBeLessThan(0.1);
    expect(items[0].hospital).toMatchObject({ name: 'KEM Hospital' });
    const kms = items.map((p: { km: number }) => p.km);
    expect([...kms].sort((a, b) => a - b)).toEqual(kms);
    expect(res.body.meta).toHaveProperty('nextCursor');
  });

  it('filters by category, kind, free and hospital distance', async () => {
    const forts = await api().get('/api/v1/places').query({ category: 'Fort' });
    expect(forts.body.data.length).toBeGreaterThan(0);
    expect(forts.body.data.every((p: { category: string }) => p.category === 'Fort')).toBe(true);

    const wadas = await api().get('/api/v1/places').query({ kind: 'Wada' });
    expect(wadas.body.data.every((p: { kind: string }) => p.kind === 'Wada')).toBe(true);

    const freeNearHelp = await api().get('/api/v1/places').query({ free: 'true', helpWithinKm: 2, limit: 100 });
    for (const p of freeNearHelp.body.data) {
      expect(p.free).toBe(true);
      expect(p.hospital.km).toBeLessThanOrEqual(2);
    }
  });

  it('counts with the same filters (Filters sheet)', async () => {
    const all = await api().get('/api/v1/places/count').query({ near: `${SHANIWAR.lat},${SHANIWAR.lng}`, radiusKm: 5 });
    const free = await api().get('/api/v1/places/count').query({ near: `${SHANIWAR.lat},${SHANIWAR.lng}`, radiusKm: 5, free: 'true' });
    expect(all.body.data.count).toBeGreaterThan(free.body.data.count);
    expect(free.body.data.count).toBeGreaterThan(0);
  });

  it('searches by name, Marathi name and area', async () => {
    const en = await api().get('/api/v1/places').query({ q: 'sinhagad' });
    expect(en.body.data[0].name).toBe('Sinhagad Fort');
    const mr = await api().get('/api/v1/places').query({ q: 'शनिवार' });
    expect(mr.body.data[0].name).toBe('Shaniwar Wada');
    const area = await api().get('/api/v1/places').query({ q: 'Kasba' });
    expect(area.body.data.length).toBeGreaterThan(0);
  });

  it('rejects bad filters', async () => {
    expect((await api().get('/api/v1/places').query({ near: 'pune' })).status).toBe(400);
    expect((await api().get('/api/v1/places').query({ category: 'Mall' })).status).toBe(400);
    expect((await api().get('/api/v1/places').query({ limit: 500 })).status).toBe(400);
  });

  it('returns detail, and saves / unsaves for a logged-in user', async () => {
    const place = await prisma.place.findFirstOrThrow({ where: { name: 'Aga Khan Palace' } });
    const guest = await api().get(`/api/v1/places/${place.id}`);
    expect(guest.body.data).toMatchObject({ name: 'Aga Khan Palace', nameMr: 'आगा खान पॅलेस', isSaved: false });
    expect(guest.body.data.description).toContain('1892');

    expect((await api().put(`/api/v1/places/${place.id}/save`)).status).toBe(401);

    const u = await signUp();
    expect((await api().put(`/api/v1/places/${place.id}/save`).set(auth(u.token))).body.data.isSaved).toBe(true);
    expect((await api().get(`/api/v1/places/${place.id}`).set(auth(u.token))).body.data.isSaved).toBe(true);
    const saved = await api().get('/api/v1/places').query({ saved: 'true' }).set(auth(u.token));
    expect(saved.body.data.map((p: { id: number }) => p.id)).toEqual([place.id]);
    await api().delete(`/api/v1/places/${place.id}/save`).set(auth(u.token));
    expect((await api().get(`/api/v1/places/${place.id}`).set(auth(u.token))).body.data.isSaved).toBe(false);
  });

  it('404s for an unknown place', async () => {
    const res = await api().get('/api/v1/places/999999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PLACE_NOT_FOUND');
  });

  it('returns category counts for Home collections', async () => {
    const res = await api().get('/api/v1/places/categories');
    expect(res.body.data.Fort).toBeGreaterThanOrEqual(4);
    expect(res.body.data['kind:Wada']).toBeGreaterThanOrEqual(3);
  });

  it('suggests places and food near a place, nearest first, never the place itself', async () => {
    const wada = await prisma.place.findFirstOrThrow({ where: { name: 'Shaniwar Wada' } });
    const res = await api().get(`/api/v1/places/${wada.id}/nearby`);
    expect(res.status).toBe(200);
    const { places, food } = res.body.data;
    expect(places.length).toBeGreaterThanOrEqual(3);
    expect(places.length).toBeLessThanOrEqual(6);
    expect(places.map((p: { id: number }) => p.id)).not.toContain(wada.id);
    expect(places.every((p: { category: string; km: number }) => p.category !== 'Food' && p.km <= 3)).toBe(true);
    expect(places.map((p: { name: string }) => p.name)).toContain('Lal Mahal');
    expect(food.every((p: { category: string }) => p.category === 'Food')).toBe(true);
    // Open (or unknown hours) before closed; distance order within each group
    const closedAt = places.findIndex((p: { openNow: boolean | null }) => p.openNow === false);
    if (closedAt >= 0) expect(places.slice(closedAt).every((p: { openNow: boolean | null }) => p.openNow === false)).toBe(true);
  });

  it('looks further out for places with little around them', async () => {
    const fort = await prisma.place.findFirstOrThrow({ where: { name: 'Sinhagad Fort' } });
    const res = await api().get(`/api/v1/places/${fort.id}/nearby`);
    expect(res.status).toBe(200);
    expect(res.body.data.places.every((p: { km: number }) => p.km <= 10)).toBe(true);
  });

  it('marks nearby places already in the plan', async () => {
    const u = await signUp();
    const wada = await prisma.place.findFirstOrThrow({ where: { name: 'Shaniwar Wada' } });
    const mahal = await prisma.place.findFirstOrThrow({ where: { name: 'Lal Mahal' } });
    const add = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: mahal.id });
    const res = await api().get(`/api/v1/places/${wada.id}/nearby`).set(auth(u.token));
    expect(res.body.data.places.find((p: { id: number }) => p.id === mahal.id).planStopId).toBe(add.body.data.stop.id);
    expect((await api().get('/api/v1/places/999999/nearby')).status).toBe(404);
  });

  it('marks a place visited once: stamp, XP, plan tick and the visited flag', async () => {
    const u = await signUp();
    const fort = await prisma.place.findFirstOrThrow({ where: { name: 'Sinhagad Fort' } });
    const stop = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: fort.id });

    expect((await api().post(`/api/v1/places/${fort.id}/visit`)).status).toBe(401);
    const first = await api().post(`/api/v1/places/${fort.id}/visit`).set(auth(u.token));
    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({ placeId: fort.id, stampCollected: true, xpAwarded: fort.xp, totalXp: fort.xp });

    const again = await api().post(`/api/v1/places/${fort.id}/visit`).set(auth(u.token));
    expect(again.body.data).toMatchObject({ stampCollected: false, xpAwarded: 0, totalXp: fort.xp, visitedAt: first.body.data.visitedAt });

    const detail = await api().get(`/api/v1/places/${fort.id}`).set(auth(u.token));
    expect(detail.body.data.visitedAt).toBe(first.body.data.visitedAt);
    const plan = (await api().get('/api/v1/itinerary').set(auth(u.token))).body.data;
    expect(plan.flatMap((d: { stops: { id: number; done: boolean }[] }) => d.stops).find((s: { id: number }) => s.id === stop.body.data.stop.id).done).toBe(true);

    const stamps = await api().get('/api/v1/users/me/stamps').set(auth(u.token));
    expect(stamps.body.data.stamps[0]).toMatchObject({ placeId: fort.id, area: fort.area, xp: fort.xp });
    // A place marked visited from its page counts as visited even if it was never planned
    const lal = await prisma.place.findFirstOrThrow({ where: { name: 'Lal Mahal' } });
    await api().post(`/api/v1/places/${lal.id}/visit`).set(auth(u.token));
    const stats = await api().get('/api/v1/users/me/stats').set(auth(u.token));
    expect(stats.body.data).toMatchObject({ stamps: 2, placesVisited: 2, xp: fort.xp + lal.xp });
    expect((await api().post('/api/v1/places/999999/visit').set(auth(u.token))).status).toBe(404);
  });
});
