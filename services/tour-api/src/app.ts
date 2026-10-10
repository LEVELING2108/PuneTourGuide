import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';
import { env } from './config/env';
import placeRoutes from './routes/placeRoutes';
import eventRoutes from './routes/eventRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import userRoutes from './routes/userRoutes';
import weatherRoutes from './routes/weatherRoutes';
import { globalApiLimiter, authLimiter, aiGenerationLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import v1 from './v1';
import { apiLimit } from './middleware/limits';
import { httpLogger } from './lib/logger';

const app = express();

// The built web app, served from here in production (same origin as the API)
const distPath = path.resolve(__dirname, '../../../apps/web/dist');
const serveWeb = env.isProd && fs.existsSync(distPath);

/**
 * Hashes of index.html's inline scripts (the theme-before-paint snippet), so the CSP can allow
 * exactly those instead of 'unsafe-inline'. Read from the build, so they always match it.
 */
function inlineScriptHashes() {
  if (!serveWeb) return [];
  // Browsers hash the script after turning CRLF into LF (HTML input normalisation)
  const html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8').replace(/\r\n?/g, '\n');
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`
  );
}

const tileOrigins = env.MAP_TILE_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

/** The safety service's own origin, when it is not proxied under /safety on this domain. */
function safetyOrigins() {
  if (!env.SAFETY_PUBLIC_URL) return [];
  const u = new URL(env.SAFETY_PUBLIC_URL);
  return [u.origin, `${u.protocol === 'https:' ? 'wss' : 'ws'}://${u.host}`];
}

app.set('trust proxy', 1);
app.use(compression());

// Secure headers with a CSP that allows map tiles and Google sign-in in production (fonts are self-hosted)
app.use(
  helmet({
    contentSecurityPolicy: env.isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            // Google Identity Services (sign in with Google) loads a script, a stylesheet and an iframe
            scriptSrc: ["'self'", ...inlineScriptHashes(), 'https://accounts.google.com/gsi/client'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/style'],
            frameSrc: ['https://accounts.google.com/gsi/'],
            fontSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', ...tileOrigins],
            // Tiles also appear here: offline packs download them with fetch()
            connectSrc: ["'self'", 'https://accounts.google.com/gsi/', 'wss:', 'https://*.sentry.io', ...tileOrigins, ...safetyOrigins()],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
          },
        }
      : false,
  })
);

const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5050', 'http://127.0.0.1:5050', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !env.isProd) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Request log: id, method, path and status only. Bodies can hold passwords, OTPs or medical data.
app.use(httpLogger);

// Rate limiting. The old app's tight per-IP ceiling covers only its own routes: on /api/v1 it
// would throttle everyone sharing a carrier IP (CGNAT). /api/v1 has its own limits.
app.use(['/api/places', '/api/events', '/api/itinerary', '/api/user', '/api/weather'], globalApiLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);
app.use('/api/itinerary/generate', aiGenerationLimiter);

// Pune Explorer API
app.use('/api/v1', apiLimit, v1);

// Legacy routes (kept working until the new screens move to /api/v1)
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Pune Explorer Tour API is running' });
});

// Serve the built web app in production when it sits next to the API.
// Hashed files under /assets never change: cache for a year. Everything else (index.html, sw.js,
// manifest) must be re-checked on every visit, or phones keep running an old release.
if (serveWeb) {
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, file) => {
        const immutable = file.includes(`${path.sep}assets${path.sep}`);
        res.setHeader('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    })
  );
  app.get(/.*/, (req: Request, res: Response) => {
    if (!req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  app.get(/.*/, (req: Request, res: Response) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.send(`Pune Explorer Tour API is running (${env.isProd ? 'Production' : 'Development'} API-only mode)`);
    }
  });
}

// Errors thrown before a router (e.g. malformed JSON)
app.use(errorHandler);

export default app;
