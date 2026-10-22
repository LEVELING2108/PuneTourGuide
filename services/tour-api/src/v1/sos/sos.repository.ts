import { prisma } from '../../lib/prisma';

export const sosRepo = {
  byKey: (idempotencyKey: string) => prisma.sosEvent.findUnique({ where: { idempotencyKey } }),

  /** Insert once per Idempotency-Key; a concurrent retry gets the existing row. */
  async createOnce(data: { userId: number | null; sessionId: string; idempotencyKey: string; lat: number | null; lng: number | null }) {
    try {
      return { event: await prisma.sosEvent.create({ data }), created: true };
    } catch (err) {
      if ((err as { code?: string }).code !== 'P2002') throw err;
      return { event: (await prisma.sosEvent.findUniqueOrThrow({ where: { idempotencyKey: data.idempotencyKey } })), created: false };
    }
  },

  setAlerted: (id: number, contactsAlerted: number) => prisma.sosEvent.update({ where: { id }, data: { contactsAlerted } }),

  /** Cancel once; returns null if it was already cancelled. */
  async cancel(id: number) {
    const r = await prisma.sosEvent.updateMany({ where: { id, cancelledAt: null }, data: { cancelledAt: new Date() } });
    return r.count === 1;
  },

  /** What an alert needs about the sender: name, contacts and the medical profile (still encrypted). */
  sender: (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        contacts: { select: { name: true, phone: true, isPrimary: true }, orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        medical: { select: { bloodGroup: true, allergiesEnc: true, medicinesEnc: true, showOnLockScreen: true } },
      },
    }),

  // ── Live trip sharing ─────────────────────────────────────────
  createTrip: (data: { userId: number; sessionId: string }) => prisma.tripShare.create({ data }),
  tripBySession: (userId: number, sessionId: string) => prisma.tripShare.findFirst({ where: { userId, sessionId } }),
  activeTrip: (userId: number) => prisma.tripShare.findFirst({ where: { userId, endedAt: null }, orderBy: { startedAt: 'desc' } }),
  setTripNotified: (id: number, contactsNotified: number, smsLogIds: number[]) =>
    prisma.tripShare.update({ where: { id }, data: { contactsNotified, smsLogIds } }),
  endTrips: (userId: number, sessionId?: string) =>
    prisma.tripShare.updateMany({ where: { userId, endedAt: null, ...(sessionId ? { sessionId } : {}) }, data: { endedAt: new Date() } }),
};
