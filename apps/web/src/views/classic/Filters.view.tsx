// Generated from design-reference/classic/Filters.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Filters a{color:var(--primary)}
.scr-classic-Filters a:hover{color:var(--primary-strong)}
@keyframes cFilters-fade{from{opacity:0}to{opacity:1}}
@keyframes cFilters-up{from{transform:translateY(100%)}to{transform:none}}
.scr-classic-Filters .scrim{animation:cFilters-fade .45s ease both}
.scr-classic-Filters .up{animation:cFilters-up .55s cubic-bezier(.2,.8,.2,1) .05s both}
.scr-classic-Filters .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-classic-Filters .tap:active{transform:scale(.97)}
.scr-classic-Filters .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Filters .track{transition:background-color .35s}
.scr-classic-Filters .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Filters .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Filters .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Filters *,.scr-classic-Filters *::after{animation:none!important;transition:none!important}}
`;

export default function FiltersView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Filters" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Filters" precedence="screens">{css}</style>
      {v.underlay /* dc-import Explore  */}
      <Link to="/explore" className="scrim" aria-label="Close filters" style={{ position: "absolute", inset: "0", background: "rgba(17,22,20,0.5)" }} />
      <div className="up" role="dialog" aria-label="Filters" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D5DAD6", alignSelf: "center" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: "400" }}>Filters</h2>
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
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #ECEEEA" }}>
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
