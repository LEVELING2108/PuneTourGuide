/**
 * Launch day: print the waitlist emails not yet notified, one per line. After the launch email
 * has gone to exactly that list, mark it with the id the export printed, so those rows are
 * deleted 30 days later and anyone who signed up since is kept for the next send.
 *   npm run waitlist:export -w services/tour-api
 *   npm run waitlist:export -w services/tour-api -- --mark-notified <id>
 * Production: docker compose --env-file .env.production run --rm app node dist/scripts/waitlist-export.js
 * The list goes to stdout only; never paste it into logs, tickets or chats.
 */
import { prisma } from '../lib/prisma';
import { closeCache } from '../services/cacheService';
import { waitlistRepo } from '../v1/waitlist/waitlist.repository';

async function main() {
  const flag = process.argv.indexOf('--mark-notified');
  if (flag !== -1) {
    const upToId = Number(process.argv[flag + 1]);
    if (!Number.isInteger(upToId) || upToId < 1) throw new Error('--mark-notified needs the id printed by the export');
    const { count } = await waitlistRepo.markNotified(upToId);
    console.error(`[waitlist] marked ${count} as notified (up to id ${upToId})`);
    return;
  }
  const rows = await waitlistRepo.pending();
  for (const r of rows) console.log(r.email);
  const last = rows.at(-1)?.id;
  console.error(
    last ? `[waitlist] ${rows.length} not notified yet. After sending, run with --mark-notified ${last}` : '[waitlist] nobody waiting'
  );
}

main()
  .catch((err: Error) => {
    console.error(`[waitlist] Failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await closeCache();
  });
