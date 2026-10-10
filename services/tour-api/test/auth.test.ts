import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetUsers, signUp } from './helpers';

const refreshCookie = (cookies: string[]) => cookies.find((c) => c.startsWith('pe_rt='))!.split(';')[0];

describe('auth (email)', () => {
  beforeEach(resetUsers);

  it('registers, returns an access token and sets an httpOnly refresh cookie', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ name: 'Asha', email: 'Asha@Example.com', password: 'Str0ng-pass', acceptTerms: true, theme: 'deccan' });
    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ name: 'Asha', email: 'asha@example.com', theme: 'deccan', hasPassword: true });
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.isNewUser).toBe(true);
    const cookie = (res.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('pe_rt='))!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
  });

  it('rejects registration without accepting terms', async () => {
    const res = await api().post('/api/v1/auth/register').send({ name: 'A', email: 'a@b.co', password: 'Str0ng-pass' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects unknown fields', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: 'a@b.co', password: 'Str0ng-pass', acceptTerms: true, xp: 99999 });
    expect(res.status).toBe(400);
  });

  it('refuses a duplicate email with 409', async () => {
    const u = await signUp();
    const res = await api().post('/api/v1/auth/register').send({ name: 'B', email: u.email, password: 'Str0ng-pass', acceptTerms: true });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('logs in and gives the same error for a wrong email or password', async () => {
    const u = await signUp();
    const good = await api().post('/api/v1/auth/login').send({ email: u.email, password: u.password });
    expect(good.status).toBe(200);
    expect(good.body.data.accessToken).toBeTruthy();

    const wrongPw = await api().post('/api/v1/auth/login').send({ email: u.email, password: 'nope-nope' });
    const wrongEmail = await api().post('/api/v1/auth/login').send({ email: 'ghost@example.com', password: 'nope-nope' });
    expect(wrongPw.status).toBe(401);
    expect(wrongEmail.status).toBe(401);
    expect(wrongPw.body.error).toEqual(wrongEmail.body.error);
  });

  it('rotates the refresh token and detects reuse of an old one', async () => {
    const u = await signUp();
    const first = refreshCookie(u.cookie);

    const r1 = await api().post('/api/v1/auth/refresh').set('Cookie', first);
    expect(r1.status).toBe(200);
    const second = refreshCookie(r1.headers['set-cookie'] as unknown as string[]);
    expect(second).not.toEqual(first);

    // Replaying the first token is treated as theft: everything is revoked
    const replay = await api().post('/api/v1/auth/refresh').set('Cookie', first);
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('REFRESH_REUSED');
    const afterTheft = await api().post('/api/v1/auth/refresh').set('Cookie', second);
    expect(afterTheft.status).toBe(401);
  });

  it('gives native clients the refresh token in the body', async () => {
    const u = await signUp();
    const res = await api().post('/api/v1/auth/login').set('X-Client', 'native').send({ email: u.email, password: u.password });
    expect(res.body.data.refreshToken).toBeTruthy();
    const r = await api().post('/api/v1/auth/refresh').set('X-Client', 'native').send({ refreshToken: res.body.data.refreshToken });
    expect(r.status).toBe(200);
  });

  it('logs out by revoking the refresh token', async () => {
    const u = await signUp();
    const cookie = refreshCookie(u.cookie);
    const out = await api().post('/api/v1/auth/logout').set('Cookie', cookie).set('Authorization', `Bearer ${u.token}`);
    expect(out.status).toBe(200);
    const again = await api().post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(again.status).toBe(401);
  });

  it('people sharing one IP (carrier CGNAT) never use up each other’s session refreshes', async () => {
    const people = await Promise.all(Array.from({ length: 4 }, () => signUp()));
    const cookies = people.map((u) => refreshCookie(u.cookie));
    const statuses: number[] = [];
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < cookies.length; i++) {
        const r = await api().post('/api/v1/auth/refresh').set('X-Test-Rate-Limit', 'on').set('Cookie', cookies[i]);
        statuses.push(r.status);
        cookies[i] = refreshCookie(r.headers['set-cookie'] as unknown as string[]);
      }
    }
    // 40 refreshes from one address, 10 per session: all fine
    expect(statuses.every((s) => s === 200)).toBe(true);
  });

  it('rate-limits repeated login attempts', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = await api().post('/api/v1/auth/login').set('X-Test-Rate-Limit', 'on').send({ email: 'limit@example.com', password: 'wrong-wrong' });
      statuses.push(r.status);
    }
    expect(statuses).toContain(429);
  });
});
