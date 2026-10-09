// Generated from design-reference/classic/Map.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Map a{color:var(--primary)}
.scr-classic-Map a:hover{color:var(--primary-strong)}
@keyframes cMap-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cMap-sheet{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes cMap-swap{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes cMap-drop{0%{opacity:0;transform:translateY(-16px) scale(.8)}70%{opacity:1;transform:translateY(2px) scale(1.04)}100%{opacity:1;transform:none}}
@keyframes cMap-halo{from{transform:scale(1);opacity:.5}to{transform:scale(2.6);opacity:0}}
@keyframes cMap-draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}
@keyframes cMap-dash{to{stroke-dashoffset:-40}}
.scr-classic-Map .rise{animation:cMap-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Map .sheet{animation:cMap-sheet .8s cubic-bezier(.2,.7,.2,1) .2s both}
.scr-classic-Map .swap{animation:cMap-swap .45s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Map .pin{animation:cMap-drop .55s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Map .p1{animation-delay:.05s}
.scr-classic-Map .p2{animation-delay:.12s}
.scr-classic-Map .p3{animation-delay:.19s}
.scr-classic-Map .p4{animation-delay:.26s}
.scr-classic-Map .p5{animation-delay:.33s}
.scr-classic-Map .me::after{content:"";position:absolute;inset:-4px;border-radius:50%;background:#2F6FD6;animation:cMap-halo 2.4s ease-out infinite;z-index:-1}
.scr-classic-Map .draw{stroke-dasharray:400;animation:cMap-draw 1.1s cubic-bezier(.4,.1,.2,1) both}
.scr-classic-Map .weak{animation:cMap-dash 2.4s linear infinite}
.scr-classic-Map .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Map .tap:active{transform:scale(.96)}
.scr-classic-Map .row{transition:background-color .3s}
.scr-classic-Map .row:hover{background-color:var(--bg)}
.scr-classic-Map .navi:hover{color:var(--bg)}
.scr-classic-Map .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Map .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Map .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Map *,.scr-classic-Map *::after{animation:none!important;transition:none!important}}
`;

export default function MapView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Map" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#ECEDE8", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Map" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "112px" }}>
        <div className="rise" style={{ position: "absolute", top: "60px", left: "20px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: "3" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", height: "52px", padding: "0 18px", borderRadius: "26px", background: "var(--surface)", boxShadow: "0 10px 30px -14px rgba(17,22,20,0.35)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input placeholder="Search this area" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent" }} />
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="tap" onClick={v.pickPlaces} aria-pressed={v.placesPressed} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${v.placesBd}`, background: v.placesBg, color: v.placesFg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}>Places</button>
            <button className="tap" onClick={v.pickRoute} aria-pressed={v.routePressed} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${v.routeBd}`, background: v.routeBg, color: v.routeFg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}>My route</button>
            <button className="tap" onClick={v.toggleHelp} aria-pressed={v.helpPressed} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${v.helpBd}`, background: v.helpBg, color: v.helpFg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "4px", background: "#E0563F" }} />
              Help nearby
            </button>
          </div>
        </div>
        {v.showPlaces && (
          <>
            <div className="pin p1" style={{ position: "absolute", left: "30px", top: "186px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 6px 8px", borderRadius: "16px", background: "var(--surface)", boxShadow: "0 8px 18px -10px rgba(17,22,20,0.45)", zIndex: "2" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "6px", background: "var(--primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>Pataleshwar</span>
            </div>
            <div className="pin p2" style={{ position: "absolute", left: "228px", top: "196px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 6px 8px", borderRadius: "16px", background: "var(--surface)", boxShadow: "0 8px 18px -10px rgba(17,22,20,0.45)", zIndex: "2" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "6px", background: "var(--primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>Kelkar Museum</span>
            </div>
            <div className="pin p3" style={{ position: "absolute", left: "238px", top: "262px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 6px 8px", borderRadius: "16px", background: "var(--primary)", color: "var(--bg)", boxShadow: "0 10px 20px -10px rgba(15,76,66,0.8)", zIndex: "2" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "6px", background: "var(--bg)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>Shaniwar Wada</span>
            </div>
            <div className="pin p4" style={{ position: "absolute", left: "150px", top: "366px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 6px 8px", borderRadius: "16px", background: "var(--surface)", boxShadow: "0 8px 18px -10px rgba(17,22,20,0.45)", zIndex: "2" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "6px", background: "var(--primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>Dagdusheth</span>
            </div>
            <div className="pin p5" style={{ position: "absolute", left: "272px", top: "424px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px 6px 8px", borderRadius: "16px", background: "var(--surface)", boxShadow: "0 8px 18px -10px rgba(17,22,20,0.45)", zIndex: "2" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "6px", background: "var(--primary)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "15px" }}>Parvati Hill</span>
            </div>
          </>
        )}
        {v.showRoute && (
          <>
            <div className="pin p1" style={{ position: "absolute", left: "262px", top: "276px", width: "28px", height: "28px", borderRadius: "14px", background: "#9AA6A2", border: "2.5px solid var(--surface)", boxSizing: "border-box", color: "var(--surface)", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "2" }}>1</div>
            <div className="pin p2" style={{ position: "absolute", left: "182px", top: "382px", width: "32px", height: "32px", borderRadius: "16px", background: "var(--primary)", border: "2.5px solid var(--surface)", boxSizing: "border-box", color: "var(--surface)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px -8px rgba(15,76,66,0.8)", zIndex: "2" }}>2</div>
            <div className="pin p3" style={{ position: "absolute", left: "22px", top: "438px", width: "32px", height: "32px", borderRadius: "16px", background: "var(--surface)", border: "2.5px solid #C27A1E", boxSizing: "border-box", color: "#8A4A12", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "2" }}>3</div>
            <div className="pin p4" style={{ position: "absolute", left: "252px", top: "352px", padding: "4px 10px", borderRadius: "12px", background: "var(--ink)", color: "var(--bg)", fontSize: "11.5px", fontWeight: "600", zIndex: "2" }}>8 min</div>
            <div className="pin p5" style={{ position: "absolute", left: "66px", top: "394px", padding: "4px 10px", borderRadius: "12px", background: "#FDF0E1", color: "#8A4A12", border: "1px solid #EBC9A0", fontSize: "11.5px", fontWeight: "600", zIndex: "2" }}>55 min · weak signal</div>
          </>
        )}
        {v.help && (
          <>
            <div className="pin p2" style={{ position: "absolute", left: "106px", top: "290px", width: "30px", height: "30px", borderRadius: "15px", background: "#C8321C", border: "2.5px solid var(--surface)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px -6px rgba(200,50,28,0.6)", zIndex: "2" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="3.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="pin p3" style={{ position: "absolute", left: "330px", top: "320px", width: "30px", height: "30px", borderRadius: "15px", background: "#C8321C", border: "2.5px solid var(--surface)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px -6px rgba(200,50,28,0.6)", zIndex: "2" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="3.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="pin p4" style={{ position: "absolute", left: "150px", top: "244px", width: "30px", height: "30px", borderRadius: "15px", background: "#26303B", border: "2.5px solid var(--surface)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "2" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
              </svg>
            </div>
          </>
        )}
        <div className="me" style={{ position: "absolute", left: "223px", top: "329px", width: "18px", height: "18px", borderRadius: "9px", background: "#2F6FD6", border: "3px solid var(--surface)", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(17,22,20,0.3)", zIndex: "2" }} />
      </div>
      <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
        <rect width="390" height="844" fill="#ECEDE8" />
        <path d="M-20 300 C 80 260, 160 340, 260 300 S 380 240, 420 270" stroke="#D3DFE3" strokeWidth="22" fill="none" />
        <rect x="250" y="120" width="110" height="60" rx="18" fill="#DDE5DA" />
        <rect x="24" y="470" width="96" height="70" rx="18" fill="#DDE5DA" />
        <path d="M0 420 L390 380" stroke="var(--surface)" strokeWidth="12" />
        <path d="M140 0 L190 844" stroke="var(--surface)" strokeWidth="12" />
        <path d="M0 200 L390 230" stroke="var(--surface)" strokeWidth="6" />
        <path d="M300 0 L260 844" stroke="var(--surface)" strokeWidth="6" />
        <path d="M0 560 L390 520" stroke="var(--surface)" strokeWidth="6" />
        <path d="M60 0 L90 844" stroke="var(--surface)" strokeWidth="4" />
      </svg>
      {v.showRoute && (
        <>
          <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
            <path d="M276 290 L240 340 L198 398" stroke="#9AA6A2" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path className="draw" d="M240 340 L198 398" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path className="weak" d="M198 398 L120 426 L38 454" stroke="#C27A1E" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" fill="none" />
          </svg>
        </>
      )}
      <div className="sheet" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", boxShadow: "0 -20px 40px -24px rgba(17,22,20,0.35)", padding: "10px 24px 104px", zIndex: "3" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D5DAD6", margin: "0 auto 14px" }} />
        {v.sheetPlaces && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "6px" }}>
                <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "400" }}>Places near you</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>5 within 4 km</div>
              </div>
              <Link to="/place" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", borderBottom: "1px solid #ECEEEA", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#1B2220", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>Shaniwar Wada</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Heritage · 0.6 km · in your plan</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
              <Link to="/place" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", borderBottom: "1px solid #ECEEEA", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "var(--primary)", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>Raja Dinkar Kelkar Museum</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Museum · 1.1 km</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
              <Link to="/place" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#26303B", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>Pataleshwar Cave Temple</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Temple · 2.8 km</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </>
        )}
        {v.sheetRoute && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "400" }}>Today's route</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>3 stops · 2 left</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "16px", background: "var(--primary)", color: "var(--surface)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>2</div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NEXT · 11:30 AM</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1.05" }}>Dagdusheth Ganpati</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>8 min walk · KEM Hospital 0.9 km</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 12px", borderRadius: "14px", background: "#FDF0E1" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "14px", border: "2px solid #C27A1E", boxSizing: "border-box", color: "#8A4A12", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>3</div>
                <div style={{ fontSize: "12.5px", color: "#6E3A0E" }}>
                  Then Sinhagad Fort · 55 min by car · weak signal on the ghat road, help list saved offline
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Link to="/directions" className="cta" style={{ flex: "1", height: "52px", borderRadius: "26px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l18-8-8 18-2-8z" />
                  </svg>
                  Start directions
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "4px", background: "#2FA58A" }} />
                  Live sharing
                </div>
              </div>
            </div>
          </>
        )}
        {v.sheetHelp && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "6px" }}>
                <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "400" }}>Help near you</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Trauma care first</div>
              </div>
              <div className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", borderBottom: "1px solid #ECEEEA" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#C8321C", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>KEM Hospital</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Rasta Peth · 1.2 km · 6 min</div>
                </div>
                <a className="tap" href="tel:" aria-label="Call KEM Hospital" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #D5DAD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                </a>
              </div>
              <div className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", borderBottom: "1px solid #ECEEEA" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#C8321C", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>Sassoon General Hospital</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Station Rd · 2.4 km · 10 min</div>
                </div>
                <a className="tap" href="tel:" aria-label="Call Sassoon General Hospital" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #D5DAD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                </a>
              </div>
              <div className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#26303B", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>Faraskhana Police Station</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Budhwar Peth · 0.8 km · 4 min</div>
                </div>
                <a className="tap" href="tel:" aria-label="Call Faraskhana Police Station" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #D5DAD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
      <nav className="rise" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "20px", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(17,22,20,0.6)", zIndex: "4" }}>
        <Link to="/" className="tap navi" aria-label="Home" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
        <Link to="/explore" className="tap navi" aria-label="Explore" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
        </Link>
        <Link to="/map" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
          </svg>
          Map
        </Link>
        <Link to="/plan" className="tap navi" aria-label="Plan" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </Link>
        <Link to="/profile" className="tap navi" aria-label="Profile" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
