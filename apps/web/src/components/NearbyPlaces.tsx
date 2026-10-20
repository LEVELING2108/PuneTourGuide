import { Link } from 'react-router';

export type NearbyCard = {
  key: number;
  name: string;
  label: string;
  tone: string;
  distance: string;
  travel: string;
  /** "Open now" / "Closed now", or null when hours are unknown. */
  status: string | null;
  closed: boolean;
  href: string;
  added: boolean;
  addLabel: string;
  toggle: () => void;
};

export type NearbySection = { key: string; title: string; items: NearbyCard[] };

type Props = {
  sections: NearbySection[];
  loading: boolean;
  /** Shown when nothing is close by at all. */
  emptyText: string | null;
  mapHref: string;
  /** The screen's side padding, so the rows scroll edge to edge. */
  gutter?: number;
};

const css = `
.nearby-row{scrollbar-width:none;scroll-snap-type:x mandatory}
.nearby-row::-webkit-scrollbar{display:none}
.nearby-card{scroll-snap-align:start;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s}
.nearby-card:hover{transform:translateY(-2px);box-shadow:0 14px 26px -20px rgba(0,0,0,.45)}
.nearby-add{transition:background-color .25s,border-color .25s,transform .2s}
.nearby-add:active{transform:scale(.92)}
@keyframes nearby-pulse{0%,100%{opacity:.55}50%{opacity:1}}
.nearby-skel{animation:nearby-pulse 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.nearby-card,.nearby-add{transition:none}.nearby-skel{animation:none}}
`;

const heading = { margin: 0, fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, lineHeight: 1.1 } as const;

function Card({ c }: { c: NearbyCard }) {
  return (
    <li className="nearby-card" style={{ position: 'relative', flex: '0 0 168px', listStyle: 'none', borderRadius: '18px', background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden' }}>
      <span aria-hidden="true" style={{ display: 'block', height: '6px', background: c.tone }} />
      <Link to={c.href} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 14px 14px', minHeight: '128px', boxSizing: 'border-box', color: 'var(--ink)', textDecoration: 'none' }}>
        <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--muted)', paddingRight: '36px' }}>{c.label.toUpperCase()}</span>
        <span style={{ paddingRight: '28px', fontFamily: 'var(--font-display)', fontSize: '18px', lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.name}</span>
        <span style={{ marginTop: 'auto', fontSize: '12.5px', fontWeight: 600 }}>{c.distance}</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {c.travel}
          {c.status && <span style={{ color: c.closed ? '#8A4A12' : 'var(--muted)' }}>{` · ${c.status}`}</span>}
        </span>
      </Link>
      <button
        className="nearby-add"
        onClick={c.toggle}
        aria-label={c.addLabel}
        aria-pressed={c.added}
        style={{ position: 'absolute', top: '14px', right: '10px', width: '32px', height: '32px', borderRadius: '16px', border: `1px solid ${c.added ? 'var(--primary)' : 'var(--line)'}`, background: c.added ? 'var(--primary)' : 'var(--surface)', color: c.added ? 'var(--surface)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {c.added ? <path d="M5 12l5 5 9-10" /> : <path d="M12 5v14M5 12h14" />}
        </svg>
      </button>
    </li>
  );
}

/** "Also nearby" and "Food nearby" rows on the Place screen (both themes, colours from theme tokens). */
export function NearbyPlaces({ sections, loading, emptyText, mapHref, gutter = 24 }: Props) {
  const shown = sections.filter((s) => s.items.length);
  if (!loading && !shown.length && !emptyText) return null;
  return (
    <section aria-label="Nearby places" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <style href="nearby-places" precedence="components">{css}</style>
      {loading && (
        <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={heading}>Also nearby</h2>
          <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="nearby-skel" style={{ flex: '0 0 168px', height: '136px', borderRadius: '18px', background: 'var(--line)' }} />
            ))}
          </div>
        </div>
      )}
      {!loading && !shown.length && emptyText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={heading}>Also nearby</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--muted)' }}>{emptyText}</p>
        </div>
      )}
      {!loading &&
        shown.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <h2 style={heading}>{s.title}</h2>
              {i === 0 && (
                <Link to={mapHref} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  See on map
                </Link>
              )}
            </div>
            <ul className="nearby-row" style={{ display: 'flex', gap: '12px', margin: `0 -${gutter}px`, padding: `2px ${gutter}px 6px`, overflowX: 'auto', scrollPaddingLeft: `${gutter}px` }}>
              {s.items.map((c) => (
                <Card key={c.key} c={c} />
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
