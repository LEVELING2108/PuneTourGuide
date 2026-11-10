import { beforeEach, describe, expect, it } from 'vitest';
import { api, auth, resetUsers, signUp } from './helpers';

describe('users/me', () => {
  beforeEach(resetUsers);

  it('requires a token', async () => {
    const res = await api().get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the profile with level info', async () => {
    const u = await signUp({ name: 'Sourav' });
    const res = await api().get('/api/v1/users/me').set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Sourav', xp: 0, level: 1, levelName: 'Newcomer', nextLevelName: 'Wanderer' });
  });

  it('updates settings, interests and theme', async () => {
    const u = await signUp();
    const res = await api()
      .patch('/api/v1/users/me')
      .set(auth(u.token))
      .send({ name: 'Sourav Suman', interests: ['Heritage', 'Food'], theme: 'deccan', language: 'mr', shakeToSos: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: 'Sourav Suman',
      interests: ['Heritage', 'Food'],
      theme: 'deccan',
      language: 'mr',
      shakeToSos: false,
    });
  });

  it('validates the patch', async () => {
    const u = await signUp();
    const bad = await api().patch('/api/v1/users/me').set(auth(u.token)).send({ theme: 'neon' });
    expect(bad.status).toBe(400);
    const unknown = await api().patch('/api/v1/users/me').set(auth(u.token)).send({ xp: 5000 });
    expect(unknown.status).toBe(400);
  });

  it('will not take an email that belongs to another account', async () => {
    const a = await signUp();
    const b = await signUp();
    const res = await api().patch('/api/v1/users/me').set(auth(b.token)).send({ email: a.email });
    expect(res.status).toBe(409);
  });

  it('returns stats', async () => {
    const u = await signUp();
    const res = await api().get('/api/v1/users/me/stats').set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ xp: 0, stamps: 0, placesVisited: 0, savedPlaces: 0 });
  });
});

describe('delete account', () => {
  beforeEach(resetUsers);

  it('erases the account and everything in it after typing DELETE', async () => {
    const { prisma } = await import('../src/lib/prisma');
    const { randomUUID } = await import('crypto');
    const u = await signUp();
    await api().post('/api/v1/contacts').set(auth(u.token)).send({ name: 'Aai', relation: 'Parent', phone: '9876543210' });
    await api().put('/api/v1/medical').set(auth(u.token)).send({ bloodGroup: 'B+', allergies: 'Penicillin', medicines: '', notes: '', showOnLockScreen: true });
    await api()
      .post('/api/v1/sos/alert')
      .set(auth(u.token))
      .set('Idempotency-Key', randomUUID())
      .send({ sessionId: randomUUID(), lat: 18.5195, lng: 73.8553 });
    const me = await api().get('/api/v1/users/me').set(auth(u.token));
    const id = me.body.data.id as number;
    expect(await prisma.sosEvent.count({ where: { userId: id } })).toBe(1);
    const sosTotal = await prisma.sosEvent.count();

    expect((await api().delete('/api/v1/users/me').set(auth(u.token)).send({})).status).toBe(400);
    expect((await api().delete('/api/v1/users/me').send({ confirm: 'DELETE' })).status).toBe(401);

    const del = await api().delete('/api/v1/users/me').set(auth(u.token)).set('Cookie', u.cookie).send({ confirm: 'DELETE' });
    expect(del.status).toBe(200);
    expect((del.headers['set-cookie'] as unknown as string[]).join(' ')).toMatch(/pe_rt=;/);

    // Nothing of theirs is left, including the SOS location
    const left = await Promise.all([
      prisma.user.count({ where: { id } }),
      prisma.emergencyContact.count({ where: { userId: id } }),
      prisma.medicalProfile.count({ where: { userId: id } }),
      prisma.refreshToken.count({ where: { userId: id } }),
      prisma.sosEvent.count({ where: { userId: id } }),
    ]);
    expect(left).toEqual([0, 0, 0, 0, 0]);
    expect(await prisma.sosEvent.count()).toBe(sosTotal - 1);
    expect((await api().post('/api/v1/auth/login').send({ email: u.email, password: u.password })).status).toBe(401);
  });
});
