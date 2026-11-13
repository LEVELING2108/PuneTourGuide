import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { env } from '../src/config/env';
import { api, auth, resetUsers, signUp } from './helpers';

beforeEach(resetUsers);

describe('pre-2.0 API removed', () => {
  it('no longer answers the old routes', async () => {
    for (const p of ['/api/places', '/api/places/1', '/api/events', '/api/itinerary', '/api/weather', '/api/user/me']) {
      expect((await api().get(p)).status).toBe(404);
    }
    for (const p of ['/api/user/login', '/api/user/register', '/api/itinerary/generate']) {
      expect((await api().post(p).send({ email: 'a@b.in', password: 'x', name: 'x' })).status).toBe(404);
    }
  });

  it('refuses the old 7-day login tokens on the current API', async () => {
    const u = await signUp();
    const old = jwt.sign({ id: u.user.id, email: u.email }, env.JWT_SECRET, { expiresIn: '7d' });
    expect((await api().get('/api/v1/users/me').set(auth(old))).status).toBe(401);
    expect((await api().get('/api/v1/users/me').set(auth(u.token))).status).toBe(200);
  });

  it('keeps the plain health check', async () => {
    expect((await api().get('/api/health')).status).toBe(200);
  });
});
