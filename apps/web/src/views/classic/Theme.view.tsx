// Generated from design-reference/classic/Theme.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Theme a{color:var(--primary)}
.scr-classic-Theme a:hover{color:var(--primary-strong)}
@keyframes cTheme-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-classic-Theme .rise{animation:cTheme-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Theme .d1{animation-delay:.05s}
.scr-classic-Theme .d2{animation-delay:.12s}
.scr-classic-Theme .d3{animation-delay:.19s}
.scr-classic-Theme .d4{animation-delay:.26s}
.scr-classic-Theme .d5{animation-delay:.33s}
.scr-classic-Theme .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1)}
.scr-classic-Theme .tap:active{transform:scale(.97)}
.scr-classic-Theme .opt{transition:border-color .35s,box-shadow .35s,transform .35s cubic-bezier(.2,.7,.2,1)}
.scr-classic-Theme .opt:hover{transform:translateY(-2px)}
.scr-classic-Theme .radio{transition:border .3s}
.scr-classic-Theme .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s,background-color .4s}
.scr-classic-Theme .cta:hover{transform:translateY(-2px)}
.scr-classic-Theme .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Theme *,.scr-classic-Theme *::after{animation:none!important;transition:none!important}}
`;

export default function ThemeView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Theme" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Theme" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "calc(var(--sb) + 12px) 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
            App{" "}
            <span style={{ fontStyle: "italic", color: "var(--primary)" }}>theme</span>
          </h1>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
            Same app, same features. Pick the look you like. SOS always stays red.
          </p>
        </div>
        <div className="rise d3" role="radiogroup" aria-label="App theme" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <button className="opt" role="radio" aria-checked={v.classicChecked} onClick={v.pickClassic} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", borderRadius: "22px", border: `2px solid ${v.classicBd}`, background: "var(--surface)", boxShadow: v.classicShadow, textAlign: "left", cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <div style={{ height: "132px", width: "100%", borderRadius: "14px", background: "var(--bg)", padding: "12px", boxSizing: "border-box", display: "flex", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1", color: "var(--ink)" }}>
                  Where to,{" "}
                  <i style={{ color: "var(--primary)" }}>today?</i>
                </div>
                <div style={{ flex: "1", borderRadius: "12px", background: "var(--primary)", padding: "8px 10px", color: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: "var(--font-display)", fontSize: "15px" }}>Shaniwar Wada</div>
              </div>
              <div style={{ width: "72px", display: "grid", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                <span style={{ borderRadius: "8px", background: "#4A3426" }} />
                <span style={{ borderRadius: "8px", background: "#26303B" }} />
                <span style={{ borderRadius: "8px", background: "#1B2220" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 4px" }}>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "15.5px", fontWeight: "600", color: "var(--ink)" }}>Classic</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Calm emerald and ivory, modern serif</div>
              </div>
              <span className="radio" style={{ width: "22px", height: "22px", borderRadius: "11px", boxSizing: "border-box", border: v.classicRing, background: "var(--surface)" }} />
            </div>
          </button>
          <button className="opt" role="radio" aria-checked={v.deccanChecked} onClick={v.pickDeccan} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", borderRadius: "22px", border: `2px solid ${v.deccanBd}`, background: "var(--surface)", boxShadow: v.deccanShadow, textAlign: "left", cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <div style={{ height: "132px", width: "100%", borderRadius: "14px", background: "#F3EADB", padding: "12px", boxSizing: "border-box", display: "flex", gap: "10px", position: "relative", overflow: "hidden" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: "'Yatra One', sans-serif", fontSize: "20px", lineHeight: "1.1", color: "#7A1F4E" }}>चला, फिरूया!</div>
                <div style={{ flex: "1", borderRadius: "10px", background: "#0E5B5E", position: "relative", overflow: "hidden" }}>
                  <svg width="200" height="8" viewBox="0 0 200 8" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0" }}>
                    <defs>
                      <pattern id="zt" width="8" height="8" patternUnits="userSpaceOnUse">
                        <rect width="8" height="8" fill="#C59A3A" />
                        <path d="M0 8 L4 2 L8 8 Z" fill="#7A1F4E" />
                      </pattern>
                    </defs>
                    <rect width="200" height="8" fill="url(#zt)" />
                  </svg>
                  <svg width="200" height="34" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", bottom: "0", width: "100%" }}>
                    <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#073638" />
                  </svg>
                  <div style={{ position: "absolute", left: "10px", top: "14px", fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#FFFBF3" }}>Shaniwar Wada</div>
                </div>
              </div>
              <div style={{ width: "72px", display: "grid", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                <span style={{ borderRadius: "3px", background: "#7A1F4E", outline: "1.5px dashed #D8C6A6", outlineOffset: "2px" }} />
                <span style={{ borderRadius: "3px", background: "#A4462B", outline: "1.5px dashed #D8C6A6", outlineOffset: "2px" }} />
                <span style={{ borderRadius: "3px", background: "#C59A3A", outline: "1.5px dashed #D8C6A6", outlineOffset: "2px" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 4px" }}>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "15.5px", fontWeight: "600", color: "var(--ink)" }}>Deccan</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Paithani colours, fort skylines, travel stamps</div>
              </div>
              <span className="radio" style={{ width: "22px", height: "22px", borderRadius: "11px", boxSizing: "border-box", border: v.deccanRing, background: "var(--surface)" }} />
            </div>
          </button>
        </div>
        <Link className="rise d4 cta" to={v.applyHref} onClick={v.apply} style={{ marginTop: "auto", height: "56px", borderRadius: "28px", background: v.applyBg, color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{"Use "}{v.chosen}{" theme"}</Link>
      </div>
    </div>
  );
}
