import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { trackingApi } from '../../api/safety';
import { mePin } from '../../components/map/pins';
import { DeccanOnly } from '../../components/Themed';
import { isMedical, useHelpNearby } from '../../features/help';
import { kmText } from '../../features/places';
import { metres } from '../../lib/geo';

const MapCanvas = lazy(() => import('../../components/map/MapCanvas'));

type Fix = { lat: number; lng: number; acc?: number; ts: number };
type State = 'connecting' | 'live' | 'ended' | 'invalid';

const STALE_MS = 60_000;

const ago = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} hr ago`;
};

/**
 * Public page behind the link texted to emergency contacts (/track/:sessionId). Read-only:
 * it watches the session and never publishes. No login, no personal data beyond the location.
 */
export default function TrackScreen() {
  const { sessionId = '' } = useParams();
  const [state, setState] = useState<State>('connecting');
  const [fix, setFix] = useState<Fix | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Keep tracking links out of search engines
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => {
      meta.remove();
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry = 0;
    let stopped = false;
    let timer = 0;
    const connect = () => {
      ws = new WebSocket(trackingApi.socketUrl(sessionId));
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data as string);
          if (m.type === 'ended') {
            setState('ended');
            stopped = true;
            ws?.close();
          } else if (typeof m.lat === 'number' && typeof m.lng === 'number') {
            retry = 0;
            setFix({ lat: m.lat, lng: m.lng, acc: m.acc, ts: m.ts ?? Date.now() });
            setState('live');
          }
        } catch {
          /* ignore malformed */
        }
      };
      ws.onclose = (e) => {
        if (stopped) return;
        if (e.code === 4404) {
          setState('invalid');
          return;
        }
        timer = window.setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++));
      };
    };
    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      ws?.close();
    };
  }, [sessionId]);

  const helpQ = useHelpNearby(fix);
  const hospital = (helpQ.data ?? [])
    .filter(isMedical)
    .filter((h) => h.category === 'hospital')
    .map((h) => ({ ...h, km: fix ? Math.round((metres(fix, h) / 1000) * 10) / 10 : h.km }))[0];

  const stale = fix && state === 'live' && now - fix.ts > STALE_MS;
  const title =
    state === 'invalid' ? 'Link not valid' : state === 'ended' ? 'Sharing has ended' : fix ? 'Live location' : 'Waiting for location…';
  const sub =
    state === 'invalid'
      ? 'This tracking link has expired or is not valid.'
      : state === 'ended'
        ? fix
          ? `Last seen ${ago(now - fix.ts)}. They stopped sharing or marked themselves safe.`
          : 'They stopped sharing or marked themselves safe.'
        : fix
          ? `Updated ${ago(now - fix.ts)}${fix.acc ? ` · ±${Math.round(fix.acc)} m` : ''}`
          : 'Their phone will send its location as soon as it has a GPS fix.';

  const btn: React.CSSProperties = {
    flex: 1,
    height: 52,
    borderRadius: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
  };

  return (
    <div className="scr" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--map-bg)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {fix && (
        <Suspense fallback={null}>
          <MapCanvas
            center={fix}
            zoom={16}
            markers={[{ key: 'them', lat: fix.lat, lng: fix.lng, html: mePin(24, '0 4px 10px rgba(17,22,20,0.3)'), title: 'Their location', z: 1000 }]}
            view={{ key: `${fix.lat},${fix.lng}`, center: fix }}
            attributionTop={150}
            label="Live location map"
          />
        </Suspense>
      )}
      <DeccanOnly>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'var(--gold)', zIndex: 3 }} />
      </DeccanOnly>
      <div
        role="status"
        aria-live="polite"
        style={{ position: 'absolute', top: 40, left: 16, right: 16, zIndex: 3, background: 'var(--ink)', color: 'var(--bg)', borderRadius: 24, padding: '16px 18px', boxShadow: '0 20px 40px -20px rgba(17,22,20,0.7)' }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.16em', color: state === 'live' && !stale ? '#2FA58A' : '#E0A458' }}>
          {state === 'live' && !stale ? '● LIVE' : state === 'live' ? 'NO RECENT UPDATE' : 'PUNE EXPLORER · SAFETY'}
        </div>
        <h1 style={{ margin: '4px 0 2px', fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, lineHeight: 1.05 }}>{title}</h1>
        <div style={{ fontSize: 13.5, opacity: 0.85 }}>
          {stale ? `No update for ${ago(now - fix!.ts).replace(' ago', '')}. They may have lost signal; this is their last known location.` : sub}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, background: 'var(--surface)', borderRadius: '30px 30px 0 0', padding: '18px 24px 28px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 -20px 40px -24px rgba(17,22,20,0.35)' }}>
        {hospital && (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Nearest hospital to them: <b style={{ color: 'var(--ink)' }}>{hospital.name}</b>, {kmText(hospital.km)}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="tel:112" style={{ ...btn, background: '#C8321C', color: '#fff' }}>
            Call 112
          </a>
          {fix ? (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${fix.lat},${fix.lng}`} target="_blank" rel="noreferrer" style={{ ...btn, background: 'var(--ink)', color: 'var(--bg)' }}>
              Directions to them
            </a>
          ) : (
            <a href="tel:108" style={{ ...btn, border: '1px solid var(--line)', color: 'var(--ink)' }}>
              Ambulance 108
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
