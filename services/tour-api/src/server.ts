import './instrument';
import app from './app';
import { logger, errText } from './lib/logger';
import { flushSentry } from './lib/sentry';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { closeCache } from './services/cacheService';
import { closeSmsQueue, startSmsWorker } from './v1/notify/sms.queue';

// SMS worker runs in the API unless a dedicated worker process does it (RUN_WORKERS=false here).
if (process.env.RUN_WORKERS !== 'false') startSmsWorker();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'tour api listening');
});

// Behind a load balancer: keep idle sockets open longer than the LB does (usually 60 s),
// and cap slow requests so a few stuck clients cannot hold every socket.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.requestTimeout = 30_000;

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.fatal(`Port ${env.PORT} is already in use. Stop the other process first.`);
  } else {
    logger.fatal({ err: errText(err) }, 'server error');
  }
  process.exit(1);
});

// Graceful shutdown on deploys/scale-down: stop accepting, let in-flight requests
// finish, then close the DB pool and Redis. Force-exit if it takes too long.
let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'draining connections');
  setTimeout(() => process.exit(1), 15_000).unref();
  server.close(async () => {
    await Promise.allSettled([closeSmsQueue(), prisma.$disconnect(), closeCache(), flushSentry()]);
    process.exit(0);
  });
  server.closeIdleConnections();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: errText(reason) }, 'unhandled rejection');
});
