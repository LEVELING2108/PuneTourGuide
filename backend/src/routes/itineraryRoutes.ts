import { Router } from 'express';
import { getItinerary, toggleStopStatus, addStopToItinerary, deleteStopFromItinerary, optimizeItinerary } from '../controllers/itineraryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getItinerary);
router.patch('/stops/:id', toggleStopStatus);
router.post('/stops', addStopToItinerary);
router.delete('/stops/:id', deleteStopFromItinerary);
router.post('/optimize', optimizeItinerary);

export default router;
