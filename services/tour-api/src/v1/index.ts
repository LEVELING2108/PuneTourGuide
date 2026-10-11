import { Router } from 'express';
import healthRoutes from './health/health.routes';
import contactsRoutes from './contacts/contacts.routes';
import medicalRoutes from './medical/medical.routes';
import offlineRoutes from './offline/offline.routes';
import helpRoutes from './help/help.routes';
import sosRoutes from './sos/sos.routes';
import routingRoutes from './routing/routing.routes';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import authRoutes from './auth/auth.routes';
import itineraryRoutes from './itinerary/itinerary.routes';
import miscRoutes from './misc.routes';
import placesRoutes from './places/places.routes';
import routesRoutes from './routes.routes';
import usersRoutes, { avatarRouter } from './users/users.routes';

/** /api/v1: { data, meta } envelopes, Zod-validated inputs, typed errors. */
const v1 = Router();

v1.use('/health', healthRoutes);

v1.use('/auth', authRoutes);
v1.use('/users', usersRoutes);
v1.use('/places', placesRoutes);
v1.use('/routes', routesRoutes);
v1.use('/itinerary', itineraryRoutes);
v1.use('/help', helpRoutes);
v1.use('/contacts', contactsRoutes);
v1.use('/medical', medicalRoutes);
v1.use('/offline-packs', offlineRoutes);
v1.use('/avatars', avatarRouter);
v1.use('/', sosRoutes);
v1.use('/', routingRoutes);
v1.use('/', miscRoutes);

v1.use(notFoundHandler);
v1.use(errorHandler);

export default v1;
