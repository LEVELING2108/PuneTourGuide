import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import placeRoutes from './routes/placeRoutes';
import eventRoutes from './routes/eventRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import userRoutes from './routes/userRoutes';
import weatherRoutes from './routes/weatherRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure secure helmet headers with custom CSP for Leaflet maps and Google Fonts in production
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.basemaps.cartocdn.com",
          "https://*.tile.openstreetmap.org",
        ],
        connectSrc: ["'self'", "https://router.project-osrm.org"],
      },
    } : false,
  })
);

app.use(cors());
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`, req.body);
  next();
});

// Routes
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Pune Tour Guide API is running' });
});

// Serve static assets in production if frontend build exists
const distPath = path.join(__dirname, '../../dist');
const distExists = fs.existsSync(distPath);

if (process.env.NODE_ENV === 'production' && distExists) {
  app.use(express.static(distPath));
  
  // Catch-all route to serve the React SPA
  app.get(/.*/, (req: Request, res: Response) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // Catch-all welcome route for API-only setups
  app.get(/.*/, (req: Request, res: Response) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.send(`Pune Tour Guide API is running (${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} API-Only Mode)`);
    }
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
