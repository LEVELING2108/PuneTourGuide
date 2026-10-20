/**
 * Links each catalogue place to its Google Maps place id (the only Google data we store), so the
 * app can show live photos, ratings and opening hours. Uses Text Search "IDs only", which Google
 * doesn't charge for. Safe to re-run: only places without an id are looked up.
 *   npm run google:link -w services/tour-api
 * Check the printed matches; a wrong one can be fixed by hand in the Place table (googlePlaceId).
 */
import { googleConfigured, googlePlaces } from '../clients/googlePlaces';
import { prisma } from '../lib/prisma';
import { googleRepo } from '../v1/google/google.repository';

async function main() {
  if (!googleConfigured()) throw new Error('Set GOOGLE_MAPS_SERVER_KEY in services/tour-api/.env first');
  const places = await googleRepo.unlinked();
  console.log(`${places.length} place(s) to link`);
  for (const p of places) {
    const query = [p.name, p.area, 'Pune'].filter(Boolean).join(', ');
    const id = await googlePlaces.findPlaceId(query, { lat: p.latitude!, lng: p.longitude! });
    if (!id) {
      console.log(`  ✗ ${p.name}: no match`);
      continue;
    }
    try {
      await googleRepo.setGooglePlaceId(p.id, id);
      console.log(`  ✓ ${p.name} → ${id}`);
    } catch {
      // Unique: two of our places matched the same Google place
      console.log(`  ✗ ${p.name}: ${id} is already linked to another place`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
