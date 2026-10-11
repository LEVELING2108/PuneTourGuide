import { Router } from 'express';
import { sharedRedis } from '../../services/cacheService';
import { pingDb } from './health.repository';

const router = Router();

/** Liveness: the process is up. Load balancers restart the instance if this fails. */
router.get('/live', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

/**
 * Readiness: this instance can serve traffic. Postgres is required; Redis is
 * reported but optional (the API degrades to per-instance memory without it).
 */
router.get('/ready', async (_req, res) => {
  const db = await pingDb().then(
    () => true,
    () => false
  );
  const redis = !!sharedRedis();
  res.status(db ? 200 : 503).json({ data: { status: db ? 'ready' : 'unavailable', db, redis } });
});

export default router;
