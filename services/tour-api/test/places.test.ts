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
});
