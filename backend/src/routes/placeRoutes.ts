import { Router } from 'express';
import { getAllPlaces, getPlaceById, toggleSavePlace } from '../controllers/placeController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthMiddleware, getAllPlaces);
router.get('/:id', optionalAuthMiddleware, getPlaceById);
router.patch('/:id/save', authMiddleware, toggleSavePlace);

export default router;
