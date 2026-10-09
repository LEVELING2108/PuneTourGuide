import { prisma } from '../lib/prisma';
import { nearestHospital, PLACES, ROUTES } from './catalogue';

const EVENTS = [
  { date: 'SAT · JUN 14', name: 'Sawai Gandharva Festival', desc: 'Classical music at Balgandharva Rang', color: 'terracotta' },
  { date: 'SUN · JUN 15', name: 'Pune Food Walk', desc: 'FC Road street eats tour', color: 'indigo' },
  { date: 'WED · JUN 18', name: 'Heritage Cycle Tour', desc: 'Morning cycle through Old Pune Peths', color: 'sage' },
];

async function seedPlaces() {
  const ids = new Map<string, number>();
  for (const p of PLACES) {
    const hospital = nearestHospital(p);
    const data = {
      name: p.name,
      name_mr: p.name_mr,
      category: p.category,
      kind: p.kind ?? null,
      area: p.area,
      address: p.area + ', Pune',
      latitude: p.lat,
      longitude: p.lng,
      description: p.description,
      description_mr: p.description_mr ?? null,
      hours: p.hours,
      opensAt: p.opensAt ?? null,
      closesAt: p.closesAt ?? null,
      entryFee: p.entryFee,
      free: p.free,
      visitMinutes: p.visitMinutes,
      visitTime: p.visitMinutes >= 60 ? `${Math.round((p.visitMinutes / 60) * 10) / 10} hr` : `${p.visitMinutes} min`,
      accessible: p.accessible ?? false,
      weakSignal: p.weakSignal ?? false,
      xp: p.xp,
      estYear: p.estYear ?? '',
      popularity: p.popularity,
      nearestHospitalName: hospital.name,
      nearestHospitalKm: hospital.km,
      curated: true,
    };
    const existing = await prisma.place.findFirst({ where: { name: p.name }, orderBy: { id: 'asc' } });
    const saved = existing
      ? await prisma.place.update({ where: { id: existing.id }, data })
      : await prisma.place.create({ data });
    ids.set(p.name, saved.id);
  }
  return ids;
}

async function seedRoutes(placeIds: Map<string, number>) {
  for (const r of ROUTES) {
    const { stops, ...fields } = r;
    const route = await prisma.route.upsert({ where: { slug: r.slug }, update: fields, create: fields });
    await prisma.routeStop.deleteMany({ where: { routeId: route.id } });
    await prisma.routeStop.createMany({
      data: stops.map((s, i) => {
        const placeId = placeIds.get(s.place);
        if (!placeId) throw new Error(`Route ${r.slug}: unknown place ${s.place}`);
        return { routeId: route.id, placeId, order: i, time: s.time };
      }),
    });
  }
}

async function seedEvents() {
  if ((await prisma.event.count()) > 0) return;
  await prisma.event.createMany({ data: EVENTS });
}

/** Idempotent: upserts curated places by name and routes by slug. */
export async function seedCatalogue() {
  const ids = await seedPlaces();
  await seedRoutes(ids);
  await seedEvents();
  return { places: ids.size, routes: ROUTES.length };
}
