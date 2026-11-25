import { Link } from 'react-router';

const css = `
.home-duo{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:8px 0}
.home-duo>a{flex:1 1 0;min-width:0;min-height:44px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:0 12px;text-decoration:none}
.home-duo>a:first-child{flex-grow:1.25}
.home-duo>a+a{border-left:1px solid var(--line)}
.home-duo svg{flex:none}
.home-duo b,.home-duo span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.home-duo b{font-size:14px;line-height:20px;font-weight:600;color:var(--ink)}
.home-duo span{font-size:12px;line-height:16px;color:var(--muted)}
@media (max-width:359px){.home-duo{flex-direction:column}.home-duo>a{flex:none}.home-duo>a+a{border-left:none;border-top:1px solid var(--line)}}
`;

/** Longer days show only the count, not the dots. */
const MAX_DOTS = 6;

export type RouteDots = { done: boolean[]; current: number } | null;

/** The day's stops as a route line: gold up to where you are. */
export function DayRoute({ route }: { route: RouteDots }) {
  if (!route) return null;
  const { done, current } = route;
  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--muted)' }}>
      {done.length > 1 && done.length <= MAX_DOTS && (
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
          {done.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <i style={{ width: '24px', height: '2px', background: i <= current ? 'var(--gold)' : 'var(--line)' }} />}
              <i style={{ width: '10px', height: '10px', boxSizing: 'border-box', borderRadius: '50%', border: '2px solid var(--gold)', background: d || i === current ? 'var(--gold)' : 'var(--bg)' }} />
            </div>
          ))}
        </div>
      )}
      <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{`Stop ${current + 1} of ${done.length}`}</span>
    </div>
  );
}

export type HomeStatus = {
  safety: { detail: string; href: string } | null;
  progress: { title: string; detail: string } | null;
};

/** Safety (once it is set up) and, when logged in, stamps and XP. "Not set up" keeps its own amber card. */
export function StatusCard({ status }: { status: HomeStatus }) {
  if (!status.safety && !status.progress) return null;
  return (
    <div className="home-duo">
      <style href="home-duo" precedence="components">{css}</style>
      {status.safety && (
        <Link to={status.safety.href} className="tap">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div style={{ minWidth: 0 }}>
            <b>Safety ready</b>
            <span>{status.safety.detail}</span>
          </div>
        </Link>
      )}
      {status.progress && (
        <Link to="/profile" className="tap">
          <div style={{ minWidth: 0 }}>
            <b>{status.progress.title}</b>
            <span>{status.progress.detail}</span>
          </div>
        </Link>
      )}
    </div>
  );
}

const ART = {
  fort: 'M6 56h52M12 56V32h40v24M12 32v-8h6v4h6v-4h16v4h6v-4h6v8M27 56V46a5 5 0 0 1 10 0v10M32 24V8l11 4-11 4',
  temple: 'M8 56h48M15 56V40h34v16M18 40c2-14 9-18 14-28 5 10 12 14 14 28M32 12V6M27 56V48a5 5 0 0 1 10 0v8M22 32h20',
  wada: 'M6 56h52M11 56V28h42v28M7 28l25-14 25 14M18 36h7v9h-7zM39 36h7v9h-7zM28 56V45a4 4 0 0 1 8 0v11',
  food: 'M8 36h48a24 20 0 0 1-48 0zM18 56h28M22 28c-4-5 4-8 0-14M32 28c-4-5 4-8 0-14M42 28c-4-5 4-8 0-14',
};

/** Line drawing for a collection tile. */
export function CollectionArt({ kind }: { kind: keyof typeof ART }) {
  return (
    <svg className="home-art" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '10px', bottom: '8px' }}>
      <path d={ART[kind]} />
    </svg>
  );
}
