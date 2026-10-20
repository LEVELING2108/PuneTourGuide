import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { googleConfigured, googlePlaces, GoogleApiError, type GooglePlace } from '../src/clients/googlePlaces';
import { parseCaps, takeGoogleBudget } from '../src/lib/googleBudget';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { resetKnownSpots, searchRadiusM } from '../src/v1/google/google.service';
import { api, auth, resetUsers, signUp } from './helpers';

// Never call Google from tests: a fake client, and a budget that's always available unless a test says otherwise
vi.mock('../src/clients/googlePlaces', async (orig) => ({
  ...(await orig<typeof import('../src/clients/googlePlaces')>()),
  googleConfigured: vi.fn(() => true),
  googlePlaces: { findPlaceId: vi.fn(), details: vi.fn(), nearby: vi.fn(), photoUri: vi.fn() },
}));
vi.mock('../src/lib/googleBudget', async (orig) => ({
  ...(await orig<typeof import('../src/lib/googleBudget')>()),
  takeGoogleBudget: vi.fn(async () => true),
}));

const g = vi.mocked(googlePlaces);
const budget = vi.mocked(takeGoogleBudget);
const WADA_GID = 'ChIJ-test-shaniwar-wada';

const spot = (id: string, name: string, primaryType: string, lat = 18.5203, lng = 73.856): GooglePlace => ({
  id,
  name,
  type: primaryType.replace(/_/g, ' '),
  primaryType,
  lat,
  lng,
  rating: 4.6,
  ratingCount: 1200,
  openNow: true,
  hours: ['Monday: 8:00 AM – 6:30 PM'],
  address: 'Shaniwar Peth, Pune',
  mapsUri: `https://maps.google.com/?cid=${id}`,
  photos: [{ name: `places/${id}/photos/AbCdEfGhIjKlMn`, authors: [{ name: 'A Photographer', uri: null }] }],
});

