import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import placeRoutes from './routes/placeRoutes';
import eventRoutes from './routes/eventRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import userRoutes from './routes/userRoutes';

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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Pune Tour Guide API is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  
  // Catch-all route to serve the React SPA
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // Development welcome route
  app.get('/', (req: Request, res: Response) => {
    res.send('Pune Tour Guide API is running (Development Mode)');
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
