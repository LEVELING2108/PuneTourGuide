import { PrismaClient } from '@prisma/client';

/** One Prisma client for the whole process. Only repositories should import this. */
export const prisma = new PrismaClient();
