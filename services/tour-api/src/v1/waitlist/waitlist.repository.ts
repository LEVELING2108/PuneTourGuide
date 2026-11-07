import { prisma } from '../../lib/prisma';

export const waitlistRepo = {
  /** Insert or ignore: a second sign-up with the same email changes nothing. */
  add: (email: string) => prisma.waitlistEntry.createMany({ data: [{ email }], skipDuplicates: true }),

  /** Everyone not emailed yet, oldest first (launch-day export). */
  pending: () => prisma.waitlistEntry.findMany({ where: { notifiedAt: null }, select: { id: true, email: true }, orderBy: { id: 'asc' } }),

  /** Only rows up to the last exported id, so a sign-up after the export is not marked as emailed. */
  markNotified: (upToId: number) =>
    prisma.waitlistEntry.updateMany({ where: { notifiedAt: null, id: { lte: upToId } }, data: { notifiedAt: new Date() } }),
};
