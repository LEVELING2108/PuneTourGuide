import express from 'express';
import path from 'path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { landingSite } from '../src/lib/landingSite';

const dir = path.resolve(__dirname, '../../../apps/landing');
const site = express();
site.use(landingSite({ host: 'puneexplorer.dev', appUrl: 'https://app.puneexplorer.dev', dir }));
site.use((req, res) => res.json({ reachedApp: true, path: req.path }));

const get = (p: string, host = 'puneexplorer.dev') => request(site).get(p).set('Host', host);

describe('landing host', () => {
  it('shows the landing page at the root, re-checked on every visit', async () => {
    const r = await get('/');
    expect(r.status).toBe(200);
    expect(r.text).toContain('Pune Explorer: see more of Pune');
    expect(r.headers['cache-control']).toBe('no-cache');
  });

  it('serves the landing files', async () => {
    expect((await get('/styles.css')).status).toBe(200);
    expect((await get('/robots.txt')).status).toBe(200);
    expect((await get('/img/icon-192.png')).headers['cache-control']).toContain('max-age=604800');
  });

  it('serves the bridge for old installs, and its offline SOS page', async () => {
    const sw = await get('/sw.js');
    expect(sw.status).toBe(200);
    expect(sw.text).toContain('/sos-offline.html');
    expect(sw.headers['cache-control']).toBe('no-cache');
    const page = await get('/sos-offline.html');
    expect(page.text).toContain('href="tel:112"');
    expect((await get('/sos-offline.js')).text).toContain('pe_sos_contacts');
  });

  it('moves old app links to the same path on the app host', async () => {
    for (const p of ['/track/abc-123', '/reset?token=xyz', '/privacy', '/sos', '/login']) {
      const r = await get(p);
      expect(r.status).toBe(301);
      expect(r.headers.location).toBe(`https://app.puneexplorer.dev${p}`);
    }
  });

  it('keeps the API on the old host, for installed copies and test builds', async () => {
    const r = await get('/api/v1/places');
    expect(r.body).toEqual({ reachedApp: true, path: '/api/v1/places' });
    const post = await request(site).post('/api/v1/waitlist').set('Host', 'puneexplorer.dev').send({});
    expect(post.body.reachedApp).toBe(true);
  });

  it('leaves the app host alone', async () => {
    expect((await get('/', 'app.puneexplorer.dev')).body).toEqual({ reachedApp: true, path: '/' });
    expect((await get('/sw.js', 'app.puneexplorer.dev')).body).toEqual({ reachedApp: true, path: '/sw.js' });
  });

  it('refuses a setup that would redirect every page to itself', () => {
    expect(() => landingSite({ host: 'puneexplorer.dev', appUrl: 'https://puneexplorer.dev', dir })).toThrow(/must differ/);
  });
});
