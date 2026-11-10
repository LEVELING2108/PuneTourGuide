// Generated from design-reference/classic/Main.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Main a{color:var(--primary)}
.scr-classic-Main a:hover{color:var(--primary-strong)}
@keyframes cMain-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cMain-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-classic-Main .rise{animation:cMain-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Main .d1{animation-delay:.05s}
.scr-classic-Main .d2{animation-delay:.12s}
.scr-classic-Main .d3{animation-delay:.19s}
.scr-classic-Main .d4{animation-delay:.26s}
.scr-classic-Main .d5{animation-delay:.33s}
.scr-classic-Main .d6{animation-delay:.4s}
.scr-classic-Main .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s}
.scr-classic-Main .tap:active{transform:scale(.96)}
.scr-classic-Main .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Main .lift:hover{transform:translateY(-3px);box-shadow:0 18px 36px -18px rgba(17,22,20,.45)}
.scr-classic-Main .lift:active{transform:scale(.98)}
.scr-classic-Main .navi:hover{color:var(--bg)}
.scr-classic-Main .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:cMain-pulse 2.6s ease-out infinite}
.scr-classic-Main .arrow{transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.scr-classic-Main .lift:hover .arrow{transform:translateX(4px)}
@media (prefers-reduced-motion:reduce){.scr-classic-Main *,.scr-classic-Main *::after{animation:none!important;transition:none!important}}
`;

export default function MainView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Main" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Main" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "calc(var(--sab) + 112px)" }}>
        <div style={{ padding: "calc(var(--sb) + 16px) 24px 0", display: "flex", flexDirection: "column", gap: "22px" }}>
          <div className="rise d1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--muted)" }}>{v.dateLine}</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "44px", fontWeight: "400", lineHeight: "0.98", letterSpacing: "-0.01em" }}>
                Where to,
                <br />
                <span style={{ fontStyle: "italic", color: "var(--primary)" }}>today?</span>
              </h1>
              <div style={{ fontFamily: "'Mukta', sans-serif", fontSize: "14px", color: "var(--muted)" }}>{v.greeting}</div>
            </div>
            <Link to="/settings/language" className="tap" aria-label="Language" style={{ width: "44px", height: "44px", boxSizing: "border-box", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", fontFamily: "'Mukta', sans-serif", fontSize: "15px", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>अ</Link>
          </div>
          <label className="rise d2" style={{ display: "flex", alignItems: "center", gap: "12px", height: "52px", padding: "0 18px", borderRadius: "26px", background: "var(--surface)", border: "1px solid var(--line)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input type="search" enterKeyHint="search" aria-label="Search" placeholder="Forts, temples, food, hospitals" value={v.q} onChange={v.onQuery} onKeyDown={v.onSearch} style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </label>
          <Link to={v.nextHref} className="rise d3 lift" style={{ position: "relative", height: "178px", borderRadius: "26px", background: "var(--primary)", color: "var(--bg)", padding: "22px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none", overflow: "hidden" }}>
            <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true" style={{ position: "absolute", right: "-60px", top: "-60px", opacity: "0.18" }}>
              <circle cx="110" cy="110" r="70" fill="none" stroke="var(--bg)" strokeWidth="1" />
              <circle cx="110" cy="110" r="96" fill="none" stroke="var(--bg)" strokeWidth="1" />
              <circle cx="110" cy="110" r="44" fill="none" stroke="var(--bg)" strokeWidth="1" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "#A9CFC6" }}>{v.nextKicker}</div>
              <div style={{ fontSize: "12px", color: "#A9CFC6" }}>{v.nextCount}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "34px", lineHeight: "1" }}>{v.nextName}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "13px", color: "#CFE3DE" }}>{v.nextMeta}</div>
                <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </Link>
          {v.notReady && (
            <>
              <Link to="/permissions" className="rise d4 tap" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 12px", margin: "-6px -10px", borderRadius: "18px", background: "#FDF0E1", border: "1px solid #EBC9A0", textDecoration: "none", color: "#6E3A0E" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: "#F6D9B4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A4A12" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Safety not set up</div>
                  <div style={{ fontSize: "12.5px", color: "#8A4A12" }}>{v.setupText}</div>
                </div>
                <span style={{ height: "32px", padding: "0 12px", borderRadius: "16px", background: "#8A4A12", color: "#FDF0E1", display: "flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600" }}>Set up</span>
              </Link>
            </>
          )}
          {v.ready && (
            <>
              <Link to="/profile" className="rise d4 tap" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "4px 2px", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #CFDDD9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Safety ready</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.readyText}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </>
          )}
          <div className="rise d5" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>Collections</h2>
              <Link to="/explore" style={{ fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>See all</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              <Link to="/explore" onClick={v.collections?.[0]?.open} className="lift" style={{ height: "74px", borderRadius: "18px", background: "#4A3426", padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", textDecoration: "none", color: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1" }}>Forts</div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[1]?.open} className="lift" style={{ height: "74px", borderRadius: "18px", background: "#26303B", padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", textDecoration: "none", color: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1" }}>Temples</div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[2]?.open} className="lift" style={{ height: "74px", borderRadius: "18px", background: "#1B2220", padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", textDecoration: "none", color: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1" }}>Heritage</div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[3]?.open} className="lift" style={{ height: "74px", borderRadius: "18px", background: "var(--surface)", border: "1px solid var(--line)", padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1" }}>Food</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Link to="/sos" className="tap sos" aria-label="Emergency SOS" style={{ position: "absolute", right: "24px", bottom: "calc(var(--sab) + 100px)", width: "60px", height: "60px", borderRadius: "30px", background: "#C8321C", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(200,50,28,0.75)" }}>SOS</Link>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "calc(var(--sab) + 20px)", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(17,22,20,0.6)" }}>
        <Link to="/" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
          Home
        </Link>
        <Link to="/explore" className="tap navi" aria-label="Explore" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#A3ADA9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
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
