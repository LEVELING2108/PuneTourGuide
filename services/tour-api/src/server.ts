import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { closeCache } from './services/cacheService';

const server = app.listen(env.PORT, () => {
  console.log(`Tour API listening on port ${env.PORT}`);
});

// Behind a load balancer: keep idle sockets open longer than the LB does (usually 60 s),
// and cap slow requests so a few stuck clients cannot hold every socket.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.requestTimeout = 30_000;

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Fatal] Port ${env.PORT} is already in use. Stop the other process first.`);
  } else {
    console.error('[Server Error]:', err);
  }
  process.exit(1);
});

// Graceful shutdown on deploys/scale-down: stop accepting, let in-flight requests
// finish, then close the DB pool and Redis. Force-exit if it takes too long.
let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Server] ${signal} received, draining connections`);
  setTimeout(() => process.exit(1), 15_000).unref();
  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), closeCache()]);
    process.exit(0);
  });
  server.closeIdleConnections();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason instanceof Error ? reason.message : 'unknown');
});
