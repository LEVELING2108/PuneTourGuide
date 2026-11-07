import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { invalidateCache } from '../src/services/cacheService';
import { api } from './helpers';

const join = (email: unknown) => api().post('/api/v1/waitlist').send({ email });

beforeEach(async () => {
  await prisma.waitlistEntry.deleteMany();
  await invalidateCache('tour:rl:waitlist:*');
});

describe('waitlist', () => {
  it('saves the email lower-cased', async () => {
    const r = await join('  Asha.Patil@Example.com ');
    expect(r.status).toBe(201);
    expect(r.body.data).toEqual({ joined: true });
    expect(await prisma.waitlistEntry.findMany({ select: { email: true } })).toEqual([{ email: 'asha.patil@example.com' }]);
  });

  it('gives the same answer for an email already listed, without a second row', async () => {
    await join('asha@example.com');
    const again = await join('ASHA@example.com');
    expect(again.status).toBe(201);
    expect(again.body.data).toEqual({ joined: true });
    expect(await prisma.waitlistEntry.count()).toBe(1);
  });

  it('refuses a bad email or extra fields', async () => {
    for (const body of [{ email: 'not-an-email' }, { email: `${'a'.repeat(250)}@x.in` }, {}, { email: 'a@b.in', name: 'x' }]) {
      expect((await api().post('/api/v1/waitlist').send(body)).status).toBe(400);
    }
    expect(await prisma.waitlistEntry.count()).toBe(0);
  });

  it('limits sign-ups per IP', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 21; i++) {
      statuses.push((await api().post('/api/v1/waitlist').set('X-Test-Rate-Limit', 'on').send({ email: `p${i}@example.com` })).status);
    }
    expect(statuses.slice(0, 20).every((s) => s === 201)).toBe(true);
    expect(statuses[20]).toBe(429);
  });
});
