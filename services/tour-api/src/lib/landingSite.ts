import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';

type Options = { host: string; appUrl: string; dir: string };

/**
 * The landing host (puneexplorer.dev) shows the landing page; the app lives at APP_URL
 * (app.puneexplorer.dev). On the landing host:
 * - /api stays here: phones that installed the app from this address, and Android test builds, call it
 * - the landing's own files are served, including /sw.js: the bridge that replaces an old install's
 *   service worker with an offline page that can still call 112 and text the saved contacts
 * - any other path is an old app link (texted /track links, reset emails, bookmarks): it moves
 *   permanently to the same path on the app host
 * Other hosts pass straight through. Unset LANDING_HOST to go back to the app on one address.
 */
export function landingSite({ host, appUrl, dir }: Options) {
  const appOrigin = new URL(appUrl).origin;
  if (new URL(appUrl).hostname === host) throw new Error('LANDING_HOST must differ from the APP_URL host, or every page redirects to itself');
  const page = path.join(dir, 'index.html');
  // Fonts and images keep their names across releases only rarely: a week; pages and scripts re-check every visit
  const files = express.static(dir, {
    index: false,
    redirect: false,
    setHeaders: (res, file) => {
      const stable = ['fonts', 'img'].some((d) => file.includes(`${path.sep}${d}${path.sep}`));
      res.setHeader('Cache-Control', stable ? 'public, max-age=604800' : 'no-cache');
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.hostname !== host || req.path.startsWith('/api/')) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path === '/' || req.path === '/index.html') {
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(page);
    }
    files(req, res, () => res.redirect(301, `${appOrigin}${req.originalUrl}`));
  };
}
