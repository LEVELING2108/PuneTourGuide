import { prisma } from '../../lib/prisma';

/** One-time login codes and password-reset tokens (both stored only as hashes). */
export const otpRepo = {
  /** A new code replaces any older one for the phone. */
  replace: (phone: string, codeHash: string, expiresAt: Date) =>
    prisma.$transaction([prisma.otpCode.deleteMany({ where: { phone } }), prisma.otpCode.create({ data: { phone, codeHash, expiresAt } })]),
  latest: (phone: string) => prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' } }),
  /** Atomically count a guess; returns the new attempt count. */
  bumpAttempts: async (id: number) => (await prisma.otpCode.update({ where: { id }, data: { attempts: { increment: 1 } }, select: { attempts: true } })).attempts,
  clear: (phone: string) => prisma.otpCode.deleteMany({ where: { phone } }),
};

export const resetRepo = {
  replace: (userId: number, tokenHash: string, expiresAt: Date) =>
    prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId, usedAt: null } }),
      prisma.passwordReset.create({ data: { userId, tokenHash, expiresAt } }),
    ]),
  byHash: (tokenHash: string) => prisma.passwordReset.findUnique({ where: { tokenHash } }),
  /** Mark used once; false if it was already used (double submit / replay). */
  use: async (id: number) => (await prisma.passwordReset.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } })).count === 1,
};
