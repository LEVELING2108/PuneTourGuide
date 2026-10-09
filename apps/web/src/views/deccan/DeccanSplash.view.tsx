// Generated from design-reference/deccan/DeccanSplash.dc.html by scripts/convert-designs.py, then wired up by hand.
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanSplash a{color:var(--bg)}
.scr-deccan-DeccanSplash a:hover{color:var(--surface)}
@keyframes dDeccanSplash-draw{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
@keyframes dDeccanSplash-needle{0%{transform:rotate(-120deg);opacity:0}60%{transform:rotate(14deg);opacity:1}80%{transform:rotate(-6deg)}100%{transform:rotate(0)}}
@keyframes dDeccanSplash-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes dDeccanSplash-ring{from{transform:scale(.6);opacity:0}40%{opacity:.25}to{transform:scale(1.6);opacity:0}}
@keyframes dDeccanSplash-breathe{50%{opacity:.45}}
.scr-deccan-DeccanSplash .circle{stroke-dasharray:70;animation:dDeccanSplash-draw 1.2s cubic-bezier(.4,.1,.2,1) .2s both}
.scr-deccan-DeccanSplash .needle{transform-origin:12px 12px;animation:dDeccanSplash-needle 1.3s cubic-bezier(.3,.8,.2,1) .7s both}
.scr-deccan-DeccanSplash .rise{animation:dDeccanSplash-rise .8s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanSplash .r1{animation-delay:1.2s}
.scr-deccan-DeccanSplash .r2{animation-delay:1.45s}
.scr-deccan-DeccanSplash .r3{animation-delay:2.2s}
.scr-deccan-DeccanSplash .wave{position:absolute;left:50%;top:50%;width:240px;height:240px;margin:-120px 0 0 -120px;border-radius:50%;border:1px solid var(--bg);animation:dDeccanSplash-ring 3.2s ease-out 1s infinite}
.scr-deccan-DeccanSplash .w2{animation-delay:2.6s}
.scr-deccan-DeccanSplash .hint{animation:dDeccanSplash-rise .8s ease 2.2s both,dDeccanSplash-breathe 2.4s ease-in-out 3s infinite}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanSplash *,.scr-deccan-DeccanSplash *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanSplashView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanSplash" onClick={v.go} style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--bg)", textDecoration: "none" }}>
      <style href="scr-deccan-DeccanSplash" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "22px" }}>
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
          <circle className="circle" cx="12" cy="12" r="10" />
          <g className="needle">
            <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="var(--bg)" fillOpacity="0.15" />
          </g>
        </svg>
        <div className="rise r1" style={{ fontFamily: "var(--font-display)", fontSize: "44px", lineHeight: "1", position: "relative" }}>
          Pune{" "}
          <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>Explorer</span>
        </div>
        <div className="rise r2" style={{ fontFamily: "var(--font-accent)", fontSize: "24px", color: "#E2B95B", position: "relative", marginTop: "-14px" }}>पुणे एक्सप्लोरर</div>
        <div className="rise r2" style={{ fontSize: "14px", letterSpacing: "0.04em", color: "#F2D5E3", position: "relative" }}>Explore boldly. Help is always near.</div>
        <div className="rise r1" style={{ position: "absolute", right: "64px", top: "150px", width: "64px", height: "64px", borderRadius: "32px", background: "#E2B95B", opacity: "0.9" }} />
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0" }}>
          <defs>
            <pattern id="zs" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zs)" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: "0", right: "0", top: "0", bottom: "0" }} aria-hidden="true">
        <span className="wave" />
        <span className="wave w2" />
      </div>
      <svg width="390" height="120" viewBox="0 0 390 120" aria-hidden="true" style={{ position: "absolute", left: "0", bottom: "0" }}>
        <path d="M0 80 Q70 40 140 66 T280 52 T390 62 V120 H0 Z" fill="#6A1A44" />
        <path d="M0 120 V86 H30 V72 a14 14 0 0 1 28 0 V86 H110 V78 H118 V72 H126 V78 H134 V72 H142 V78 H150 V86 H170 V62 a22 22 0 0 1 44 0 V86 H260 V74 a12 12 0 0 1 24 0 V86 H330 V68 a16 16 0 0 1 32 0 V86 H390 V120 Z" fill="#4E0F30" />
        <path d="M182 120 V102 a10 10 0 0 1 20 0 V120 Z" fill="var(--primary)" />
      </svg>
      <div className="hint" style={{ position: "absolute", bottom: "140px", fontSize: "12px", letterSpacing: "0.16em", color: "#F2C9DC" }}>TAP TO BEGIN</div>
    </div>
  );
}
