// Generated from design-reference/classic/SOS.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-SOS a{color:var(--surface)}
.scr-classic-SOS a:hover{color:#FFE3DC}
@keyframes cSOS-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cSOS-ripple{from{transform:scale(.85);opacity:.45}to{transform:scale(1.5);opacity:0}}
@keyframes cSOS-tick{0%{transform:scale(1.18);opacity:.4}100%{transform:scale(1);opacity:1}}
.scr-classic-SOS .rise{animation:cSOS-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-SOS .d1{animation-delay:.05s}
.scr-classic-SOS .d2{animation-delay:.12s}
.scr-classic-SOS .d3{animation-delay:.19s}
.scr-classic-SOS .d4{animation-delay:.26s}
.scr-classic-SOS .d5{animation-delay:.33s}
.scr-classic-SOS .ripple{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,.5);animation:cSOS-ripple 2.4s ease-out infinite}
.scr-classic-SOS .r2{animation-delay:1.2s}
.scr-classic-SOS .ring{transition:stroke-dashoffset 1s linear}
.scr-classic-SOS .num{animation:cSOS-tick .5s cubic-bezier(.2,.7,.2,1)}
.scr-classic-SOS .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s}
.scr-classic-SOS .tap:active{transform:scale(.96)}
.scr-classic-SOS .dial:hover{background-color:rgba(255,255,255,.16)}
.scr-classic-SOS .ghost:hover{background-color:rgba(255,255,255,.08)}
@media (prefers-reduced-motion:reduce){.scr-classic-SOS *,.scr-classic-SOS *::after{animation:none!important;transition:none!important}}
`;

export default function SOSView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-SOS" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#8F1D12", fontFamily: "var(--font-body)", color: "var(--surface)" }}>
      <style href="scr-classic-SOS" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "68px 24px 32px", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div className="rise d1" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.2em", color: "#F6B8A9" }}>SHAKE DETECTED</div>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>{v.headline}</h1>
        </div>
        <div className="rise d2" style={{ alignSelf: "center", width: "210px", height: "210px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="ripple" />
          <span className="ripple r2" />
          <svg width="210" height="210" viewBox="0 0 210 210" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
            <circle cx="105" cy="105" r="96" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
            <circle className="ring" cx="105" cy="105" r="96" fill="none" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" strokeDasharray="603" strokeDashoffset={v.offset} transform="rotate(-90 105 105)" />
          </svg>
          {v.counting && (
            <>
              <div className="num" key={v.count} style={{ fontFamily: "var(--font-display)", fontSize: "120px", lineHeight: "1" }}>{v.count}</div>
            </>
          )}
          {v.calling && (
            <>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </>
          )}
        </div>
        <div className="rise d3" style={{ borderTop: "1px solid rgba(255,255,255,0.18)", borderBottom: "1px solid rgba(255,255,255,0.18)", padding: "14px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#FCE3DD" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F6B8A9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>
              Live location going to{" "}
              <b style={{ color: "var(--surface)", fontWeight: "600" }}>Aai</b>
              {" "}and{" "}
              <b style={{ color: "var(--surface)", fontWeight: "600" }}>Aman</b>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#FCE3DD" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F6B8A9" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>
              Nearest trauma care:{" "}
              <b style={{ color: "var(--surface)", fontWeight: "600" }}>KEM Hospital, 1.2 km</b>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#FCE3DD" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F6B8A9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h10M4 17h7" />
            </svg>
            <span>Medical profile shared with responders</span>
          </div>
        </div>
        <div className="rise d4" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
          <a className="tap dial" href="tel:108" style={{ height: "68px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", textDecoration: "none", color: "var(--surface)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>108</span>
            <span style={{ fontSize: "11.5px", color: "#F6B8A9" }}>Ambulance</span>
          </a>
          <a className="tap dial" href="tel:100" style={{ height: "68px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", textDecoration: "none", color: "var(--surface)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>100</span>
            <span style={{ fontSize: "11.5px", color: "#F6B8A9" }}>Police</span>
          </a>
          <a className="tap dial" href="tel:1091" style={{ height: "68px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", textDecoration: "none", color: "var(--surface)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>1091</span>
            <span style={{ fontSize: "11.5px", color: "#F6B8A9" }}>Women</span>
          </a>
        </div>
        <div className="rise d5" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <a className="tap" href="tel:112" style={{ height: "60px", borderRadius: "30px", background: "var(--surface)", color: "#8F1D12", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "16px", fontWeight: "700", textDecoration: "none" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            Call 112 now
          </a>
          <Link to="/" className="tap ghost" style={{ height: "56px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.4)", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>I'm safe, cancel</Link>
        </div>
      </div>
    </div>
  );
}
