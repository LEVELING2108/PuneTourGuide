import { prisma } from '../../lib/prisma';

export const notifyRepo = {
  /** One delivery-log row per message (masked number only). */
  createLog: (data: { userId: number | null; kind: string; toMasked: string; provider: string }) =>
    prisma.smsMessage.create({ data, select: { id: true } }),

  markSent: (id: number, providerId: string | null, attempts: number) =>
    prisma.smsMessage.update({ where: { id }, data: { status: 'sent', providerId, attempts, sentAt: new Date(), error: null } }),

  markFailed: (id: number, error: string, attempts: number, final: boolean) =>
    prisma.smsMessage.update({ where: { id }, data: { status: final ? 'failed' : 'queued', error: error.slice(0, 300), attempts } }),

  /** Delivery summary for an SOS / trip / test fan-out. */
  statuses: (ids: number[]) => prisma.smsMessage.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } }),
};