describe('google places', () => {
  let wada: number;

  beforeAll(async () => {
    await seedCatalogue();
    wada = (await prisma.place.findFirstOrThrow({ where: { name: 'Shaniwar Wada' } })).id;
    await prisma.place.updateMany({ where: { googlePlaceId: WADA_GID }, data: { googlePlaceId: null } });
    await prisma.place.update({ where: { id: wada }, data: { googlePlaceId: WADA_GID } });
  });

  beforeEach(async () => {
    await resetUsers();
    vi.clearAllMocks();
    vi.mocked(googleConfigured).mockReturnValue(true);
    budget.mockResolvedValue(true);
    resetKnownSpots();
  });

  it('adds rating, open now and a photo to a linked place, and says why when it cannot', async () => {
    g.details.mockResolvedValue(spot(WADA_GID, 'Shaniwar Wada', 'historical_landmark'));
    const res = await api().get(`/api/v1/google/places/${wada}`);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body.data).toMatchObject({ available: true, rating: 4.6, ratingCount: 1200, openNow: true, photo: { authors: [{ name: 'A Photographer' }] } });
    expect(g.details).toHaveBeenCalledWith(WADA_GID, 1);

    const unlinked = await prisma.place.findFirstOrThrow({ where: { name: 'Lal Mahal' } });
    await prisma.place.update({ where: { id: unlinked.id }, data: { googlePlaceId: null } });
    expect((await api().get(`/api/v1/google/places/${unlinked.id}`)).body.data).toEqual({ available: false, reason: 'not-linked' });

    budget.mockResolvedValueOnce(false);
    expect((await api().get(`/api/v1/google/places/${wada}`)).body.data).toEqual({ available: false, reason: 'daily-limit' });

    g.details.mockRejectedValueOnce(new GoogleApiError(500, 'INTERNAL'));
    expect((await api().get(`/api/v1/google/places/${wada}`)).body.data).toEqual({ available: false, reason: 'unavailable' });

    vi.mocked(googleConfigured).mockReturnValue(false);
    expect((await api().get(`/api/v1/google/places/${wada}`)).body.data).toEqual({ available: false, reason: 'not-configured' });
    expect((await api().get('/api/v1/google/places/999999')).status).toBe(404);
  });

  it('suggests side quests and food nearby, without our own places or hotels', async () => {
    g.nearby
      .mockResolvedValueOnce([spot(WADA_GID, 'Shaniwar Wada', 'historical_landmark'), spot('ChIJ-quest-omkareshwar', 'Omkareshwar Temple', 'hindu_temple', 18.5182, 73.8514)])
      .mockResolvedValueOnce([spot('ChIJ-food-sukanta-thali', 'Sukanta Thali', 'indian_restaurant'), spot('ChIJ-food-some-resort', 'Hillside Resort', 'resort_hotel')]);
    const res = await api().get(`/api/v1/google/places/${wada}/nearby`);
    expect(res.status).toBe(200);
    const { sideQuests, food } = res.body.data;
    expect(sideQuests.map((s: { name: string }) => s.name)).toEqual(['Omkareshwar Temple']);
    expect(food.map((s: { name: string }) => s.name)).toEqual(['Sukanta Thali']);
    expect(sideQuests[0]).toMatchObject({ googleId: 'ChIJ-quest-omkareshwar', rating: 4.6, openNow: true, visitedAt: null });
    expect(sideQuests[0].km).toBeGreaterThan(0.3);
    // City places look within a walkable radius, out-of-town ones wider
    expect(g.nearby.mock.calls[0][2]).toBe(1500);
    expect(searchRadiusM({ lat: 18.3664, lng: 73.7559 })).toBe(5000);
  });

  it('gives +XP once for a side quest the app has shown, and counts it', async () => {
    const u = await signUp();
    const id = 'ChIJ-quest-sunrise-point';
    expect((await api().post(`/api/v1/google/spots/${id}/visit`).set(auth(u.token))).status).toBe(404); // never shown

    g.details.mockResolvedValue(spot(id, 'Sunrise Point', 'tourist_attraction'));
    const page = await api().get(`/api/v1/google/spots/${id}`).set(auth(u.token));
    expect(page.body.data).toMatchObject({ available: true, name: 'Sunrise Point', xp: 10, hours: ['Monday: 8:00 AM – 6:30 PM'], visitedAt: null });

    expect((await api().post(`/api/v1/google/spots/${id}/visit`)).status).toBe(401);
    const first = await api().post(`/api/v1/google/spots/${id}/visit`).set(auth(u.token));
    expect(first.body.data).toMatchObject({ googleId: id, firstVisit: true, xpAwarded: 10, totalXp: 10 });
    const again = await api().post(`/api/v1/google/spots/${id}/visit`).set(auth(u.token));
    expect(again.body.data).toMatchObject({ firstVisit: false, xpAwarded: 0, totalXp: 10 });

    const visited = await api().get(`/api/v1/google/spots/${id}`).set(auth(u.token));
    expect(visited.body.data.visitedAt).toBe(first.body.data.visitedAt);
    const stamps = await api().get('/api/v1/users/me/stamps').set(auth(u.token));
    expect(stamps.body.data.sideQuests).toBe(1);
    expect((await api().get('/api/v1/google/spots/bad id!')).status).toBe(400);
  });

  it('redirects to a photo, or 404s when it is unavailable', async () => {
    g.photoUri.mockResolvedValueOnce('https://lh3.googleusercontent.com/photo-abc');
    const name = 'places/ChIJ-test-shaniwar-wada/photos/AbCdEfGhIjKlMn';
    const res = await api().get('/api/v1/google/photo').query({ name, w: 400 });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://lh3.googleusercontent.com/photo-abc');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(g.photoUri).toHaveBeenCalledWith(name, 400);

    budget.mockResolvedValueOnce(false);
    expect((await api().get('/api/v1/google/photo').query({ name })).status).toBe(404);
    // Only Google photo names: nothing else can be fetched through the server
    expect((await api().get('/api/v1/google/photo').query({ name: '../../v1/places:searchText' })).status).toBe(400);
  });
});

describe('google daily budget', () => {
  it('reads caps from config', () => {
    expect(parseCaps('details=230, nearby=10,photo=0,bogus=5,details2=x')).toEqual({ details: 230, nearby: 10, photo: 0 });
  });
});
