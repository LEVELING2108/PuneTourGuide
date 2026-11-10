import { Router } from 'express';
import { getAllPlaces, getPlaceById, toggleSavePlace } from '../controllers/placeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.patch('/:id/save', authMiddleware, toggleSavePlace);

export default router;
