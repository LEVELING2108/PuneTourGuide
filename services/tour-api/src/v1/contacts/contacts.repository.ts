import { prisma } from '../../lib/prisma';

const select = { id: true, name: true, relation: true, phone: true, isPrimary: true, createdAt: true } as const;

export const contactsRepo = {
  list: (userId: number) =>
    prisma.emergencyContact.findMany({ where: { userId }, select, orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }] }),

  get: (userId: number, id: number) => prisma.emergencyContact.findFirst({ where: { id, userId }, select }),

  count: (userId: number) => prisma.emergencyContact.count({ where: { userId } }),

  byPhone: (userId: number, phone: string) => prisma.emergencyContact.findFirst({ where: { userId, phone }, select: { id: true } }),

  /** Create; a primary contact clears the old primary in the same transaction. */
  create: (userId: number, data: { name: string; relation: string; phone: string; isPrimary: boolean }) =>
    prisma.$transaction(async (tx) => {
      if (data.isPrimary) await tx.emergencyContact.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } });
      return tx.emergencyContact.create({ data: { ...data, userId }, select });
    }),

  update: (userId: number, id: number, data: { name?: string; relation?: string; phone?: string; isPrimary?: boolean }) =>
    prisma.$transaction(async (tx) => {
      if (data.isPrimary) await tx.emergencyContact.updateMany({ where: { userId, isPrimary: true, NOT: { id } }, data: { isPrimary: false } });
      return tx.emergencyContact.update({ where: { id }, data, select });
    }),

  /** Delete; if it was the primary, the oldest remaining contact becomes primary. */
  remove: (userId: number, id: number) =>
    prisma.$transaction(async (tx) => {
      const gone = await tx.emergencyContact.delete({ where: { id }, select });
      if (gone.isPrimary) {
        const next = await tx.emergencyContact.findFirst({ where: { userId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
        if (next) await tx.emergencyContact.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
      return gone;
    }),
};
