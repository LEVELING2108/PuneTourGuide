/**
 * Dedicated background worker (SMS delivery). At scale, run this as its own process and set
 * RUN_WORKERS=false on the API instances:  npm run worker -w services/tour-api
 */
import { prisma } from './lib/prisma';
import { closeCache } from './services/cacheService';
import { closeSmsQueue, startSmsWorker } from './v1/notify/sms.queue';

startSmsWorker();
console.log('[worker] SMS worker started');

const stop = async () => {
  await Promise.allSettled([closeSmsQueue(), prisma.$disconnect(), closeCache()]);
  process.exit(0);
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
