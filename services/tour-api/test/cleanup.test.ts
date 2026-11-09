import { randomUUID } from 'crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { runCleanup } from '../src/v1/maintenance/cleanup.service';
import { resetUsers, signUp } from './helpers';

const DAY = 24 * 60 * 60_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const inDays = (n: number) => new Date(Date.now() + n * DAY);

beforeEach(async () => {
  await resetUsers();
  await prisma.waitlistEntry.deleteMany();
});

/** One row past its retention period and one still inside it, in every cleaned table, plus SOS events. */
async function seed() {
  const { user } = await signUp();
  const userId = user.id as number;
  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.otpCode.createMany({
    data: [
      { phone: '+919800000001', codeHash: 'x', expiresAt: daysAgo(2) },
      { phone: '+919800000002', codeHash: 'x', expiresAt: inDays(1) },
    ],
  });
  await prisma.passwordReset.createMany({
    data: [
      { userId, tokenHash: 'old-expired', expiresAt: daysAgo(2) },
      { userId, tokenHash: 'old-used', expiresAt: inDays(1), usedAt: daysAgo(2) },
      { userId, tokenHash: 'live', expiresAt: inDays(1) },
    ],
  });
  await prisma.refreshToken.createMany({
    data: [
      { userId, tokenHash: 'expired-long-ago', expiresAt: daysAgo(31) },
      { userId, tokenHash: 'revoked-long-ago', expiresAt: inDays(5), revokedAt: daysAgo(31) },
      { userId, tokenHash: 'revoked-recently', expiresAt: inDays(5), revokedAt: daysAgo(3) },
      { userId, tokenHash: 'live', expiresAt: inDays(20) },
    ],
  });
  await prisma.tripShare.createMany({
    data: [
      { userId, sessionId: randomUUID(), startedAt: daysAgo(40), endedAt: daysAgo(31) },
      { userId, sessionId: randomUUID(), startedAt: daysAgo(40) },
      { userId, sessionId: randomUUID(), startedAt: daysAgo(10), endedAt: daysAgo(9) },
      { userId, sessionId: randomUUID() },
    ],
  });
  await prisma.smsMessage.createMany({
    data: [
      { userId, kind: 'test', toMasked: '+91•••••58', provider: 'console', createdAt: daysAgo(91) },
      { userId, kind: 'test', toMasked: '+91•••••58', provider: 'console', createdAt: daysAgo(89) },
    ],
  });
  await prisma.waitlistEntry.createMany({
    data: [
      { email: 'notified-long-ago@example.com', notifiedAt: daysAgo(31) },
      { email: 'notified-recently@example.com', notifiedAt: daysAgo(5) },
      { email: 'waiting@example.com' },
    ],
  });
  await prisma.sosEvent.create({ data: { userId, sessionId: randomUUID(), idempotencyKey: randomUUID(), startedAt: daysAgo(400) } });
}

const counts = async () => ({
  otp: await prisma.otpCode.count(),
  resets: await prisma.passwordReset.count(),
  sessions: await prisma.refreshToken.count(),
  trips: await prisma.tripShare.count(),
  sms: await prisma.smsMessage.count(),
  waitlist: await prisma.waitlistEntry.count(),
  sos: await prisma.sosEvent.count(),
});

describe('nightly cleanup', () => {
  it('deletes only what is past its retention period, and never SOS events', async () => {
    await seed();
    const results = await runCleanup();
    expect(results.every((r) => !r.error)).toBe(true);
    expect(Object.fromEntries(results.map((r) => [r.name, r.rows]))).toEqual({
      'login codes': 1,
      'password resets': 2,
      sessions: 2,
      'trip shares': 2,
      'text delivery records': 1,
      'waitlist emails': 1,
    });
    expect(await counts()).toEqual({ otp: 1, resets: 1, sessions: 2, trips: 2, sms: 1, waitlist: 2, sos: 1 });
    expect((await prisma.waitlistEntry.findMany({ orderBy: { email: 'asc' }, select: { email: true } })).map((r) => r.email)).toEqual([
      'notified-recently@example.com',
      'waiting@example.com',
    ]);
  });

  it('only counts on a dry run', async () => {
    await seed();
    const before = await counts();
    const results = await runCleanup({ dryRun: true });
    expect(results.reduce((n, r) => n + (r.rows ?? 0), 0)).toBe(9);
    expect(await counts()).toEqual(before);
  });

  it('is safe to run again', async () => {
    await seed();
    await runCleanup();
    expect((await runCleanup()).every((r) => r.rows === 0)).toBe(true);
  });
});
