// Generated from design-reference/deccan/DeccanFilters.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanFilters a{color:var(--primary)}
.scr-deccan-DeccanFilters a:hover{color:var(--primary-strong)}
@keyframes dDeccanFilters-fade{from{opacity:0}to{opacity:1}}
@keyframes dDeccanFilters-up{from{transform:translateY(100%)}to{transform:none}}
.scr-deccan-DeccanFilters .scrim{animation:dDeccanFilters-fade .45s ease both}
.scr-deccan-DeccanFilters .up{animation:dDeccanFilters-up .55s cubic-bezier(.2,.8,.2,1) .05s both}
.scr-deccan-DeccanFilters .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanFilters .tap:active{transform:scale(.97)}
.scr-deccan-DeccanFilters .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanFilters .track{transition:background-color .35s}
.scr-deccan-DeccanFilters .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanFilters .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanFilters .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanFilters *,.scr-deccan-DeccanFilters *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanFiltersView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanFilters" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanFilters" precedence="screens">{css}</style>
      {v.underlay /* dc-import DeccanExplore  */}
      <Link to="/explore" className="scrim" aria-label="Close filters" style={{ position: "absolute", inset: "0", background: "rgba(35,28,23,0.5)" }} />
      <div className="up" role="dialog" aria-label="Filters" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", borderTop: "3px solid var(--gold)", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D8C6A6", alignSelf: "center" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "16px", lineHeight: "1.25", color: "#A4462B" }}>निवडा</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: "400" }}>Filters</h2>
          </div>
          <button className="tap" onClick={v.reset} style={{ border: "none", background: "transparent", padding: "0", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}>Reset</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>DISTANCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
            {((v.dists ?? []) as any[]).map((d: any, dIndex: number) => (
              <Fragment key={d?.key ?? dIndex}>
                <button className="tap" onClick={d.pick} aria-pressed={d.pressed} style={{ height: "42px", borderRadius: "14px", border: `1px solid ${d.bd}`, background: d.bg, color: d.fg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}>{d.label}</button>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {((v.toggles ?? []) as any[]).map((t: any, tIndex: number) => (
            <Fragment key={t?.key ?? tIndex}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #EADFCC" }}>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "14.5px", fontWeight: "600" }}>{t.title}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{t.sub}</div>
                </div>
                <button onClick={t.flip} aria-label={t.title} aria-pressed={t.pressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
                  <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: t.trackBg }} />
                  <span className="knob" style={{ position: "absolute", top: "4px", left: t.knob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
                </button>
              </div>
            </Fragment>
          ))}
        </div>
        <Link to="/explore" className="cta" style={{ height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{"Show "}{v.count}{" places"}</Link>
      </div>
    </div>
  );
}
