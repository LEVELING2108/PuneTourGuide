import { Router } from 'express';
import { getWeather, toggleWeather } from '../controllers/weatherController';

const router = Router();

router.get('/', getWeather);
router.post('/toggle', toggleWeather);

export default router;
