// Generated from design-reference/classic/Explore.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Explore a{color:var(--primary)}
.scr-classic-Explore a:hover{color:var(--primary-strong)}
@keyframes cExplore-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cExplore-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-classic-Explore .rise{animation:cExplore-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Explore .d1{animation-delay:.05s}
.scr-classic-Explore .d2{animation-delay:.12s}
.scr-classic-Explore .d3{animation-delay:.19s}
.scr-classic-Explore .d4{animation-delay:.26s}
.scr-classic-Explore .d5{animation-delay:.33s}
.scr-classic-Explore .d6{animation-delay:.4s}
.scr-classic-Explore .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Explore .tap:active{transform:scale(.96)}
.scr-classic-Explore .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Explore .lift:hover{transform:translateY(-3px);box-shadow:0 18px 36px -18px rgba(17,22,20,.45)}
.scr-classic-Explore .lift:active{transform:scale(.98)}
.scr-classic-Explore .row{transition:background-color .3s}
.scr-classic-Explore .row:hover{background-color:var(--surface)}
.scr-classic-Explore .navi:hover{color:var(--bg)}
.scr-classic-Explore .dot{transition:width .35s cubic-bezier(.2,.7,.2,1),background-color .35s}
@keyframes cExplore-toast{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
.scr-classic-Explore .toast{animation:cExplore-toast 2.6s ease both}
.scr-classic-Explore .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:cExplore-pulse 2.6s ease-out infinite}
.scr-classic-Explore .slide{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-behavior:smooth}
.scr-classic-Explore .slide::-webkit-scrollbar{display:none}
.scr-classic-Explore .slide>*{scroll-snap-align:start}
@media (prefers-reduced-motion:reduce){.scr-classic-Explore *,.scr-classic-Explore *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

export default function ExploreView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Explore" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Explore" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "112px" }}>
        <div style={{ padding: "60px 24px 0", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="rise d1" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--muted)" }}>PUNE, CURATED</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "44px", fontWeight: "400", lineHeight: "0.98" }}>Explore</h1>
          </div>
          <div className="rise d2" style={{ display: "flex", gap: "10px" }}>
            <label style={{ flex: "1", display: "flex", alignItems: "center", gap: "12px", height: "50px", padding: "0 18px", borderRadius: "25px", background: "var(--surface)", border: "1px solid var(--line)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input placeholder="Search places" style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </label>
            <Link to="/explore/filters" className="tap" aria-label="Filters" style={{ width: "50px", height: "50px", flexShrink: "0", borderRadius: "25px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="8" cy="17" r="2" />
              </svg>
            </Link>
          </div>
          <div className="rise d3 slide" style={{ display: "flex", gap: "8px", margin: "0 -24px", padding: "0 24px", scrollPaddingInline: "24px" }}>
            {((v.chips ?? []) as any[]).map((c: any, cIndex: number) => (
              <Fragment key={c?.key ?? cIndex}>
                <button className="tap" onClick={c.pick} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", flexShrink: "0", cursor: "pointer" }}>{c.label}</button>
              </Fragment>
            ))}
          </div>
          <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="slide" onScroll={v.onSlide} style={{ display: "flex", gap: "10px", margin: "0 -24px", padding: "0 24px", scrollPaddingInline: "24px" }}>
              <Link to="/plan" className="lift" style={{ flex: "0 0 290px", height: "132px", boxSizing: "border-box", borderRadius: "24px", background: "var(--primary)", color: "var(--bg)", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#A9CFC6" }}>ROUTE · ON FOOT</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", lineHeight: "1" }}>Old Pune peth walk</div>
                  <div style={{ fontSize: "12.5px", color: "#CFE3DE" }}>5 stops · help within 1.5 km</div>
                </div>
              </Link>
              <Link to="/plan" className="lift" style={{ flex: "0 0 290px", height: "132px", boxSizing: "border-box", borderRadius: "24px", background: "#4A3426", color: "var(--bg)", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#E2C9B4" }}>ROUTE · BY CAR</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", lineHeight: "1" }}>Fort day trip</div>
                  <div style={{ fontSize: "12.5px", color: "#EADBCD" }}>2 forts · offline pack included</div>
                </div>
              </Link>
              <Link to="/plan" className="lift" style={{ flex: "0 0 290px", height: "132px", boxSizing: "border-box", borderRadius: "24px", background: "#26303B", color: "var(--bg)", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#BFCAD6" }}>ROUTE · BY AUTO</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", lineHeight: "1" }}>Temple morning</div>
                  <div style={{ fontSize: "12.5px", color: "#D3DCE5" }}>4 stops · done by noon</div>
                </div>
              </Link>
            </div>
            <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              {((v.dots ?? []) as any[]).map((d: any, dIndex: number) => (
                <Fragment key={d?.key ?? dIndex}>
                  <span className="dot" style={{ width: d.w, height: "6px", borderRadius: "3px", background: d.bg }} />
                </Fragment>
              ))}
            </div>
          </div>
          <div className="rise d5" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "6px" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>{v.heading}</h2>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>By distance</div>
            </div>
            {v.empty && (
              <>
                <div style={{ padding: "28px 0", textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>Nothing here yet. Try another category.</div>
              </>
            )}
            {((v.places ?? []) as any[]).map((p: any, pIndex: number) => (
              <Fragment key={p?.key ?? pIndex}>
                <div className="row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", margin: "0 -8px", borderRadius: "18px", borderBottom: "1px solid var(--line)" }}>
                  <Link to="/place" style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--ink)" }}>
                    <div style={{ width: "58px", height: "58px", borderRadius: "16px", background: p.tone, flexShrink: "0" }} />
                    <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600" }}>{p.name}</div>
                      <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{p.meta}</div>
                      <div style={{ fontSize: "12px", color: p.helpColor }}>{p.help}</div>
                    </div>
                  </Link>
                  <button className="tap" onClick={p.toggle} aria-label={p.addLabel} aria-pressed={p.pressed} style={{ width: "44px", height: "44px", borderRadius: "22px", border: `1px solid ${p.addBd}`, background: p.addBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", cursor: "pointer" }}>
                    {p.added && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      </>
                    )}
                    {p.notAdded && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {v.showToast && (
        <>
          <div className="toast" role="status" style={{ position: "absolute", left: "24px", right: "100px", bottom: "104px", padding: "13px 16px", borderRadius: "16px", background: "var(--ink)", color: "var(--bg)", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 16px 30px -14px rgba(17,22,20,0.6)", zIndex: "3" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#2FA58A", flexShrink: "0" }} />
            {v.toastText}
          </div>
        </>
      )}
      <Link to="/sos" className="tap sos" aria-label="Emergency SOS" style={{ position: "absolute", right: "24px", bottom: "100px", width: "60px", height: "60px", borderRadius: "30px", background: "#C8321C", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(200,50,28,0.75)" }}>SOS</Link>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "20px", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(17,22,20,0.6)" }}>
        <Link to="/" className="tap navi" aria-label="Home" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
        <Link to="/explore" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
          Explore
        </Link>
        <Link to="/map" className="tap navi" aria-label="Map" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
          </svg>
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
