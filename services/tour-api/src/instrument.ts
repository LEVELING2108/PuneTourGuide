/** Imported first by server.ts and worker.ts so error reporting is on before anything else loads. */
import { initSentry } from './lib/sentry';

initSentry();
