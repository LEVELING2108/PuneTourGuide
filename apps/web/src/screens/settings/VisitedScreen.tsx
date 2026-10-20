import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { usersApi } from '../../api/auth';
import { useAccountRequired } from '../../features/account';
import { placeTone } from '../../features/places';
import { byMonth, categoryText, visitDate } from '../../features/visited';
import { useTheme } from '../../stores/theme';

const css = `
@keyframes visited-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.visited .rise{animation:visited-rise .6s cubic-bezier(.2,.7,.2,1) both}
.visited .row{transition:background-color .2s}
.visited .row:hover{background:var(--bg)}
@media (prefers-reduced-motion:reduce){.visited .rise{animation:none}}
`;

const kicker = { fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--muted)' } as const;

/** Profile → Places visited: every stamp, newest first, grouped by month (both themes). */
export default function VisitedScreen() {
  const theme = useTheme();
  const loggedIn = useAccountRequired();
  const q = useQuery({ queryKey: ['stamps'], queryFn: usersApi.stamps, enabled: loggedIn, staleTime: 60_000 });
  const stamps = q.data?.stamps ?? [];
  const xp = stamps.reduce((n, s) => n + s.xp, 0);
  const pct = q.data?.total ? Math.min(100, Math.round((q.data.collected / q.data.total) * 100)) : 0;

  return (
    <div className={`scr scr-${theme}-Visited visited`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <style href="visited" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '56px 24px 40px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/profile" aria-label="Back" style={{ width: '44px', height: '44px', borderRadius: '22px', border: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={kicker}>YOUR TRAVELS</div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 400, lineHeight: 1 }}>Places visited</h1>
            </div>
          </div>

          {q.data && (
            <div className="rise" style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: '24px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '44px', lineHeight: 1 }}>{q.data.collected}</span>
                  <span style={{ fontSize: '13px', opacity: 0.75 }}>{`of ${q.data.total} stamps`}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>{`${xp.toLocaleString('en-IN')} XP from visits`}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'color-mix(in srgb, var(--bg) 18%, transparent)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '6px', borderRadius: '3px', background: 'var(--gold)' }} />
              </div>
              {(stamps.length > 0 || q.data.sideQuests > 0) && (
                <div style={{ fontSize: '12.5px', opacity: 0.75 }}>
                  {[categoryText(stamps), q.data.sideQuests ? `${q.data.sideQuests} side ${q.data.sideQuests === 1 ? 'quest' : 'quests'} done` : ''].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          )}

          {q.isLoading && <div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>Loading your places…</div>}
          {q.isError && (
            <div role="alert" style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
              Couldn&apos;t load your places. Check your connection and try again.
            </div>
          )}

          {q.isSuccess && stamps.length === 0 && (
            <div className="rise" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', lineHeight: 1.05 }}>No places yet</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Tick a stop in your plan, or tap “Been here?” on a place, to collect its stamp.</div>
              <Link to="/explore" style={{ marginTop: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                Open Explore
              </Link>
            </div>
          )}

          {byMonth(stamps).map((g) => (
            <section key={g.month} className="rise" aria-label={g.month} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 style={{ ...kicker, margin: '0 0 4px' }}>{g.month.toUpperCase()}</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '20px', overflow: 'hidden' }}>
                {g.items.map((s, i) => (
                  <li key={s.placeId} style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>
                    <Link to={`/place/${s.placeId}`} className="row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', color: 'var(--ink)', textDecoration: 'none' }}>
                      <span aria-hidden="true" style={{ width: '6px', alignSelf: 'stretch', borderRadius: '3px', background: placeTone(s.category, theme), flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '19px', lineHeight: 1.1 }}>{s.name}</span>
                        <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                          {[s.kind && s.category !== 'Heritage' ? s.kind : s.category, s.area, visitDate(s.collectedAt)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#86611F', flexShrink: 0 }}>{`+${s.xp} XP`}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
