import { Router } from 'express';
import { getUserStats } from '../controllers/userController';

const router = Router();

router.get('/stats', getUserStats);

export default router;
