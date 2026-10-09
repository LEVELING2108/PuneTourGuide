import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
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

const app = express();

app.set('trust proxy', 1);
app.use(compression());

// Secure headers with a CSP that allows map tiles and Google Fonts in production
app.use(
  helmet({
    contentSecurityPolicy: env.isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:', 'https://*.basemaps.cartocdn.com', 'https://*.tile.openstreetmap.org'],
            connectSrc: ["'self'", 'https://router.project-osrm.org'],
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

// Request logger: method + path only. Bodies can hold passwords, OTPs or medical data.
if (!env.isTest) {
  app.use((req, _res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });
}

// Rate limiting
app.use('/api', globalApiLimiter);
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

// Serve the built web app in production when it sits next to the API
const distPath = path.resolve(__dirname, '../../../apps/web/dist');

if (env.isProd && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req: Request, res: Response) => {
    if (!req.path.startsWith('/api/')) {
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
