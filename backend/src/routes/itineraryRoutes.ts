import { Router } from 'express';
import { getItinerary } from '../controllers/itineraryController';

const router = Router();

router.get('/', getItinerary);

export default router;
