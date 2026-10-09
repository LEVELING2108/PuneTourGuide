// Generated from design-reference/classic/Offline.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Offline a{color:var(--primary)}
.scr-classic-Offline a:hover{color:var(--primary-strong)}
@keyframes cOffline-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cOffline-fill{from{width:0}}
.scr-classic-Offline .rise{animation:cOffline-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Offline .d1{animation-delay:.05s}
.scr-classic-Offline .d2{animation-delay:.12s}
.scr-classic-Offline .d3{animation-delay:.19s}
.scr-classic-Offline .d4{animation-delay:.26s}
.scr-classic-Offline .d5{animation-delay:.33s}
.scr-classic-Offline .d6{animation-delay:.4s}
.scr-classic-Offline .fill{animation:cOffline-fill 1.2s cubic-bezier(.3,.8,.2,1) .35s both}
.scr-classic-Offline .prog{transition:width 2.4s cubic-bezier(.4,.1,.3,1)}
@keyframes cOffline-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.scr-classic-Offline .swap{animation:cOffline-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Offline .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Offline .tap:active{transform:scale(.96)}
.scr-classic-Offline .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Offline .track{transition:background-color .35s}
@media (prefers-reduced-motion:reduce){.scr-classic-Offline *,.scr-classic-Offline *::after{animation:none!important;transition:none!important}}
`;

export default function OfflineView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Offline" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Offline" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
            Offline{" "}
            <span style={{ fontStyle: "italic", color: "var(--primary)" }}>packs</span>
          </h1>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
            Map, nearby hospitals and emergency numbers for places with weak signal.
          </p>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--muted)" }}>
            <span>{v.usedText}</span>
            <span>of 2 GB</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "var(--line)", overflow: "hidden" }}>
            <div className="fill" style={{ height: "6px", width: v.usedPct, borderRadius: "3px", background: "var(--primary)", transition: "width .6s" }} />
          </div>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>ON THIS PHONE</div>
          {v.keepOld && (
            <>
              <div className="swap" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#1B2220", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", lineHeight: "1.05" }}>Old Pune peths</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>18 MB · 12 hospitals · updated today</div>
                </div>
                <button className="tap" onClick={v.removeOld} aria-label="Delete Old Pune peths pack" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </div>
            </>
          )}
          {v.oldGone && (
            <>
              <div className="swap" style={{ height: "52px", borderRadius: "16px", background: "#F0F1EE", padding: "0 8px 0 16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#4A5451" }}>
                <span style={{ flex: "1" }}>Old Pune peths removed · 18 MB freed</span>
                <button className="tap" onClick={v.undoOld} style={{ height: "40px", padding: "0 14px", border: "none", borderRadius: "20px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "700", color: "var(--primary)", cursor: "pointer" }}>Undo</button>
              </div>
            </>
          )}
          {v.keepSin && (
            <>
              <div className="swap" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#4A3426", flexShrink: "0" }} />
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", lineHeight: "1.05" }}>Sinhagad Fort</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>30 MB · ghat road + fort · 2 days ago</div>
                </div>
                <button className="tap" onClick={v.removeSin} aria-label="Delete Sinhagad Fort pack" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </div>
            </>
          )}
          {v.sinGone && (
            <>
              <div className="swap" style={{ height: "52px", borderRadius: "16px", background: "#FDF0E1", padding: "0 8px 0 16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6E3A0E" }}>
                <span style={{ flex: "1" }}>Sinhagad removed · it's in your plan and has weak signal</span>
                <button className="tap" onClick={v.undoSin} style={{ height: "40px", padding: "0 14px", border: "none", borderRadius: "20px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "700", color: "#8A4A12", cursor: "pointer" }}>Undo</button>
              </div>
            </>
          )}
        </div>
        <div className="rise d5" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>SUGGESTED FOR YOUR TRIPS</div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#4A3426", flexShrink: "0" }} />
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", lineHeight: "1.05" }}>Rajgad Fort</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.rajStatus}</div>
              </div>
              <button className="tap" onClick={v.download} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: "none", background: v.btnBg, color: v.btnFg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{v.btnLabel}</button>
            </div>
            {v.showBar && (
              <>
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--line)", overflow: "hidden" }}>
                  <div className="prog" style={{ height: "4px", width: v.prog, background: "var(--primary)" }} />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="rise d6" style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Auto-download for planned trips</div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>On Wi-Fi only</div>
          </div>
          <button onClick={v.toggleAuto} aria-label="Auto-download" aria-pressed={v.autoPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
            <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.autoTrack }} />
            <span className="knob" style={{ position: "absolute", top: "4px", left: v.autoKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
