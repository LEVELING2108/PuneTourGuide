import { Router } from 'express';
import { getItinerary, toggleStopStatus, addStopToItinerary, deleteStopFromItinerary } from '../controllers/itineraryController';

const router = Router();

router.get('/', getItinerary);
router.patch('/stops/:id', toggleStopStatus);
router.post('/stops', addStopToItinerary);
router.delete('/stops/:id', deleteStopFromItinerary);

export default router;
