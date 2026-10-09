/**
 * Import Pune's hospitals, clinics, police and fire stations from OpenStreetMap and refresh
 * each place's nearest hospital. Safe to re-run; run nightly in production (cron / scheduled job).
 *
 *   npm run refresh:help
 */
import { prisma } from '../lib/prisma';
import { closeCache } from '../services/cacheService';
import { helpService } from '../v1/help/help.service';

helpService
  .refresh((m) => console.log(`[refresh:help] ${m}`))
  .then(() => (process.exitCode = 0))
  .catch((err: Error) => {
    console.error(`[refresh:help] Failed, existing data kept.\n${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await closeCache();
  });
