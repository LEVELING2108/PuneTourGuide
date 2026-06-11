import { Router } from 'express';
import { getAllPlaces, getPlaceById, toggleSavePlace } from '../controllers/placeController';

const router = Router();

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.patch('/:id/save', toggleSavePlace);

export default router;
