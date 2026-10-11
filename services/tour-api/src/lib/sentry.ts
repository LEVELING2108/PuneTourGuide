import * as Sentry from '@sentry/node';
import { env } from '../config/env';

/**
 * Error reporting (TECH_DESIGN §12). Off unless SENTRY_DSN is set.
 * Reports carry the error, stack, route and user id only: no bodies, headers, cookies,
 * query strings or IP addresses, so tokens, OTPs, phone numbers and medical data never leave.
 */
export function initSentry() {
  if (!env.SENTRY_DSN || env.isTest) return false;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    release: env.SENTRY_RELEASE ?? env.RENDER_GIT_COMMIT,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrub,
    beforeBreadcrumb: (b) => (b.category === 'console' || b.category === 'http' ? null : b),
  });
  return true;
}

export function scrub<T extends Sentry.ErrorEvent>(event: T): T {
  if (event.request) {
    event.request = { method: event.request.method, url: event.request.url?.split('?')[0] };
  }
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
  delete event.extra;
  return event;
}

export const captureError = (err: unknown, userId?: number) => {
  if (!Sentry.isInitialized()) return;
  Sentry.withScope((scope) => {
    if (userId) scope.setUser({ id: String(userId) });
    Sentry.captureException(err);
  });
};

export const flushSentry = () => (Sentry.isInitialized() ? Sentry.close(2000) : Promise.resolve(true));
