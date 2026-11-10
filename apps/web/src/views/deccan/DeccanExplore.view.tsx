// Generated from design-reference/deccan/DeccanExplore.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanExplore a{color:var(--primary)}
.scr-deccan-DeccanExplore a:hover{color:var(--primary-strong)}
@keyframes dDeccanExplore-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanExplore-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-deccan-DeccanExplore .rise{animation:dDeccanExplore-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanExplore .d1{animation-delay:.05s}
.scr-deccan-DeccanExplore .d2{animation-delay:.12s}
.scr-deccan-DeccanExplore .d3{animation-delay:.19s}
.scr-deccan-DeccanExplore .d4{animation-delay:.26s}
.scr-deccan-DeccanExplore .d5{animation-delay:.33s}
.scr-deccan-DeccanExplore .d6{animation-delay:.4s}
.scr-deccan-DeccanExplore .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanExplore .tap:active{transform:scale(.96)}
.scr-deccan-DeccanExplore .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanExplore .lift:hover{transform:translateY(-3px);box-shadow:0 18px 32px -18px rgba(35,28,23,.5)}
.scr-deccan-DeccanExplore .row{transition:background-color .3s}
.scr-deccan-DeccanExplore .row:hover{background-color:var(--surface)}
.scr-deccan-DeccanExplore .navi:hover{color:var(--bg)}
.scr-deccan-DeccanExplore .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:dDeccanExplore-pulse 2.6s ease-out infinite}
.scr-deccan-DeccanExplore .slide{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain}
.scr-deccan-DeccanExplore .slide::-webkit-scrollbar{display:none}
.scr-deccan-DeccanExplore .slide>*{scroll-snap-align:start}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanExplore *,.scr-deccan-DeccanExplore *::after{animation:none!important;transition:none!important}}
@keyframes dDeccanExplore-toast{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
.scr-deccan-DeccanExplore .toast{animation:dDeccanExplore-toast 2.6s ease both}
`;

export default function DeccanExploreView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanExplore" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanExplore" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "calc(var(--sab) + 112px)" }}>
        <div style={{ padding: "calc(var(--sb) + 12px) 22px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="rise d1" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", color: "#A4462B", lineHeight: "1.2" }}>शोधा</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
              Explore{" "}
              <span style={{ fontStyle: "italic", color: "var(--primary)" }}>Pune</span>
            </h1>
          </div>
          <div className="rise d2" style={{ display: "flex", gap: "10px" }}>
            <label style={{ flex: "1", display: "flex", alignItems: "center", gap: "12px", height: "50px", padding: "0 18px", borderRadius: "25px", background: "var(--surface)", border: "1px solid #DCCDB6" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input type="search" enterKeyHint="search" aria-label="Search places" placeholder="Forts, wadas, misal spots" value={v.q} onChange={v.onQuery} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15.5px", background: "transparent", color: "var(--ink)" }} />
            </label>
            <Link to="/explore/filters" className="tap" aria-label="Filters" style={{ width: "50px", height: "50px", flexShrink: "0", borderRadius: "25px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="8" cy="17" r="2" />
              </svg>
            </Link>
          </div>
          <div className="rise d3 slide" style={{ display: "flex", gap: "8px", margin: "0 -22px", padding: "0 22px", scrollPaddingInline: "22px" }}>
            {((v.chips ?? []) as any[]).map((c: any, cIndex: number) => (
              <Fragment key={c?.key ?? cIndex}>
                <button className="tap" onClick={c.pick} aria-pressed={c.pressed} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", flexShrink: "0", cursor: "pointer" }}>{c.label}</button>
              </Fragment>
            ))}
          </div>
          <div className="rise d4 slide" style={{ display: "flex", gap: "12px", margin: "0 -22px", padding: "0 22px", scrollPaddingInline: "22px" }}>
            <Link to="/plan" className="lift" onClick={v.routes?.[0]?.load} style={{ flex: "0 0 300px", height: "118px", display: "flex", textDecoration: "none", color: "var(--surface)", borderRadius: "18px", overflow: "hidden", position: "relative" }}>
              <div style={{ flex: "1", background: "var(--primary)", padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#F2C9DC" }}>YATRA · ON FOOT</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1.05" }}>{v.routes?.[0]?.deccanTitle}</div>
                  <div style={{ fontSize: "12.5px", color: "#F2D5E3" }}>{v.routes?.[0]?.deccanSummary}</div>
                </div>
              </div>
              <div style={{ width: "0", borderLeft: "2px dashed var(--bg)", opacity: "0.7" }} />
              <div style={{ width: "72px", background: "var(--primary-strong)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>5</div>
                <div style={{ fontSize: "11px", color: "#F2C9DC", letterSpacing: "0.1em" }}>STOPS</div>
              </div>
              <span style={{ position: "absolute", left: "218px", top: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)" }} />
              <span style={{ position: "absolute", left: "218px", bottom: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)" }} />
            </Link>
            <Link to="/plan" className="lift" onClick={v.routes?.[1]?.load} style={{ flex: "0 0 300px", height: "118px", display: "flex", textDecoration: "none", color: "var(--surface)", borderRadius: "18px", overflow: "hidden", position: "relative" }}>
              <div style={{ flex: "1", background: "#0E5B5E", padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#B9DAD6" }}>YATRA · SAHYADRI</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1.05" }}>{v.routes?.[1]?.deccanTitle}</div>
                  <div style={{ fontSize: "12.5px", color: "#D4E8E5" }}>{v.routes?.[1]?.deccanSummary}</div>
                </div>
              </div>
              <div style={{ width: "0", borderLeft: "2px dashed var(--bg)", opacity: "0.7" }} />
              <div style={{ width: "72px", background: "#073638", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>2</div>
                <div style={{ fontSize: "11px", color: "#B9DAD6", letterSpacing: "0.1em" }}>DAYS</div>
              </div>
              <span style={{ position: "absolute", left: "218px", top: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)" }} />
              <span style={{ position: "absolute", left: "218px", bottom: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)" }} />
            </Link>
          </div>
          <div className="rise d5" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "4px" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "400" }}>{v.heading}</h2>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.sortLabel}</div>
            </div>
            {v.empty && <div style={{ padding: "18px 0", fontSize: "14px", color: "var(--muted)" }}>{v.emptyText}</div>}
            {((v.places ?? []) as any[]).map((p: any, pIndex: number) => (
              <Fragment key={p?.key ?? pIndex}>
                <div className="row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", margin: "0 -8px", borderRadius: "16px", borderBottom: "1px solid var(--line)" }}>
                <Link to={p.href} style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--ink)" }}>
                  <div style={{ padding: "3px", border: "1.5px dashed #CDB894", borderRadius: "4px", background: "var(--surface)", flexShrink: "0" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "2px", background: p.tone, color: "var(--surface)", fontFamily: "var(--font-accent)", fontSize: "13px", display: "flex", alignItems: "flex-end", padding: "4px", boxSizing: "border-box" }}>{p.mr}</div>
                  </div>
                  <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", lineHeight: "1.15" }}>{p.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--muted)" }}>{p.meta}</div>
                    <div style={{ fontSize: "12.5px", color: p.helpColor }}>{p.help}</div>
                  </div>
                </Link>
                <button className="tap" onClick={p.toggle} aria-label={p.addLabel} aria-pressed={p.pressed} style={{ width: "42px", height: "42px", borderRadius: "21px", border: `1.5px dashed ${p.addBd}`, background: p.addBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", cursor: "pointer" }}>
                  {p.added && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                  {p.notAdded && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </button>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {v.showToast && (
        <div className="toast" role="status" style={{ position: "absolute", left: "22px", right: "100px", bottom: "calc(var(--sab) + 104px)", padding: "13px 16px", borderRadius: "14px", background: "var(--ink)", color: "var(--bg)", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 16px 30px -14px rgba(35,28,23,0.6)", borderLeft: "3px solid var(--gold)", zIndex: "3" }}>
          {v.toastText}
        </div>
      )}
      <Link to="/sos" className="tap sos" aria-label="Emergency SOS" style={{ position: "absolute", right: "22px", bottom: "calc(var(--sab) + 100px)", width: "60px", height: "60px", borderRadius: "30px", background: "#C8321C", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(200,50,28,0.75)" }}>SOS</Link>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "calc(var(--sab) + 20px)", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(35,28,23,0.6)", borderTop: "2px solid var(--gold)" }}>
        <Link to="/" className="tap navi" aria-label="Home" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
        <Link to="/explore" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
          Explore
        </Link>
        <Link to="/map" className="tap navi" aria-label="Map" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
          </svg>
        </Link>
        <Link to="/plan" className="tap navi" aria-label="Plan" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </Link>
        <Link to="/profile" className="tap navi" aria-label="Profile" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
