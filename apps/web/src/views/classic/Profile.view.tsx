// Generated from design-reference/classic/Profile.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Profile a{color:var(--primary)}
.scr-classic-Profile a:hover{color:var(--primary-strong)}
@keyframes cProfile-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cProfile-fill{from{width:0}}
.scr-classic-Profile .rise{animation:cProfile-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Profile .d1{animation-delay:.05s}
.scr-classic-Profile .d2{animation-delay:.12s}
.scr-classic-Profile .d3{animation-delay:.19s}
.scr-classic-Profile .d4{animation-delay:.26s}
.scr-classic-Profile .d5{animation-delay:.33s}
.scr-classic-Profile .d6{animation-delay:.4s}
.scr-classic-Profile .fill{animation:cProfile-fill 1.4s cubic-bezier(.3,.8,.2,1) .4s both}
.scr-classic-Profile .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s}
.scr-classic-Profile .tap:active{transform:scale(.96)}
.scr-classic-Profile .row{transition:background-color .3s}
.scr-classic-Profile .row:hover{background-color:var(--bg)}
.scr-classic-Profile .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Profile .track{transition:background-color .35s}
.scr-classic-Profile .navi:hover{color:var(--bg)}
@media (prefers-reduced-motion:reduce){.scr-classic-Profile *,.scr-classic-Profile *::after{animation:none!important;transition:none!important}}
`;

export default function ProfileView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Profile" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Profile" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "112px" }}>
        <div style={{ padding: "60px 24px 0", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "32px", background: "var(--primary)", position: "relative", overflow: "hidden", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "26px", flexShrink: "0" }}>{v.avatarUrl ? <img src={v.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : v.initials}</div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "400", lineHeight: "1" }}>{v.name}</h1>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.since}</div>
            </div>
            <Link to={v.editHref} className="tap" aria-label={v.editLabel} style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L19 9l-4-4L4 16z" />
                <path d="M13 7l4 4" />
              </svg>
            </Link>
          </div>
          <div className="rise d2" style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: "24px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.16em", color: "#A3ADA9" }}>{v.levelKicker}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", lineHeight: "1" }}>{v.levelName}</div>
              </div>
              <div style={{ fontSize: "13px", color: "#D9B676", fontWeight: "600" }}>{v.xpText}</div>
            </div>
            <div style={{ height: "6px", borderRadius: "3px", background: "#2A322F", overflow: "hidden" }}>
              <div className="fill" style={{ width: v.levelPct, height: "6px", borderRadius: "3px", background: "#D9B676" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#A3ADA9" }}>
              <span>{v.statsText}</span>
              <span>{v.toNextText}</span>
            </div>
          </div>
          <Link to={v.visitedHref} className="rise d2 row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "20px", background: "var(--surface)", border: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "15px", fontWeight: "600" }}>Places visited</div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.visitedText}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
          <div className="rise d3" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "4px" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "400" }}>Safety profile</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "var(--primary)" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "4px", background: v.safetyDot }} />
                {v.safetyStatus}
              </div>
            </div>
            <Link to="/settings/contacts" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5" />
                <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.7.8 2.7 2.6 3 5.2" />
              </svg>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Emergency contacts</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.contactsText}</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <Link to="/settings/medical" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="17" rx="2" />
                <path d="M9 3v3h6V3M12 10v6M9 13h6" />
              </svg>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Medical info</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.medicalText}</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <div className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="3" width="10" height="18" rx="2" />
                <path d="M3 8l1.5 1.5L3 11M21 8l-1.5 1.5L21 11" />
              </svg>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Shake to SOS</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.shakeText}</div>
              </div>
              <button onClick={v.toggleShake} aria-label="Shake to SOS" aria-pressed={v.shakePressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
                <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.shakeTrack }} />
                <span className="knob" style={{ position: "absolute", top: "4px", left: v.shakeKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
              </button>
            </div>
            <Link to="/settings/offline" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
              </svg>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Offline packs</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.offlineText}</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="rise d4" style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "400" }}>Settings</h2>
            <Link to="/settings/language" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <span style={{ width: "19px", textAlign: "center", fontFamily: "'Mukta', sans-serif", fontSize: "17px", color: "var(--primary)" }}>अ</span>
              <div style={{ flex: "1", fontSize: "14.5px", fontWeight: "600" }}>Language</div>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.languageText}</div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <Link to="/settings/theme" className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 0 0 18z" fill="var(--primary)" />
              </svg>
              <div style={{ flex: "1", fontSize: "14.5px", fontWeight: "600" }}>App theme</div>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>{v.themeText}</div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <div className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", borderBottom: "1px solid var(--line)" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
                <path d="M10 21h4" />
              </svg>
              <div style={{ flex: "1", fontSize: "14.5px", fontWeight: "600" }}>Trip reminders</div>
              <button onClick={v.toggleNotify} aria-label="Trip reminders" aria-pressed={v.notifyPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
                <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.notifyTrack }} />
                <span className="knob" style={{ position: "absolute", top: "4px", left: v.notifyKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
              </button>
            </div>
            <Link to={v.signHref} className="row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 8px", margin: "0 -8px", borderRadius: "14px", textDecoration: "none", color: "#A3281A" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" />
              </svg>
              <div style={{ flex: "1", fontSize: "14.5px", fontWeight: "600" }}>{v.signLabel}</div>
            </Link>
          </div>
        </div>
      </div>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "20px", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(17,22,20,0.6)" }}>
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
        <Link to="/profile" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
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
