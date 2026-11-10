/**
 * Crash reporting (TECH_DESIGN §12). Off unless VITE_SENTRY_DSN is set, and then loaded lazily
 * so it never slows the first paint or the SOS screen.
 *
 * Reports carry the error, stack and screen path only. URLs lose their query and hash
 * (reset tokens), tracking-session ids are replaced, breadcrumbs (fetch URLs, console,
 * navigation) are dropped, and no user details are sent.
 */
type SentryLike = typeof import('@sentry/browser');

const DSN = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || '';
let sentry: SentryLike | null = null;
const pending: unknown[] = [];

/** /track/9f1c…?x=1#y → /track/:id */
export const cleanUrl = (url = '') => url.split(/[?#]/)[0].replace(/\/track\/[^/]+/, '/track/:id').replace(/\/settings\/contacts\/\d+/, '/settings/contacts/:id');

type Event = { request?: { url?: string; headers?: unknown; cookies?: unknown; data?: unknown; query_string?: unknown }; user?: unknown; extra?: unknown };

export function scrubEvent<T extends Event>(event: T): T {
  if (event.request) event.request = { url: cleanUrl(event.request.url) };
  delete event.user;
  delete event.extra;
  return event;
}

export function initMonitoring() {
  if (!DSN || !import.meta.env.PROD) return;
  void import('@sentry/browser')
    .then((S) => {
      S.init({
        dsn: DSN,
        environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || 'production',
        release: (import.meta.env.VITE_RELEASE as string | undefined) || undefined,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        beforeBreadcrumb: () => null,
        beforeSend: (e) => scrubEvent(e),
      });
      sentry = S;
      pending.splice(0).forEach((err) => S.captureException(err));
    })
    .catch(() => undefined);
}

export function captureError(err: unknown) {
  if (!DSN) return;
  if (sentry) sentry.captureException(err);
  else if (pending.length < 10) pending.push(err);
}
