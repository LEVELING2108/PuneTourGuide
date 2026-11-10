/**
 * Import hospitals, clinics, police and fire stations in Pune district and along the highways
 * out of it (help.service HELP_AREAS) from OpenStreetMap, and refresh each place's nearest
 * hospital. Safe to re-run; run nightly in production (cron / scheduled job).
 *
 *   npm run refresh:help
 */
import { prisma } from '../lib/prisma';
import { closeCache } from '../services/cacheService';
import { helpService } from '../v1/help/help.service';
import { logger } from '../lib/logger';

helpService
  .refresh((m) => logger.info(`[refresh:help] ${m}`))
  .then(() => (process.exitCode = 0))
  .catch((err: Error) => {
    logger.error(`[refresh:help] Failed, existing data kept.\n${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await closeCache();
  });
