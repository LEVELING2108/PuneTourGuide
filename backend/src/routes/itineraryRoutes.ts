import { Router } from 'express';
import { getItinerary, toggleStopStatus, addStopToItinerary } from '../controllers/itineraryController';

const router = Router();

router.get('/', getItinerary);
router.patch('/stops/:id', toggleStopStatus);
router.post('/stops', addStopToItinerary);

export default router;
