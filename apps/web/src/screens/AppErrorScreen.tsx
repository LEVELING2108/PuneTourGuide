import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';
import { captureError } from '../lib/monitoring';

/** After a deploy, an open tab can ask for a screen file that no longer exists. */
const isStaleBuild = (err: unknown) =>
  err instanceof Error && /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk/i.test(err.message);

/**
 * Shown when a screen crashes. No mockup exists for it, so it uses theme tokens only.
 * The 112 call stays one tap away: it is a plain tel: link that needs no JavaScript or network.
 */
export default function AppErrorScreen() {
  const error = useRouteError();
  const { t } = useTranslation();
  const stale = isStaleBuild(error);

  useEffect(() => {
    if (!stale) captureError(error);
  }, [error, stale]);

  return (
    <div className="app-frame">
      <main
        role="alert"
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 16,
          padding: '32px 24px',
          background: 'var(--bg)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, margin: 0 }}>{t('crash.title')}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.5, margin: 0 }}>{stale ? t('crash.updated') : t('crash.body')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ minHeight: 48, borderRadius: 14, border: 0, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}
        >
          {t('crash.reload')}
        </button>
        <a
          href="/"
          style={{ minHeight: 48, display: 'grid', placeItems: 'center', borderRadius: 14, border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 16, textDecoration: 'none' }}
        >
          {t('crash.home')}
        </a>
        <a
          href="tel:112"
          style={{ minHeight: 56, display: 'grid', placeItems: 'center', borderRadius: 14, background: 'var(--sos)', color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none', marginTop: 12 }}
        >
          {t('crash.call')}
        </a>
      </main>
    </div>
  );
}
