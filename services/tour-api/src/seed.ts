import { env } from './config/env';
import { prisma } from './lib/prisma';
import { seedCatalogue } from './seed/run';

/**
 * Seeds the curated catalogue, curated routes and events.
 * Safe to re-run: places/routes are upserted by name/slug; users and OSM places are never touched.
 */
async function main() {
  if (env.isProd && !process.argv.includes('--force')) {
    console.log('Refusing to seed production without --force');
    return;
  }
  const { places, routes } = await seedCatalogue();
  console.log(`Seeded ${places} curated places, ${routes} routes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
