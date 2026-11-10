import { Router } from 'express';
import { getUserStats, registerUser, loginUser, getUserMe } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserMe);
router.get('/stats', authMiddleware, getUserStats);

export default router;
