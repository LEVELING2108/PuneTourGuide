import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { seedCatalogue } from '../src/seed/run';
import { invalidateCache } from '../src/services/cacheService';
import { helpRepo } from '../src/v1/help/help.repository';
import { cleanPhone, dedupe, inHelpArea, toHelpRow } from '../src/v1/help/help.service';
import { api } from './helpers';

describe('OSM → help rows', () => {
  it('keeps named hospitals, clinics, police and fire stations', () => {
    const row = toHelpRow({
      type: 'way',
      id: 42,
      center: { lat: 18.52, lon: 73.85 },
      tags: { amenity: 'hospital', name: 'Surya Sahyadri Hospital', emergency: 'yes', phone: '+91 20 2457 4232; 020 1111', 'addr:street': 'Kasba Peth' },
    });
    expect(row).toEqual({
      osmId: 'way/42',
      name: 'Surya Sahyadri Hospital',
      category: 'hospital',
      emergency: true,
      phone: '+912024574232',
      address: 'Kasba Peth',
      lat: 18.52,
      lng: 73.85,
    });
  });

  it('skips unnamed points and other amenities', () => {
    expect(toHelpRow({ type: 'node', id: 1, lat: 18.5, lon: 73.8, tags: { amenity: 'hospital' } })).toBeNull();
    expect(toHelpRow({ type: 'node', id: 2, lat: 18.5, lon: 73.8, tags: { amenity: 'cafe', name: 'Vaishali' } })).toBeNull();
  });

  it('treats maternity, eye and dental hospitals as clinics', () => {
    const t = (name: string, extra: Record<string, string> = {}) =>
      toHelpRow({ type: 'node', id: 3, lat: 18.5, lon: 73.8, tags: { amenity: 'hospital', name, ...extra } })?.category;
    expect(t('Kamaladevi Maternity Hospital')).toBe('clinic');
    expect(t('Pune Eye Hospital')).toBe('clinic');
    expect(t('Smile Dental Hospital')).toBe('clinic');
    expect(t('Metro Chemist')).toBe('clinic');
    expect(t('Sai Diagnostic Centre')).toBe('clinic');
    expect(t('Morya Multispeciality Hospital')).toBe('hospital');
    expect(t('City Maternity Hospital', { emergency: 'yes' })).toBe('hospital');
  });

  it('merges the point and building of one hospital, keeping the fullest record', () => {
    const base = { category: 'hospital', emergency: false, phone: null, address: null, lat: 18.52, lng: 73.85 };
    const out = dedupe([
      { ...base, osmId: 'node/1', name: 'Umarji Hospital' },
      { ...base, osmId: 'way/2', name: 'Umarji Hospital', address: '351 Shukrawar Peth', lat: 18.5205 },
      { ...base, osmId: 'node/3', name: 'Umarji Hospital', lat: 18.6 }, // a different branch 9 km away
    ]);
    expect(out).toHaveLength(2);
    expect(out.find((r) => r.lat < 18.55)?.address).toBe('351 Shukrawar Peth');
  });

  it('only keeps dialable phone numbers', () => {
    expect(cleanPhone('020-2612 6000')).toBe('02026126000');
    expect(cleanPhone('call reception')).toBeNull();
    expect(cleanPhone(undefined)).toBeNull();
  });
});

describe('help areas imported nightly', () => {
  it('cover Pune district and the highways out of it, not other cities', () => {
    const covered = {
      'Shaniwar Wada': [18.519, 73.855],
      Lonavala: [18.75, 73.41],
      Bhimashankar: [19.07, 73.54],
      Mahabaleshwar: [17.92, 73.66],
      Baramati: [18.15, 74.58],
      'Panvel (Expressway)': [18.99, 73.11],
      Satara: [17.68, 74.0],
      'Sangamner (NH60)': [19.57, 74.21],
      Nashik: [20.0, 73.79],
    };
    for (const [name, [lat, lng]] of Object.entries(covered)) expect(inHelpArea(lat, lng), name).toBe(true);
    expect(inHelpArea(19.07, 72.87)).toBe(false); // Mumbai city
    expect(inHelpArea(16.7, 74.24)).toBe(false); // Kolhapur
  });
});

describe('GET /help', () => {
  beforeAll(async () => {
    await prisma.helpPlace.deleteMany();
    await invalidateCache('tour:*');
  });
  // Other suites expect the bootstrap hospitals, so leave no imported points behind.
  afterAll(async () => {
    await prisma.helpPlace.deleteMany();
    await invalidateCache('tour:*');
  });

  it('reports not covered before any import, so the app uses the live service', async () => {
    const res = await api().get('/api/v1/help?near=18.519,73.855');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ covered: false, items: [] });
  });

  it('lists trauma care first, then nearest, and updates each place’s nearest hospital', async () => {
    const seenAt = new Date();
    await helpRepo.upsertMany(
      [
        { osmId: 'node/1', name: 'Kasba Police Chowki', category: 'police', emergency: false, phone: null, address: null, lat: 18.5195, lng: 73.8555 },
        { osmId: 'node/2', name: 'Near Clinic', category: 'clinic', emergency: false, phone: null, address: null, lat: 18.5196, lng: 73.8556 },
        { osmId: 'node/3', name: 'Small Hospital', category: 'hospital', emergency: false, phone: '02020000000', address: null, lat: 18.522, lng: 73.857 },
        { osmId: 'node/4', name: 'Trauma Centre', category: 'hospital', emergency: true, phone: '108', address: null, lat: 18.53, lng: 73.87 },
      ],
      seenAt
    );
    await invalidateCache('tour:help:*');
    const res = await api().get('/api/v1/help?near=18.519,73.855&limit=10');
    expect(res.body.data.covered).toBe(true);
    expect(res.body.data.items.map((h: { name: string }) => h.name)).toEqual(['Trauma Centre', 'Small Hospital', 'Kasba Police Chowki', 'Near Clinic']);
    expect(res.body.data.items[1].km).toBeGreaterThan(0);

    await seedCatalogue();
    const wada = await prisma.place.findFirstOrThrow({ where: { name: 'Shaniwar Wada' } });
    expect(['Small Hospital', 'Trauma Centre']).toContain(wada.nearestHospitalName);
  });

  it('is outside coverage away from Pune and validates input', async () => {
    expect((await api().get('/api/v1/help?near=19.07,72.87')).body.data.covered).toBe(false);
    expect((await api().get('/api/v1/help?near=abc')).status).toBe(400);
    expect((await api().get('/api/v1/help?near=18.5,73.8&radiusKm=500')).status).toBe(400);
  });

  it('a complete import removes points OSM no longer has', async () => {
    const later = new Date(Date.now() + 1000);
    await helpRepo.upsertMany(
      [{ osmId: 'node/4', name: 'Trauma Centre', category: 'hospital', emergency: true, phone: '108', address: null, lat: 18.53, lng: 73.87 }],
      later
    );
    await helpRepo.deleteNotSeen(later);
    expect(await prisma.helpPlace.count()).toBe(1);
  });
});
