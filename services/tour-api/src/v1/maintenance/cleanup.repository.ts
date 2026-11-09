import { prisma } from '../../lib/prisma';

const DAY = 24 * 60 * 60_000;
const ago = (now: Date, days: number) => new Date(now.getTime() - days * DAY);

/**
 * What the privacy policy says we stop keeping, one rule per table. SOS events are never here:
 * they are kept until the account is deleted.
 */
export const cleanupRules = (now: Date) => {
  const day = ago(now, 1);
  const month = ago(now, 30);
  const otp = { expiresAt: { lt: day } };
  const reset = { OR: [{ expiresAt: { lt: day } }, { usedAt: { lt: day } }] };
  const sessions = { OR: [{ expiresAt: { lt: month } }, { revokedAt: { lt: month } }] };
  // Ended trips, and ones never ended (phone lost or app removed) that started long ago
  const trips = { OR: [{ endedAt: { lt: month } }, { endedAt: null, startedAt: { lt: month } }] };
  const sms = { createdAt: { lt: ago(now, 90) } };
  const waitlist = { notifiedAt: { lt: month } };
  return [
    { name: 'login codes', count: () => prisma.otpCode.count({ where: otp }), remove: () => prisma.otpCode.deleteMany({ where: otp }) },
    { name: 'password resets', count: () => prisma.passwordReset.count({ where: reset }), remove: () => prisma.passwordReset.deleteMany({ where: reset }) },
    { name: 'sessions', count: () => prisma.refreshToken.count({ where: sessions }), remove: () => prisma.refreshToken.deleteMany({ where: sessions }) },
    { name: 'trip shares', count: () => prisma.tripShare.count({ where: trips }), remove: () => prisma.tripShare.deleteMany({ where: trips }) },
    { name: 'text delivery records', count: () => prisma.smsMessage.count({ where: sms }), remove: () => prisma.smsMessage.deleteMany({ where: sms }) },
    { name: 'waitlist emails', count: () => prisma.waitlistEntry.count({ where: waitlist }), remove: () => prisma.waitlistEntry.deleteMany({ where: waitlist }) },
  ];
};
