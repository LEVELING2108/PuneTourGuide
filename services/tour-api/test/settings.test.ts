import sharp from 'sharp';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { tilesFor } from '../src/v1/offline/offline.service';
import { api, auth, resetUsers, signUp } from './helpers';

beforeAll(async () => {
  await seedCatalogue();
  await invalidateCache('tour:*');
});
beforeEach(resetUsers);

describe('medical info', () => {
  const body = { bloodGroup: 'B+', allergies: 'Penicillin', medicines: 'Metformin 500 mg', notes: 'Type 2 diabetes', showOnLockScreen: true };

  it('is encrypted at rest, returned only to the owner, and never cached', async () => {
    const u = await signUp();
    const empty = await api().get('/api/v1/medical').set(auth(u.token));
    expect(empty.body.data).toMatchObject({ saved: false, bloodGroup: null, allergies: '' });

    const put = await api().put('/api/v1/medical').set(auth(u.token)).send(body);
    expect(put.status).toBe(200);
    expect(put.headers['cache-control']).toBe('no-store');
    expect(put.body.data).toMatchObject({ ...body, saved: true });

    const row = await prisma.medicalProfile.findUniqueOrThrow({ where: { userId: u.user.id } });
    expect(row.bloodGroup).toBe('B+');
    for (const v of [row.allergiesEnc, row.medicinesEnc, row.notesEnc]) {
      expect(v).toBeTruthy();
      expect(v).not.toMatch(/Penicillin|Metformin|diabetes/);
    }

    const other = await signUp();
    expect((await api().get('/api/v1/medical').set(auth(other.token))).body.data.saved).toBe(false);
    expect((await api().get('/api/v1/medical')).status).toBe(401);
  });

  it('validates input and can be cleared', async () => {
    const u = await signUp();
    expect((await api().put('/api/v1/medical').set(auth(u.token)).send({ ...body, bloodGroup: 'Z' })).status).toBe(400);
    expect((await api().put('/api/v1/medical').set(auth(u.token)).send({ ...body, notes: 'x'.repeat(501) })).status).toBe(400);
    await api().put('/api/v1/medical').set(auth(u.token)).send(body);
    await api().delete('/api/v1/medical').set(auth(u.token));
    expect((await api().get('/api/v1/medical').set(auth(u.token))).body.data.saved).toBe(false);
  });
});

