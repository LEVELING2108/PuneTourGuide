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
