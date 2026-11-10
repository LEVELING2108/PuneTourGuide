// Generated from design-reference/classic/Plan.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Plan a{color:var(--primary)}
.scr-classic-Plan a:hover{color:var(--primary-strong)}
@keyframes cPlan-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-classic-Plan .rise{animation:cPlan-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Plan .d1{animation-delay:.05s}
.scr-classic-Plan .d2{animation-delay:.12s}
.scr-classic-Plan .d3{animation-delay:.19s}
.scr-classic-Plan .d4{animation-delay:.26s}
.scr-classic-Plan .d5{animation-delay:.33s}
.scr-classic-Plan .d6{animation-delay:.4s}
.scr-classic-Plan .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Plan .tap:active{transform:scale(.96)}
.scr-classic-Plan .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Plan .segtxt{transition:color .35s}
.scr-classic-Plan .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Plan .track{transition:background-color .35s}
.scr-classic-Plan .card{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s,opacity .35s}
.scr-classic-Plan .card:hover{transform:translateY(-2px);box-shadow:0 16px 30px -20px rgba(17,22,20,.45)}
.scr-classic-Plan .check{transition:background-color .3s,border-color .3s}
.scr-classic-Plan .navi:hover{color:var(--bg)}
@keyframes cPlan-toast{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
.scr-classic-Plan .toast{animation:cPlan-toast 3s ease both}
@media (prefers-reduced-motion:reduce){.scr-classic-Plan *,.scr-classic-Plan *::after{animation:none!important;transition:none!important}}
`;

export default function PlanView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Plan" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Plan" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "calc(var(--sab) + 112px)" }}>
        <div style={{ padding: "calc(var(--sb) + 16px) 24px 0", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="rise d1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--muted)" }}>{"YOUR PLAN · "}{v.xpLabel}</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "44px", fontWeight: "400", lineHeight: "0.98" }}>{v.dayName}</h1>
            </div>
            <button className="tap" onClick={v.optimise} aria-busy={v.optBusy} style={{ height: "44px", padding: "0 16px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17l6-6 4 4 6-8" />
                <path d="M15 7h5v5" />
              </svg>
              {v.optLabel}
            </button>
          </div>
          <div className="rise d2" style={{ position: "relative", height: "46px", borderRadius: "23px", background: "#E9EBE7", padding: "4px", boxSizing: "border-box", display: "flex" }}>
            <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "38px", borderRadius: "19px", background: "var(--ink)", transform: `translateX(${v.segX})` }} />
            <button className="segtxt" onClick={v.pickDay1} aria-pressed={v.day1Pressed} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.day1Color, cursor: "pointer" }}>{v.day1Label}</button>
            <button className="segtxt" onClick={v.pickDay2} aria-pressed={v.day2Pressed} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.day2Color, cursor: "pointer" }}>{v.day2Label}</button>
          </div>
          <div className="rise d3" style={{ display: "flex", flexDirection: "column" }}>
            {((v.stops ?? []) as any[]).map((s: any, sIndex: number) => (
              <Fragment key={s?.key ?? sIndex}>
                <div style={{ display: "flex", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
                    <button className="check tap" onClick={s.toggle} aria-label={s.tickLabel} aria-pressed={s.pressed} style={{ width: "24px", height: "24px", borderRadius: "12px", border: `1.5px solid ${s.ring}`, background: s.fill, marginTop: "2px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    </button>
                    <div style={{ flex: "1", width: "1px", background: "#D5DAD6", display: s.line }} />
                  </div>
                  <div style={{ flex: "1", paddingBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>{s.time}</div>
                    <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px", opacity: s.opacity }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1.05" }}>{s.name}</div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#86611F" }}>{s.xp}</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                        <div style={{ fontSize: "12.5px", color: s.helpColor }}>{s.help}</div>
                        {s.moveLabel && (
                          <button className="tap" onClick={s.move} aria-label={s.moveAria} style={{ flexShrink: "0", height: "32px", padding: "0 12px", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--bg)", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}>{s.moveLabel}</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          {v.empty && (
            <>
              <div className="rise d3" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: "1.05" }}>{v.emptyTitle}</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.emptyText}</div>
                <Link to="/explore" style={{ marginTop: "6px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Open Explore</Link>
              </div>
            </>
          )}
          {v.showStart && (
            <>
              <button className="rise d4 tap" onClick={v.startDay} aria-busy={v.startBusy} style={{ height: "60px", borderRadius: "30px", border: "none", background: "var(--primary)", color: "var(--surface)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "12px", padding: "0 20px 0 22px", cursor: "pointer", boxShadow: "0 16px 30px -18px var(--primary)" }}>
                <span style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>{v.startLabel}</span>
                  <span style={{ fontSize: "12.5px", opacity: "0.8" }}>{v.startMeta}</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
          <div className="rise d4" style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: "22px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Share live trip</div>
              <div style={{ fontSize: "12.5px", color: "#A3ADA9" }}>{v.shareText}</div>
            </div>
            <button onClick={v.toggleShare} aria-label="Share live trip" aria-pressed={v.sharing} style={{ position: "relative", width: "52px", height: "32px", borderRadius: "16px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
              <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.trackBg }} />
              <span className="knob" style={{ position: "absolute", top: "4px", left: v.knobLeft, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
            </button>
          </div>
        </div>
      </div>
      {v.showToast && (
        <>
          <div className="toast" role="status" style={{ position: "absolute", left: "24px", right: "24px", bottom: "calc(var(--sab) + 100px)", padding: "13px 16px", borderRadius: "16px", background: "var(--ink)", color: "var(--bg)", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 16px 30px -14px rgba(17,22,20,0.6)", zIndex: "3" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#2FA58A", flexShrink: "0" }} />
            {v.toastText}
          </div>
        </>
      )}
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "calc(var(--sab) + 20px)", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(17,22,20,0.6)" }}>
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
        <Link to="/plan" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Plan
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
