// Generated from design-reference/classic/Navigation.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Navigation a{color:var(--primary)}
.scr-classic-Navigation a:hover{color:var(--primary-strong)}
@keyframes cNavigation-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cNavigation-down{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:none}}
@keyframes cNavigation-sheet{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes cNavigation-draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
@keyframes cNavigation-halo{from{transform:scale(1);opacity:.5}to{transform:scale(2.6);opacity:0}}
@keyframes cNavigation-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-classic-Navigation .down{animation:cNavigation-down .6s cubic-bezier(.2,.7,.2,1) .15s both}
.scr-classic-Navigation .sheet{animation:cNavigation-sheet .7s cubic-bezier(.2,.7,.2,1) .2s both}
.scr-classic-Navigation .draw{stroke-dasharray:600;animation:cNavigation-draw 1.6s cubic-bezier(.4,.1,.2,1) .2s both}
.scr-classic-Navigation .me::after{content:"";position:absolute;inset:-4px;border-radius:50%;background:#2F6FD6;animation:cNavigation-halo 2.4s ease-out infinite;z-index:-1}
.scr-classic-Navigation .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:cNavigation-pulse 2.6s ease-out infinite}
.scr-classic-Navigation .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-classic-Navigation .tap:active{transform:scale(.96)}
@media (prefers-reduced-motion:reduce){.scr-classic-Navigation *,.scr-classic-Navigation *::after{animation:none!important;transition:none!important}}
`;

export default function NavigationView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Navigation" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#ECEDE8", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Navigation" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ position: "absolute", left: "58px", top: "268px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ padding: "6px 12px", borderRadius: "14px", background: "var(--primary)", color: "var(--bg)", fontFamily: "var(--font-display)", fontSize: "16px", whiteSpace: "nowrap" }}>Dagdusheth</div>
          <div style={{ width: "1.5px", height: "10px", background: "var(--primary)" }} />
        </div>
        <div className="me" style={{ position: "absolute", left: "178px", top: "606px", width: "24px", height: "24px", borderRadius: "12px", background: "#2F6FD6", border: "4px solid var(--surface)", boxSizing: "border-box", boxShadow: "0 4px 10px rgba(17,22,20,0.3)", zIndex: "1" }} />
        <div className="down" style={{ position: "absolute", top: "56px", left: "16px", right: "16px", background: "var(--ink)", color: "var(--bg)", borderRadius: "24px", padding: "16px 18px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 20px 40px -20px rgba(17,22,20,0.7)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 20V12a4 4 0 0 0-4-4H5" />
              <path d="M9 4L5 8l4 4" />
            </svg>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", lineHeight: "1" }}>{v.nextDist}</div>
            <div style={{ fontSize: "14px", color: "#CFD6D3" }}>Turn left onto Laxmi Road</div>
          </div>
        </div>
        <div className="down" style={{ position: "absolute", top: "152px", left: "30px", padding: "8px 14px", borderRadius: "0 0 16px 16px", background: "#2A322F", color: "#CFD6D3", fontSize: "12.5px" }}>Then right in 160 m</div>
        <button className="tap" aria-label="Re-centre map" style={{ position: "absolute", right: "20px", top: "470px", width: "48px", height: "48px", borderRadius: "24px", border: "none", background: "var(--surface)", boxShadow: "0 10px 24px -12px rgba(17,22,20,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>
      <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
        <rect width="390" height="844" fill="#ECEDE8" />
        <rect x="230" y="250" width="120" height="80" rx="18" fill="#DDE5DA" />
        <path d="M0 470 L390 430" stroke="var(--surface)" strokeWidth="14" />
        <path d="M150 0 L200 844" stroke="var(--surface)" strokeWidth="14" />
        <path d="M0 300 L390 330" stroke="var(--surface)" strokeWidth="8" />
        <path d="M300 0 L270 844" stroke="var(--surface)" strokeWidth="8" />
        <path d="M60 0 L90 844" stroke="var(--surface)" strokeWidth="5" />
        <path d="M190 620 L180 452 L84 462 L72 300" stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="draw" d="M190 620 L180 452 L84 462 L72 300" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="sheet" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", boxShadow: "0 -20px 40px -24px rgba(17,22,20,0.35)", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D5DAD6", alignSelf: "center" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "34px", lineHeight: "1" }}>{v.eta}</div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.meta}</div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {((v.modes ?? []) as any[]).map((m: any, mIndex: number) => (
              <Fragment key={m?.key ?? mIndex}>
                <button className="tap" onClick={m.pick} aria-pressed={m.pressed} style={{ height: "36px", padding: "0 14px", borderRadius: "18px", border: `1px solid ${m.bd}`, background: m.bg, color: m.fg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{m.label}</button>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "14px", background: "#F1F6F4", fontSize: "12.5px", color: "#1E3D37" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "4px", background: "#2FA58A", flexShrink: "0" }} />
          {" "}Aai and Aman can see your trip · KEM Hospital 0.9 km from here
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/sos" className="tap sos" aria-label="Emergency SOS" style={{ position: "relative", width: "56px", height: "56px", borderRadius: "28px", background: "#C8321C", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "700", letterSpacing: "0.08em", textDecoration: "none", flexShrink: "0" }}>SOS</Link>
          <Link to="/plan" className="tap" style={{ flex: "1", height: "56px", borderRadius: "28px", background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>End directions</Link>
        </div>
      </div>
    </div>
  );
}
