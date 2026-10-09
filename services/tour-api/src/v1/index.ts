import { Router } from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';

/** /api/v1: { data, meta } envelopes, Zod-validated inputs, typed errors. */
const v1 = Router();

v1.use('/auth', authRoutes);
v1.use('/users', usersRoutes);

v1.use(notFoundHandler);
v1.use(errorHandler);

export default v1;
