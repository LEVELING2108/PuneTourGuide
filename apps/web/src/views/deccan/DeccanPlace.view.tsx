// Generated from design-reference/deccan/DeccanPlace.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanPlace a{color:var(--primary)}
.scr-deccan-DeccanPlace a:hover{color:var(--primary-strong)}
@keyframes dDeccanPlace-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanPlace-zoom{from{transform:scale(1.06)}to{transform:scale(1)}}
@keyframes dDeccanPlace-stamp{0%{opacity:0;transform:rotate(-8deg) scale(1.6)}60%{opacity:1;transform:rotate(-8deg) scale(.94)}100%{opacity:1;transform:rotate(-8deg) scale(1)}}
.scr-deccan-DeccanPlace .rise{animation:dDeccanPlace-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPlace .zoom{animation:dDeccanPlace-zoom 1.4s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPlace .stampin{animation:dDeccanPlace-stamp .6s cubic-bezier(.2,.7,.2,1) .6s both}
.scr-deccan-DeccanPlace .d1{animation-delay:.05s}
.scr-deccan-DeccanPlace .d2{animation-delay:.12s}
.scr-deccan-DeccanPlace .d3{animation-delay:.19s}
.scr-deccan-DeccanPlace .d4{animation-delay:.26s}
.scr-deccan-DeccanPlace .d5{animation-delay:.33s}
.scr-deccan-DeccanPlace .d6{animation-delay:.4s}
.scr-deccan-DeccanPlace .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s}
.scr-deccan-DeccanPlace .tap:active{transform:scale(.96)}
.scr-deccan-DeccanPlace .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanPlace .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanPlace .cta:active{transform:scale(.97)}
.scr-deccan-DeccanPlace .ghost{transition:background-color .3s,transform .25s}
.scr-deccan-DeccanPlace .ghost:hover{background-color:var(--surface)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanPlace *,.scr-deccan-DeccanPlace *::after{animation:none!important;transition:none!important}}
@keyframes dDeccanPlace-toast{0%{opacity:0;transform:translateY(-8px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-4px)}}
.scr-deccan-DeccanPlace .toast{animation:dDeccanPlace-toast 2.4s ease both}
`;

export default function DeccanPlaceView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanPlace" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanPlace" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ height: "360px", position: "relative", overflow: "hidden", background: "#0E5B5E" }}>
          <div className="zoom" style={{ position: "absolute", inset: "0" }}>
            <div style={{ position: "absolute", left: "60px", top: "90px", width: "70px", height: "70px", borderRadius: "35px", background: "#E2B95B", opacity: "0.85" }} />
            <svg width="390" height="170" viewBox="0 0 390 170" aria-hidden="true" style={{ position: "absolute", left: "0", bottom: "0" }}>
              <path d="M0 120 Q90 80 180 104 T390 92 V170 H0 Z" fill="#0A4A4C" />
              <path d="M30 170 V96 H360 V170 Z" fill="#073638" />
              <path d="M24 96 H366 V86 H24 Z" fill="#073638" />
              <path d="M150 86 V66 H240 V86 Z M170 66 a25 18 0 0 1 50 0 Z" fill="#073638" />
              <path d="M48 170 V130 a14 14 0 0 1 28 0 V170 Z M92 170 V130 a14 14 0 0 1 28 0 V170 Z M136 170 V130 a14 14 0 0 1 28 0 V170 Z M180 170 V124 a15 15 0 0 1 30 0 V170 Z M226 170 V130 a14 14 0 0 1 28 0 V170 Z M270 170 V130 a14 14 0 0 1 28 0 V170 Z M314 170 V130 a14 14 0 0 1 28 0 V170 Z" fill="#0E5B5E" />
            </svg>
          </div>
          <svg width="390" height="12" viewBox="0 0 390 12" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0" }}>
            <defs>
              <pattern id="zp" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="var(--gold)" />
                <path d="M0 12 L6 3 L12 12 Z" fill="var(--primary)" />
              </pattern>
            </defs>
            <rect width="390" height="12" fill="url(#zp)" />
          </svg>
          <Link to="/explore" className="tap" aria-label="Back" onClick={v.back} style={{ position: "absolute", top: "54px", left: "20px", width: "44px", height: "44px", borderRadius: "22px", background: "rgba(255,251,243,0.18)", border: "1px solid rgba(255,251,243,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <button className="tap" onClick={v.toggleSave} aria-label={v.saveLabel} aria-pressed={v.savePressed} style={{ position: "absolute", top: "54px", right: "20px", width: "44px", height: "44px", borderRadius: "22px", background: v.saveBg, border: "1px solid rgba(255,251,243,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={v.saveFill} stroke={v.saveStroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
          {v.showToast && (
            <div className="toast" role="status" style={{ position: "absolute", top: "110px", right: "20px", padding: "10px 14px", borderRadius: "12px", background: "var(--surface)", color: "var(--ink)", fontSize: "13.5px", fontWeight: "600", boxShadow: "0 14px 28px -14px rgba(35,28,23,0.6)", borderLeft: "3px solid var(--gold)", zIndex: "3" }}>{v.toastText}</div>
          )}
        </div>
        <div className="rise d2" style={{ position: "relative", margin: "-60px 18px 0", background: "var(--surface)", borderRadius: "10px", padding: "22px 20px 18px", boxShadow: "0 24px 40px -24px rgba(35,28,23,0.55)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="stampin" style={{ position: "absolute", top: "-26px", right: "18px", padding: "4px", background: "var(--surface)", border: "2px dashed #CDB894", borderRadius: "4px", transform: "rotate(-8deg)" }}>
            <div style={{ width: "62px", height: "72px", background: "var(--primary)", color: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1" }}>{v.stampTop}</div>
              <div style={{ fontSize: "9.5px", letterSpacing: "0.14em", color: "#F2C9DC" }}>{v.stampBottom}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingRight: "80px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "#A4462B" }}>{v.kicker}</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: "400", lineHeight: "1" }}>{v.name}</h1>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "17px", color: "var(--primary)" }}>{v.nameMr}</div>
          </div>
          <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.5", color: "#3E342C" }}>
            {v.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", borderTop: "1.5px dashed #D8C6A6", paddingTop: "10px" }}>
            <div style={{ paddingRight: "10px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>OPEN</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}>{v.hours}</div>
            </div>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>ENTRY</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}>{v.fee}</div>
            </div>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>VISIT</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}>{v.visit}</div>
            </div>
          </div>
        </div>
        <div className="rise d4" style={{ position: "relative", margin: "26px 22px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Link to={v.helpHref} className="tap" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "var(--ink)" }}>
            <span style={{ width: "34px", height: "34px", borderRadius: "17px", border: "1px solid #E5B3AA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8321C" strokeWidth="2.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span style={{ flex: "1", fontSize: "14.5px" }}>
              <b style={{ fontWeight: "600" }}>{v.hospitalName}</b>
              {" "}
              <span style={{ color: "var(--muted)" }}>· nearest hospital{v.hospitalKm}</span>
            </span>
          </Link>
        {v.googleHref && (
          <a href={v.googleHref} target="_blank" rel="noreferrer" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", color: "var(--muted)", fontSize: "13px", textDecoration: "none" }}>
            Reviews and photos on Google Maps
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
          </a>
        )}
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to={v.directionsHref} className="ghost" style={{ flex: "1", height: "56px", borderRadius: "28px", border: "1px solid #CDB894", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15.5px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>Directions</Link>
            <Link to="/plan" className="cta" onClick={v.addToPlan} style={{ flex: "1.4", height: "56px", borderRadius: "28px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15.5px", fontWeight: "600", color: "var(--surface)", textDecoration: "none" }}>
              {v.ctaLabelDeccan}{" "}
              <span style={{ fontSize: "13px", color: "#F2C9DC" }}>{v.xpLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
