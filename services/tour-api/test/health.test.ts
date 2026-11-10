import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('reports the API is up', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('request ids', () => {
  it('gives every response an id for matching logs', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("keeps the load balancer's id when it is well formed", async () => {
    const res = await request(app).get('/api/health').set('X-Request-Id', 'lb-abc12345');
    expect(res.headers['x-request-id']).toBe('lb-abc12345');
  });

  it('ignores an id that could inject into logs', async () => {
    const res = await request(app).get('/api/health').set('X-Request-Id', 'bad id\twith spaces');
    expect(res.headers['x-request-id']).not.toContain(' ');
  });
});

describe('security headers', () => {
  it('send only our origin to other sites (map tile keys check it), never paths', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it("let Google's sign-in popup hand the sign-in back to the page", async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin-allow-popups');
  });
});
