/**
 * Nightly cleanup: deletes what has passed its retention period (privacy policy, "How long we
 * keep it"). Safe to re-run. Logs counts only.
 *   npm run cleanup -w services/tour-api [-- --dry-run]
 * Production (cron, 22:00 UTC = 3:30 AM Pune): docker compose --env-file .env.production --profile jobs run --rm cleanup
 * CLEANUP_PING_URL (optional, Healthchecks.io) is pinged on start, success and failure.
 */
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { closeCache } from '../services/cacheService';
import { runCleanup } from '../v1/maintenance/cleanup.service';

const dryRun = process.argv.includes('--dry-run');
const ping = (suffix: string) =>
  env.CLEANUP_PING_URL && !dryRun ? fetch(`${env.CLEANUP_PING_URL}${suffix}`, { signal: AbortSignal.timeout(10_000) }).catch(() => undefined) : undefined;

async function main() {
  await ping('/start');
  const results = await runCleanup({ dryRun });
  for (const r of results) {
    if (r.error) logger.error(`[cleanup] ${r.name}: FAILED, ${r.error}`);
    else logger.info(`[cleanup] ${r.name}: ${dryRun ? 'would delete' : 'deleted'} ${r.rows}`);
  }
  const failed = results.filter((r) => r.error).length;
  if (failed) throw new Error(`${failed} of ${results.length} steps failed`);
}

main()
  .then(() => ping(''))
  .catch(async (err: Error) => {
    logger.error(`[cleanup] ${err.message}`);
    process.exitCode = 1;
    await ping('/fail');
  })
  .finally(async () => {
    await prisma.$disconnect();
    await closeCache();
  });
