// Generated from design-reference/classic/Medical.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Medical a{color:var(--primary)}
.scr-classic-Medical a:hover{color:var(--primary-strong)}
@keyframes cMedical-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-classic-Medical .rise{animation:cMedical-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Medical .d1{animation-delay:.05s}
.scr-classic-Medical .d2{animation-delay:.12s}
.scr-classic-Medical .d3{animation-delay:.19s}
.scr-classic-Medical .d4{animation-delay:.26s}
.scr-classic-Medical .d5{animation-delay:.33s}
.scr-classic-Medical .d6{animation-delay:.4s}
.scr-classic-Medical .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Medical .tap:active{transform:scale(.96)}
.scr-classic-Medical .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-Medical .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-Medical .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Medical .track{transition:background-color .35s}
.scr-classic-Medical .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Medical .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Medical .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Medical *,.scr-classic-Medical *::after{animation:none!important;transition:none!important}}
`;

export default function MedicalView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Medical" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Medical" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
            Medical{" "}
            <span style={{ fontStyle: "italic", color: "var(--primary)" }}>info</span>
          </h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "14px", background: "#E8F0ED" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0", marginTop: "1px" }}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <div style={{ fontSize: "13px", lineHeight: "1.45", color: "#1E3D37" }}>
              Stays on this phone. Shared with responders only while an SOS is active.
            </div>
          </div>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>BLOOD GROUP</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
            {((v.groups ?? []) as any[]).map((g: any, gIndex: number) => (
              <Fragment key={g?.key ?? gIndex}>
                <button className="tap" onClick={g.pick} aria-pressed={g.pressed} style={{ height: "46px", borderRadius: "14px", border: `1px solid ${g.bd}`, background: g.bg, color: g.fg, fontFamily: "var(--font-display)", fontSize: "20px", cursor: "pointer" }}>{g.label}</button>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>ALLERGIES</span>
            <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input placeholder="e.g. penicillin, peanuts" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>REGULAR MEDICINES</span>
            <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input placeholder="Optional" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NOTES FOR RESPONDERS</span>
            <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input placeholder="Optional" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
        </div>
        <div className="rise d5" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "4px 0" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Show on lock screen</div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Blood group and contacts, during SOS only</div>
          </div>
          <button onClick={v.toggleLock} aria-label="Show on lock screen" aria-pressed={v.lockPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
            <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.lockTrack }} />
            <span className="knob" style={{ position: "absolute", top: "4px", left: v.lockKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
          </button>
        </div>
        <Link to="/profile" className="rise d6 cta" style={{ marginTop: "auto", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Save</Link>
      </div>
    </div>
  );
}
