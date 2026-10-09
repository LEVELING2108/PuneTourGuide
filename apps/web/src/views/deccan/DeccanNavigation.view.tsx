// Generated from design-reference/deccan/DeccanNavigation.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanNavigation a{color:var(--primary)}
.scr-deccan-DeccanNavigation a:hover{color:var(--primary-strong)}
@keyframes dDeccanNavigation-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanNavigation-down{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:none}}
@keyframes dDeccanNavigation-sheet{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes dDeccanNavigation-draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
@keyframes dDeccanNavigation-halo{from{transform:scale(1);opacity:.5}to{transform:scale(2.6);opacity:0}}
@keyframes dDeccanNavigation-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-deccan-DeccanNavigation .down{animation:dDeccanNavigation-down .6s cubic-bezier(.2,.7,.2,1) .15s both}
.scr-deccan-DeccanNavigation .sheet{animation:dDeccanNavigation-sheet .7s cubic-bezier(.2,.7,.2,1) .2s both}
.scr-deccan-DeccanNavigation .draw{stroke-dasharray:600;animation:dDeccanNavigation-draw 1.6s cubic-bezier(.4,.1,.2,1) .2s both}
.scr-deccan-DeccanNavigation .me::after{content:"";position:absolute;inset:-4px;border-radius:50%;background:#2F6FD6;animation:dDeccanNavigation-halo 2.4s ease-out infinite;z-index:-1}
.scr-deccan-DeccanNavigation .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:dDeccanNavigation-pulse 2.6s ease-out infinite}
.scr-deccan-DeccanNavigation .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanNavigation .tap:active{transform:scale(.96)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanNavigation *,.scr-deccan-DeccanNavigation *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanNavigationView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanNavigation" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#EDE3D0", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanNavigation" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0", zIndex: "6", pointerEvents: "none" }}>
          <defs>
            <pattern id="zz" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zz)" />
        </svg>
        <div style={{ position: "absolute", left: "58px", top: "268px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ padding: "6px 12px", borderRadius: "14px", background: "var(--primary)", color: "var(--bg)", fontFamily: "var(--font-display)", fontSize: "16px", whiteSpace: "nowrap" }}>Dagdusheth</div>
          <div style={{ width: "1.5px", height: "10px", background: "var(--primary)" }} />
        </div>
        <div className="me" style={{ position: "absolute", left: "178px", top: "606px", width: "24px", height: "24px", borderRadius: "12px", background: "#2F6FD6", border: "4px solid var(--surface)", boxSizing: "border-box", boxShadow: "0 4px 10px rgba(35,28,23,0.3)", zIndex: "1" }} />
        <div className="down" style={{ position: "absolute", top: "56px", left: "16px", right: "16px", background: "var(--ink)", color: "var(--bg)", borderRadius: "24px", borderBottom: "3px solid var(--gold)", padding: "16px 18px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 20px 40px -20px rgba(35,28,23,0.7)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 20V12a4 4 0 0 0-4-4H5" />
              <path d="M9 4L5 8l4 4" />
            </svg>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", lineHeight: "1" }}>{v.nextDist}</div>
            <div style={{ fontSize: "14px", color: "#E3D6C4" }}>
              Turn left onto Laxmi Road ·{" "}
              <span style={{ fontFamily: "var(--font-accent)", color: "#E2B95B" }}>लक्ष्मी रस्ता</span>
            </div>
          </div>
        </div>
        <div className="down" style={{ position: "absolute", top: "152px", left: "30px", padding: "8px 14px", borderRadius: "0 0 16px 16px", background: "#3A302A", color: "#E3D6C4", fontSize: "12.5px" }}>Then right in 160 m</div>
        <button className="tap" aria-label="Re-centre map" style={{ position: "absolute", right: "20px", top: "470px", width: "48px", height: "48px", borderRadius: "24px", border: "none", background: "var(--surface)", boxShadow: "0 10px 24px -12px rgba(35,28,23,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>
      <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
        <rect width="390" height="844" fill="#EDE3D0" />
        <rect x="230" y="250" width="120" height="80" rx="18" fill="#DDE5DA" />
        <path d="M0 470 L390 430" stroke="var(--surface)" strokeWidth="14" />
        <path d="M150 0 L200 844" stroke="var(--surface)" strokeWidth="14" />
        <path d="M0 300 L390 330" stroke="var(--surface)" strokeWidth="8" />
        <path d="M300 0 L270 844" stroke="var(--surface)" strokeWidth="8" />
        <path d="M60 0 L90 844" stroke="var(--surface)" strokeWidth="5" />
        <path d="M190 620 L180 452 L84 462 L72 300" stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="draw" d="M190 620 L180 452 L84 462 L72 300" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="sheet" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", borderTop: "3px solid var(--gold)", boxShadow: "0 -20px 40px -24px rgba(35,28,23,0.35)", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D8C6A6", alignSelf: "center" }} />
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "14px", background: "#FAF0F4", fontSize: "12.5px", color: "#4A1530" }}>
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
