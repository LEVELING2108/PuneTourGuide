import { Router } from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import authRoutes from './auth/auth.routes';
import itineraryRoutes from './itinerary/itinerary.routes';
import miscRoutes from './misc.routes';
import placesRoutes from './places/places.routes';
import routesRoutes from './routes.routes';
import usersRoutes from './users/users.routes';

/** /api/v1: { data, meta } envelopes, Zod-validated inputs, typed errors. */
const v1 = Router();

v1.use('/auth', authRoutes);
v1.use('/users', usersRoutes);
v1.use('/places', placesRoutes);
v1.use('/routes', routesRoutes);
v1.use('/itinerary', itineraryRoutes);
v1.use('/', miscRoutes);

v1.use(notFoundHandler);
v1.use(errorHandler);

export default v1;
