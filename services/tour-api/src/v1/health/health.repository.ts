import { prisma } from '../../lib/prisma';

/** Cheapest round-trip that proves the pool can reach Postgres. */
export const pingDb = async () => {
  await prisma.$queryRaw`SELECT 1`;
};