describe('avatar', () => {
  const jpegWithGps = () =>
    sharp({ create: { width: 800, height: 600, channels: 3, background: { r: 15, g: 76, b: 66 } } })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Make: 'TestPhone' }, IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '18/1 31/1 0/1' } } })
      .toBuffer();

  it('re-encodes to a 256 px WebP with no metadata and serves it by an unguessable URL', async () => {
    const u = await signUp();
    const original = await jpegWithGps();
    expect((await sharp(original).metadata()).exif).toBeTruthy();

    const res = await api().post('/api/v1/users/me/avatar').set(auth(u.token)).set('Content-Type', 'image/jpeg').send(original);
    expect(res.status).toBe(200);
    const url: string = res.body.data.avatarUrl;
    expect(url).toMatch(/^\/api\/v1\/avatars\/[A-Za-z0-9_-]{20,40}\.webp$/);

    const img = await api().get(url).buffer(true).parse((r, cb) => {
      const chunks: Buffer[] = [];
      r.on('data', (c: Buffer) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toBe('image/webp');
    expect(img.headers['cache-control']).toContain('immutable');
    const meta = await sharp(img.body as Buffer).metadata();
    expect(meta).toMatchObject({ format: 'webp', width: 256, height: 256 });
    expect(meta.exif).toBeUndefined();

    // A new upload replaces it; the old URL stops working
    const again = await api().post('/api/v1/users/me/avatar').set(auth(u.token)).set('Content-Type', 'image/jpeg').send(original);
    expect(again.body.data.avatarUrl).not.toBe(url);
    expect((await api().get(url)).status).toBe(404);

    const del = await api().delete('/api/v1/users/me/avatar').set(auth(u.token));
    expect(del.body.data.avatarUrl).toBeNull();
  });

  it('rejects things that are not images', async () => {
    const u = await signUp();
    const fake = await api().post('/api/v1/users/me/avatar').set(auth(u.token)).set('Content-Type', 'image/png').send(Buffer.from('<?php echo 1; ?>'));
    expect(fake.status).toBe(400);
    expect(fake.body.error.code).toBe('IMAGE_INVALID');
    const json = await api().post('/api/v1/users/me/avatar').set(auth(u.token)).send({ url: 'http://evil' });
    expect(json.status).toBe(415);
    expect((await api().get('/api/v1/avatars/../../etc.webp')).status).toBe(404);
  });
});

describe('profile settings and passport', () => {
  it('saves theme, language and toggles, and rejects unknown languages', async () => {
    const u = await signUp();
    const r = await api()
      .patch('/api/v1/users/me')
      .set(auth(u.token))
      .send({ theme: 'deccan', language: 'mr', shakeToSos: false, tripReminders: true, interests: ['Heritage', 'Food'] });
    expect(r.body.data).toMatchObject({ theme: 'deccan', language: 'mr', shakeToSos: false, tripReminders: true, interests: ['Heritage', 'Food'] });
    expect((await api().patch('/api/v1/users/me').set(auth(u.token)).send({ language: 'xx' })).status).toBe(400);
  });

  it('lists collected stamps with places for the passport', async () => {
    const u = await signUp();
    const fort = await prisma.place.findFirstOrThrow({ where: { name: 'Sinhagad Fort' } });
    const add = await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: fort.id });
    await api().patch(`/api/v1/itinerary/stops/${add.body.data.stop.id}`).set(auth(u.token)).send({ done: true });
    const r = await api().get('/api/v1/users/me/stamps').set(auth(u.token));
    expect(r.body.data).toMatchObject({ collected: 1, forts: 1 });
    expect(r.body.data.total).toBeGreaterThanOrEqual(26);
    expect(r.body.data.stamps[0]).toMatchObject({ name: 'Sinhagad Fort', nameMr: 'सिंहगड', category: 'Fort' });
  });
});

describe('offline packs', () => {
  it('lists real areas with sizes, and marks packs that cover your plan', async () => {
    const guest = await api().get('/api/v1/offline-packs');
    expect(guest.status).toBe(200);
    const old = guest.body.data.find((p: { id: string }) => p.id === 'old-pune');
    expect(old.places).toBeGreaterThan(3);
    expect(old.tileCount).toBeGreaterThan(100);
    expect(old.inPlan).toEqual([]);

    const u = await signUp();
    const wada = await prisma.place.findFirstOrThrow({ where: { name: 'Shaniwar Wada' } });
    await api().post('/api/v1/itinerary/stops').set(auth(u.token)).send({ placeId: wada.id });
    const mine = await api().get('/api/v1/offline-packs').set(auth(u.token));
    expect(mine.body.data.find((p: { id: string }) => p.id === 'old-pune').inPlan).toEqual(['Shaniwar Wada']);
  });

  it('serves a bundle with places, emergency numbers and the exact tile list', async () => {
    const r = await api().get('/api/v1/offline-packs/sinhagad');
    expect(r.status).toBe(200);
    expect(r.body.data.places.map((p: { name: string }) => p.name)).toContain('Sinhagad Fort');
    expect(r.body.data.numbers.map((n: { number: string }) => n.number)).toEqual(expect.arrayContaining(['112', '108', '100']));
    expect(r.body.data.tiles.length).toBe(tilesFor(r.body.data).length);
    expect(r.body.data.version).toMatch(/^[0-9a-f]{12}$/);
    expect((await api().get('/api/v1/offline-packs/nowhere')).status).toBe(404);
  });

  it('computes tiles covering the box at every zoom', () => {
    const t = tilesFor({ bbox: { south: 18.5, west: 73.8, north: 18.51, east: 73.81 }, minZoom: 12, maxZoom: 13 });
    expect(new Set(t.map((x) => x[0]))).toEqual(new Set([12, 13]));
    expect(t.every(([z, x, y]) => x >= 0 && y >= 0 && x < 2 ** z && y < 2 ** z)).toBe(true);
  });
});
