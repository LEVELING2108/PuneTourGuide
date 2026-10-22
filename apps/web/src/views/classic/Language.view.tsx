// Generated from design-reference/classic/Language.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Language a{color:var(--primary)}
.scr-classic-Language a:hover{color:var(--primary-strong)}
@keyframes cLanguage-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-classic-Language .rise{animation:cLanguage-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Language .d1{animation-delay:.05s}
.scr-classic-Language .d2{animation-delay:.12s}
.scr-classic-Language .d3{animation-delay:.19s}
.scr-classic-Language .d4{animation-delay:.26s}
.scr-classic-Language .d5{animation-delay:.33s}
.scr-classic-Language .d6{animation-delay:.4s}
.scr-classic-Language .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Language .tap:active{transform:scale(.98)}
.scr-classic-Language .radio{transition:border-color .3s,border-width .3s}
@keyframes cLanguage-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.scr-classic-Language .swap{animation:cLanguage-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Language .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Language .track{transition:background-color .35s}
.scr-classic-Language .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Language .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Language .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Language *,.scr-classic-Language *::after{animation:none!important;transition:none!important}}
`;

export default function LanguageView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Language" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Language" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "calc(var(--sb) + 12px) 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
        </div>
        <h1 className="rise d2" style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>Language</h1>
        <div className="rise d3" style={{ height: "112px", borderRadius: "24px", background: "var(--primary)", color: "var(--bg)", padding: "18px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#A9CFC6" }}>PREVIEW</div>
          <div style={{ fontFamily: v.previewFont, fontSize: v.previewSize, lineHeight: "1.1" }}>{v.preview}</div>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column" }} role="radiogroup" aria-label="App language">
          {v.collapsed && (
            <>
              {((v.langs ?? []) as any[]).map((l: any, lIndex: number) => (
                <Fragment key={l?.key ?? lIndex}>
                  <button className="tap" onClick={l.pick} role="radio" aria-checked={l.checked} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 4px", border: "none", borderBottom: "1px solid var(--line)", background: "transparent", textAlign: "left", cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                      <div style={{ fontFamily: "'Mukta', 'Mukta Vaani', var(--font-body)", fontSize: "18px", fontWeight: "600" }}>{l.native}</div>
                      <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{l.english}</div>
                    </div>
                    <span className="radio" style={{ width: "22px", height: "22px", borderRadius: "11px", boxSizing: "border-box", border: l.ring, background: "var(--surface)" }} />
                  </button>
                </Fragment>
              ))}
            </>
          )}
          {v.expanded && (
            <>
              <div className="swap" style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px 0 8px" }}>
                {((v.allLangs ?? []) as any[]).map((a: any, aIndex: number) => (
                  <Fragment key={a?.key ?? aIndex}>
                    <button className="tap" onClick={a.pick} aria-pressed={a.pressed} style={{ height: "34px", padding: "0 12px", borderRadius: "17px", border: `1px solid ${a.bd}`, background: a.bg, color: a.fg, fontFamily: "var(--font-body)", fontSize: "12.5px", fontWeight: "600", cursor: "pointer" }}>{a.label}</button>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          <button className="tap" onClick={v.toggleMore} aria-expanded={v.expandedAttr} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 4px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--primary)" }}>
            <div style={{ flex: "1", fontSize: "14.5px", fontWeight: "600" }}>{v.moreLabel}</div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${v.chevron})`, transition: "transform .35s" }}>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="rise d5" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Match the state I'm in</div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Suggests the local language when you travel</div>
          </div>
          <button onClick={v.toggleAuto} aria-label="Match the state I'm in" aria-pressed={v.autoPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
            <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.autoTrack }} />
            <span className="knob" style={{ position: "absolute", top: "4px", left: v.autoKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
          </button>
        </div>
        <Link to="/profile" className="rise d6 cta" style={{ marginTop: "auto", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{"Use "}{v.chosen}</Link>
      </div>
    </div>
  );
}
