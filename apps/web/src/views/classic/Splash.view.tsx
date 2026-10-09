// Generated from design-reference/classic/Splash.dc.html by scripts/convert-designs.py, then wired up by hand.
import type { ViewProps } from '../types';

const css = `
.scr-classic-Splash a{color:var(--bg)}
.scr-classic-Splash a:hover{color:var(--surface)}
@keyframes cSplash-draw{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
@keyframes cSplash-needle{0%{transform:rotate(-120deg);opacity:0}60%{transform:rotate(14deg);opacity:1}80%{transform:rotate(-6deg)}100%{transform:rotate(0)}}
@keyframes cSplash-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes cSplash-ring{from{transform:scale(.6);opacity:0}40%{opacity:.25}to{transform:scale(1.6);opacity:0}}
@keyframes cSplash-breathe{50%{opacity:.45}}
.scr-classic-Splash .circle{stroke-dasharray:70;animation:cSplash-draw 1.2s cubic-bezier(.4,.1,.2,1) .2s both}
.scr-classic-Splash .needle{transform-origin:12px 12px;animation:cSplash-needle 1.3s cubic-bezier(.3,.8,.2,1) .7s both}
.scr-classic-Splash .rise{animation:cSplash-rise .8s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Splash .r1{animation-delay:1.2s}
.scr-classic-Splash .r2{animation-delay:1.45s}
.scr-classic-Splash .r3{animation-delay:2.2s}
.scr-classic-Splash .wave{position:absolute;left:50%;top:50%;width:240px;height:240px;margin:-120px 0 0 -120px;border-radius:50%;border:1px solid var(--bg);animation:cSplash-ring 3.2s ease-out 1s infinite}
.scr-classic-Splash .w2{animation-delay:2.6s}
.scr-classic-Splash .hint{animation:cSplash-rise .8s ease 2.2s both,cSplash-breathe 2.4s ease-in-out 3s infinite}
@media (prefers-reduced-motion:reduce){.scr-classic-Splash *,.scr-classic-Splash *::after{animation:none!important;transition:none!important}}
`;

export default function SplashView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Splash" onClick={v.go} style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--bg)", textDecoration: "none" }}>
      <style href="scr-classic-Splash" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "22px" }}>
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
          <circle className="circle" cx="12" cy="12" r="10" />
          <g className="needle">
            <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="var(--bg)" fillOpacity="0.15" />
          </g>
        </svg>
        <div className="rise r1" style={{ fontFamily: "var(--font-display)", fontSize: "44px", lineHeight: "1", position: "relative" }}>
          Pune{" "}
          <span style={{ fontStyle: "italic", color: "#A9CFC6" }}>Explorer</span>
        </div>
        <div className="rise r2" style={{ fontSize: "14px", letterSpacing: "0.04em", color: "#CFE3DE", position: "relative" }}>Explore boldly. Help is always near.</div>
      </div>
      <div style={{ position: "absolute", left: "0", right: "0", top: "0", bottom: "0" }} aria-hidden="true">
        <span className="wave" />
        <span className="wave w2" />
      </div>
      <div className="hint" style={{ position: "absolute", bottom: "56px", fontSize: "12px", letterSpacing: "0.16em", color: "#A9CFC6" }}>TAP TO BEGIN</div>
    </div>
  );
}
