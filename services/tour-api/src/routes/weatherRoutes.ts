import { Router } from 'express';
import { env } from '../config/env';
import { getWeather, toggleWeather } from '../controllers/weatherController';

const router = Router();

router.get('/', getWeather);
// Debug switch that overrides the shared weather for everyone: never exposed in production
if (!env.isProd) router.post('/toggle', toggleWeather);

export default router;
