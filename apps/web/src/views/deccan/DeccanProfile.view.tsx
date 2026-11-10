// Generated from design-reference/deccan/DeccanProfile.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanProfile a{color:var(--primary)}
.scr-deccan-DeccanProfile a:hover{color:var(--primary-strong)}
@keyframes dDeccanProfile-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanProfile-fill{from{width:0}}
@keyframes dDeccanProfile-thud{0%{opacity:0;transform:scale(1.7) rotate(var(--r))}60%{opacity:1;transform:scale(.94) rotate(var(--r))}100%{opacity:1;transform:scale(1) rotate(var(--r))}}
.scr-deccan-DeccanProfile .rise{animation:dDeccanProfile-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanProfile .d1{animation-delay:.05s}
.scr-deccan-DeccanProfile .d2{animation-delay:.12s}
.scr-deccan-DeccanProfile .d3{animation-delay:.19s}
.scr-deccan-DeccanProfile .d4{animation-delay:.26s}
.scr-deccan-DeccanProfile .d5{animation-delay:.33s}
.scr-deccan-DeccanProfile .d6{animation-delay:.4s}
.scr-deccan-DeccanProfile .fill{animation:dDeccanProfile-fill 1.4s cubic-bezier(.3,.8,.2,1) .4s both}
.scr-deccan-DeccanProfile .pm{animation:dDeccanProfile-thud .5s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanProfile .s1{animation-delay:.5s}
.scr-deccan-DeccanProfile .s2{animation-delay:.62s}
.scr-deccan-DeccanProfile .s3{animation-delay:.74s}
.scr-deccan-DeccanProfile .s4{animation-delay:.86s}
.scr-deccan-DeccanProfile .s5{animation-delay:.98s}
.scr-deccan-DeccanProfile .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s}
.scr-deccan-DeccanProfile .tap:active{transform:scale(.97)}
.scr-deccan-DeccanProfile .row{transition:background-color .3s}
.scr-deccan-DeccanProfile .row:hover{background-color:var(--surface)}
.scr-deccan-DeccanProfile .navi:hover{color:var(--bg)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanProfile *,.scr-deccan-DeccanProfile *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanProfileView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanProfile" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanProfile" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "calc(var(--sab) + 112px)" }}>
        <div style={{ padding: "calc(var(--sb) + 12px) 22px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="rise d1">
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", color: "#A4462B", lineHeight: "1.2" }}>माझा पासपोर्ट</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "38px", fontWeight: "400", lineHeight: "1" }}>
              Travel{" "}
              <span style={{ fontStyle: "italic", color: "var(--primary)" }}>passport</span>
            </h1>
          </div>
          <Link to={v.editHref} className="rise d2 tap" style={{ position: "relative", display: "block", borderRadius: "16px", overflow: "hidden", background: "var(--primary)", color: "var(--surface)", padding: "22px 18px 16px", textDecoration: "none", boxShadow: "0 20px 34px -22px rgba(92,18,57,0.8)" }}>
            <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0" }}>
              <defs>
                <pattern id="zq" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="var(--gold)" />
                  <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
                </pattern>
              </defs>
              <rect width="390" height="10" fill="url(#zq)" />
            </svg>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ width: "58px", height: "58px", borderRadius: "29px", border: "1.5px solid #E2B95B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", overflow: "hidden", fontFamily: "var(--font-display)", fontSize: "22px" }}>
                {v.avatarUrl ? <img src={v.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : v.initials}
              </div>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "10.5px", letterSpacing: "0.2em", color: "#F2C9DC" }}>PUNE EXPLORER · PASSPORT</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1.05" }}>{v.name}</div>
                <div style={{ fontSize: "13px", color: "#F2D5E3" }}>{v.levelLine}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#E2B95B" }}>{v.xp}</div>
                <div style={{ fontSize: "10.5px", letterSpacing: "0.14em", color: "#F2C9DC" }}>XP</div>
              </div>
            </div>
            <div style={{ marginTop: "14px", height: "5px", borderRadius: "3px", background: "rgba(255,251,243,0.18)", overflow: "hidden" }}>
              <div className="fill" style={{ width: v.levelPct, height: "5px", background: "#E2B95B" }} />
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#F2C9DC" }}>
              <span>{v.toNextText}</span>
              <span>{v.editText}</span>
            </div>
          </Link>
          <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "400" }}>Stamps collected</h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.stampCount}</div>
                <Link to={v.visitedHref} style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>See all</Link>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", padding: "12px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--line)" }}>
              {((v.stamps ?? []) as any[]).map((st: any) => (
                <div key={st.key} className={`pm ${st.cls}`} title={st.title} style={st.style}>
                  {((st.lines ?? []) as any[]).map((l: any, i: number) => (
                    <span key={i} style={l.style}>
                      {l.text}
                    </span>
                  ))}
                </div>
              ))}
              <Link to="/explore" style={{ height: "80px", borderRadius: "8px", border: "1.5px dashed #CDB894", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "12px", lineHeight: "1.2", textDecoration: "none" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#B5A795" }}>+</span>
                {v.nextText}
              </Link>
            </div>
          </div>
          <div className="rise d4" style={{ display: "flex", flexDirection: "column" }}>
            <Link to="/settings" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "12px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0E5B5E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span style={{ flex: "1", fontSize: "15px", fontWeight: "600" }}>Safety, contacts & settings</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <Link to="/settings/theme" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "12px", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 0 0 18z" fill="var(--primary)" />
              </svg>
              <span style={{ flex: "1", fontSize: "15px", fontWeight: "600" }}>App theme</span>
              <span style={{ fontSize: "14px", color: "var(--muted)" }}>Deccan</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "calc(var(--sab) + 20px)", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(35,28,23,0.6)", borderTop: "2px solid var(--gold)" }}>
        <Link to="/" className="tap navi" aria-label="Home" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
        <Link to="/explore" className="tap navi" aria-label="Explore" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
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
        <Link to="/profile" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
          </svg>
          Profile
        </Link>
      </nav>
    </div>
  );
}
