import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { googlePhotoUrl } from '../../api/google';
import { useConfirm } from '../../components/Confirm';
import { photoCredit, ratingText, useSpot, useVisitSpot } from '../../features/googlePlaces';
import { useRequireLogin } from '../../features/places';
import { useFlash } from '../../lib/useFlash';
import { useTheme } from '../../stores/theme';

const css = `
@keyframes spot-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.spot .rise{animation:spot-rise .6s cubic-bezier(.2,.7,.2,1) both}
.spot .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1)}
.spot .tap:active{transform:scale(.97)}
@keyframes spot-toast{0%{opacity:0;transform:translateY(-8px)}12%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
.spot .toast{animation:spot-toast 2.4s ease both}
@media (prefers-reduced-motion:reduce){.spot .rise,.spot .toast{animation:none}}
`;

const UNAVAILABLE: Record<string, string> = {
  'daily-limit': 'Google Maps details are paused for today. Try again tomorrow.',
  'not-configured': 'Google Maps details aren’t set up yet.',
};

/** A Google side quest: live photo, rating, hours and address (nothing is stored), plus +XP for going. */
export default function SpotScreen() {
  const { googleId = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const q = useSpot(googleId || null);
  const visit = useVisitSpot();
  const confirm = useConfirm();
  const requireLogin = useRequireLogin();
  const toast = useFlash(2400);
  const [failed, setFailed] = useState<string[]>([]);

  const s = q.data?.available ? q.data : null;
  const photos = (s?.photos ?? []).filter((p) => !failed.includes(p.name));
  const hero = photos[0] ?? null;
  const status = s?.openNow === true ? 'Open now' : s?.openNow === false ? 'Closed now' : null;
  const visitedOn = s?.visitedAt ? new Date(s.visitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const directions =
    s?.lat != null && s?.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=${encodeURIComponent(s.googleId)}`
      : (s?.mapsUri ?? null);

  const markVisited = async () => {
    if (!s || visit.isPending || !requireLogin()) return;
    const yes = await confirm.ask({ title: `Did you go to ${s.name}?`, detail: `Side quest done: +${s.xp} XP, once.`, confirm: 'Yes, I went' });
    if (!yes) return;
    visit.mutate(s.googleId, {
      onSuccess: (r) => toast.flash(r.firstVisit ? `Side quest done · +${r.xpAwarded} XP` : 'Already done'),
      onError: (err) => toast.flash(err.message),
    });
  };

  const back = (e: React.MouseEvent) => {
    if (window.history.length > 1) {
      e.preventDefault();
      navigate(-1);
    }
  };

  const message = !q.isLoading && !s ? (q.isError ? 'Couldn’t load this place. Check your connection and try again.' : (UNAVAILABLE[q.data && !q.data.available ? q.data.reason : ''] ?? 'Google Maps details aren’t available right now.')) : null;

  return (
    <div className={`scr scr-${theme}-Spot spot`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <style href="spot" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 'calc(var(--sb) + 256px)', position: 'relative', overflow: 'hidden', background: 'var(--primary)' }}>
          {!hero && s && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.75)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
              Photo not available right now
            </div>
          )}
          {hero && (
            <>
              <img src={googlePhotoUrl(hero, 860)} alt="" decoding="async" onError={() => setFailed((f) => [...f, hero.name])} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 35%)' }} />
            </>
          )}
          <Link to="/explore" onClick={back} className="tap" aria-label="Back" style={{ position: 'absolute', top: 'calc(var(--sb) + 12px)', left: '20px', width: '44px', height: '44px', borderRadius: '22px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          {hero && photoCredit(hero) && <div style={{ position: 'absolute', top: 'calc(var(--sb) + 64px)', left: '20px', fontSize: '10.5px', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{photoCredit(hero)}</div>}
          {toast.show && (
            <div className="toast" role="status" style={{ position: 'absolute', top: 'calc(var(--sb) + 64px)', right: '20px', padding: '10px 14px', borderRadius: '14px', background: 'var(--surface)', color: 'var(--ink)', fontSize: '13px', fontWeight: 600, boxShadow: '0 14px 28px -14px rgba(0,0,0,0.5)' }}>
              {toast.text}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', marginTop: '-28px', background: 'var(--bg)', borderRadius: '28px 28px 0 0', padding: '26px 24px 40px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {q.isLoading && <div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>Loading…</div>}
          {message && (
            <div role="alert" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>Side quest</div>
              <div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>{message}</div>
            </div>
          )}
          {s && (
            <>
              <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--muted)' }}>{`SIDE QUEST${s.type ? ` · ${s.type.toUpperCase()}` : ''}`}</div>
                <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, lineHeight: 1 }}>{s.name}</h1>
                {(s.rating !== null || status) && (
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                    {s.rating !== null && <span style={{ color: '#86611F' }}>{ratingText(s.rating, s.ratingCount)}</span>}
                    {status && <span style={{ color: s.openNow === false ? '#8A4A12' : 'var(--primary)' }}>{`${s.rating !== null ? ' · ' : ''}${status}`}</span>}
                  </div>
                )}
                {s.address && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{s.address}</div>}
              </div>

              {visitedOn ? (
                <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Side quest done</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 600 }}>{visitedOn}</span>
                  </span>
                </div>
              ) : (
                <button className="rise tap" onClick={markVisited} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: 0, border: 'none', background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-body)', textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '20px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Been here?</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary)' }}>{visit.isPending ? 'Saving…' : `Mark side quest done · +${s.xp} XP`}</span>
                  </span>
                </button>
              )}

              {s.hours.length > 0 && (
                <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--muted)' }}>HOURS</div>
                  {s.hours.map((h) => (
                    <div key={h} style={{ fontSize: '13px' }}>{h}</div>
                  ))}
                </div>
              )}

              {photos.length > 1 && (
                <div className="rise" style={{ display: 'flex', gap: '10px' }}>
                  {photos.slice(1, 3).map((p) => (
                    <figure key={p.name} style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <img src={googlePhotoUrl(p, 400)} alt="" loading="lazy" decoding="async" onError={() => setFailed((f) => [...f, p.name])} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '14px', background: 'var(--line)' }} />
                      {photoCredit(p) && <figcaption style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{photoCredit(p)}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

              <div className="rise" style={{ display: 'flex', gap: '10px' }}>
                {directions && (
                  <a href={directions} target="_blank" rel="noreferrer" className="tap" style={{ flex: 1, height: '56px', borderRadius: '28px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                    Directions
                  </a>
                )}
                {s.mapsUri && (
                  <a href={s.mapsUri} target="_blank" rel="noreferrer" className="tap" style={{ flex: 1.4, height: '56px', borderRadius: '28px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--bg)', textDecoration: 'none' }}>
                    Open in Google Maps
                  </a>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)', textAlign: 'center' }}>Details, ratings and photos: Google Maps</div>
            </>
          )}
        </div>
      </div>
      {confirm.sheet}
    </div>
  );
}
