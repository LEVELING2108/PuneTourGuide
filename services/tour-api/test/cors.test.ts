import express from 'express';
import cors from 'cors';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { corsOrigin } from '../src/app';
import { errorHandler } from '../src/middleware/errorHandler';

// The production rule, on a small app (tests run in development, where every origin is allowed)
const site = express();
site.use(cors({ origin: corsOrigin(['https://puneexplorer.dev', 'https://app.puneexplorer.dev'], true), credentials: true }));
site.post('/api/v1/waitlist', (_req, res) => res.status(201).json({ data: { joined: true } }));
site.use(errorHandler);

describe('CORS in production', () => {
  it('lets the listed sites, and requests without an Origin, through', async () => {
    for (const origin of ['https://puneexplorer.dev', 'https://app.puneexplorer.dev']) {
      const r = await request(site).post('/api/v1/waitlist').set('Origin', origin);
      expect(r.status).toBe(201);
      expect(r.headers['access-control-allow-origin']).toBe(origin);
    }
    expect((await request(site).post('/api/v1/waitlist')).status).toBe(201);
  });

  it('refuses any other site with 403, not a server error', async () => {
    const r = await request(site).post('/api/v1/waitlist').set('Origin', 'https://evil.example');
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe('ORIGIN_NOT_ALLOWED');
  });
});
