// Generated from design-reference/deccan/DeccanPlan.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanPlan a{color:var(--primary)}
.scr-deccan-DeccanPlan a:hover{color:var(--primary-strong)}
@keyframes dDeccanPlan-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanPlan-stamp{0%{opacity:0;transform:rotate(-14deg) scale(1.8)}60%{opacity:.9;transform:rotate(-14deg) scale(.92)}100%{opacity:.9;transform:rotate(-14deg) scale(1)}}
.scr-deccan-DeccanPlan .rise{animation:dDeccanPlan-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPlan .d1{animation-delay:.05s}
.scr-deccan-DeccanPlan .d2{animation-delay:.12s}
.scr-deccan-DeccanPlan .d3{animation-delay:.19s}
.scr-deccan-DeccanPlan .d4{animation-delay:.26s}
.scr-deccan-DeccanPlan .d5{animation-delay:.33s}
.scr-deccan-DeccanPlan .d6{animation-delay:.4s}
.scr-deccan-DeccanPlan .stamp{animation:dDeccanPlan-stamp .5s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPlan .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s}
.scr-deccan-DeccanPlan .tap:active{transform:scale(.97)}
.scr-deccan-DeccanPlan .ticket{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanPlan .ticket:hover{transform:translateY(-2px);box-shadow:0 16px 28px -18px rgba(35,28,23,.5)}
.scr-deccan-DeccanPlan .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanPlan .segtxt{transition:color .35s}
.scr-deccan-DeccanPlan .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanPlan .track{transition:background-color .35s}
.scr-deccan-DeccanPlan .navi:hover{color:var(--bg)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanPlan *,.scr-deccan-DeccanPlan *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanPlanView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanPlan" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanPlan" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "112px" }}>
        <div style={{ padding: "54px 22px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="rise d1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", color: "#A4462B", lineHeight: "1.2" }}>आजचा प्रवास</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "38px", fontWeight: "400", lineHeight: "1" }}>
                {v.dayName}{" "}
                <span style={{ fontStyle: "italic", color: "var(--primary)" }}>journey</span>
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#8A6420" }}>{v.xp}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--muted)" }}>XP TODAY</div>
            </div>
          </div>
          <div className="rise d2" style={{ position: "relative", height: "44px", borderRadius: "22px", background: "#E7DAC4", padding: "4px", boxSizing: "border-box", display: "flex" }}>
            <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "36px", borderRadius: "18px", background: "var(--ink)", transform: `translateX(${v.segX})` }} />
            <button className="segtxt" onClick={v.pickDay1} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "14.5px", fontWeight: "600", color: v.c1, cursor: "pointer" }}>Day 1 · Sat</button>
            <button className="segtxt" onClick={v.pickDay2} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "14.5px", fontWeight: "600", color: v.c2, cursor: "pointer" }}>Day 2 · Sun</button>
          </div>
          <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {((v.stops ?? []) as any[]).map((s: any, sIndex: number) => (
              <Fragment key={s?.key ?? sIndex}>
                <div className="ticket" style={{ position: "relative", height: "96px", display: "flex", borderRadius: "16px", overflow: "hidden", background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <div style={{ width: "84px", background: s.tone, color: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.16em", opacity: "0.85" }}>{"STOP "}{s.no}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", lineHeight: "1" }}>{s.time}</div>
                    <div style={{ fontSize: "11px", opacity: "0.85" }}>{s.ampm}</div>
                  </div>
                  <div style={{ width: "0", borderLeft: "2px dashed #D8C6A6" }} />
                  <div style={{ flex: "1", minWidth: "0", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "19px", lineHeight: "1.1" }}>{s.name}</div>
                    <div style={{ fontSize: "13px", color: s.helpColor }}>{s.help}</div>
                    <div style={{ fontSize: "12.5px", fontWeight: "600", color: "#8A6420" }}>+{s.xp}{" XP"}</div>
                  </div>
                  <button className="tap" onClick={s.toggle} aria-label="Mark visited" aria-pressed={s.pressed} style={{ alignSelf: "center", marginRight: "12px", width: "40px", height: "40px", borderRadius: "20px", border: `1.5px solid ${s.ring}`, background: s.fill, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={s.tick} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </button>
                  <span style={{ position: "absolute", left: "76px", top: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)", border: "1px solid var(--line)", boxSizing: "border-box" }} />
                  <span style={{ position: "absolute", left: "76px", bottom: "-9px", width: "18px", height: "18px", borderRadius: "9px", background: "var(--bg)", border: "1px solid var(--line)", boxSizing: "border-box" }} />
                  {s.done && (
                    <>
                      <div className="stamp" aria-hidden="true" style={{ position: "absolute", right: "60px", top: "18px", width: "64px", height: "64px", borderRadius: "32px", border: "2px solid var(--primary)", color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", lineHeight: "1.2", pointerEvents: "none" }}>
                        <span>PUNE</span>
                        <span style={{ fontFamily: "var(--font-accent)", fontSize: "13px", letterSpacing: "0" }}>पाहिले</span>
                        <span>VISITED</span>
                      </div>
                    </>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          <div className="rise d4" style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: "18px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", borderTop: "3px solid var(--gold)" }}>
            <div style={{ flex: "1" }}>
              <div style={{ fontSize: "15px", fontWeight: "600" }}>Share live trip</div>
              <div style={{ fontSize: "13px", color: "#B5A795" }}>{v.shareText}</div>
            </div>
            <button onClick={v.toggleShare} aria-label="Share live trip" aria-pressed={v.sharePressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
              <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.trackBg }} />
              <span className="knob" style={{ position: "absolute", top: "4px", left: v.knob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
            </button>
          </div>
        </div>
      </div>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "20px", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(35,28,23,0.6)", borderTop: "2px solid var(--gold)" }}>
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
        <Link to="/plan" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Plan
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
