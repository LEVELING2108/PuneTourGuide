// Generated from design-reference/deccan/DeccanOffline.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanOffline a{color:var(--primary)}
.scr-deccan-DeccanOffline a:hover{color:var(--primary-strong)}
@keyframes dDeccanOffline-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanOffline-fill{from{width:0}}
.scr-deccan-DeccanOffline .rise{animation:dDeccanOffline-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanOffline .d1{animation-delay:.05s}
.scr-deccan-DeccanOffline .d2{animation-delay:.12s}
.scr-deccan-DeccanOffline .d3{animation-delay:.19s}
.scr-deccan-DeccanOffline .d4{animation-delay:.26s}
.scr-deccan-DeccanOffline .d5{animation-delay:.33s}
.scr-deccan-DeccanOffline .d6{animation-delay:.4s}
.scr-deccan-DeccanOffline .fill{animation:dDeccanOffline-fill 1.2s cubic-bezier(.3,.8,.2,1) .35s both}
.scr-deccan-DeccanOffline .prog{transition:width 2.4s cubic-bezier(.4,.1,.3,1)}
@keyframes dDeccanOffline-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.scr-deccan-DeccanOffline .swap{animation:dDeccanOffline-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanOffline .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanOffline .tap:active{transform:scale(.96)}
.scr-deccan-DeccanOffline .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanOffline .track{transition:background-color .35s}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanOffline *,.scr-deccan-DeccanOffline *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanOfflineView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanOffline" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanOffline" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "calc(var(--sb) + 12px) 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0", zIndex: "6", pointerEvents: "none" }}>
          <defs>
            <pattern id="zz" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zz)" />
        </svg>
        <div className="rise d1" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/settings" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#A4462B" }}>ऑफलाइन नकाशे</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
              Offline{" "}
              <span style={{ fontStyle: "italic", color: "var(--primary)" }}>packs</span>
            </h1>
          </div>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
            Map, nearby hospitals and emergency numbers for places with weak signal.
          </p>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--muted)" }}>
            <span>{v.usedText}</span>
            <span>{v.quotaText}</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "var(--line)", overflow: "hidden" }}>
            <div className="fill" style={{ height: "6px", width: v.usedPct, borderRadius: "3px", background: "var(--primary)", transition: "width .6s" }} />
          </div>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>ON THIS PHONE</div>
          {((v.saved ?? []) as any[]).map((x: any) => (
            <Fragment key={x.key}>
              {x.kept && (
<div className="swap" style={{ background: "var(--surface)", border: "1.5px dashed #D8C6A6", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ padding: "3px", border: "1.5px dashed #CDB894", borderRadius: "4px", flexShrink: "0" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "2px", background: "#3A2A22" }} />
                </div>
                <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", lineHeight: "1.05" }}>{x.name}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{x.meta}</div>
                </div>
                <button className="tap" onClick={x.remove} aria-label={x.removeLabel} style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D8C6A6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </div>
              )}
              {x.gone && !x.warn && (
<div className="swap" style={{ height: "52px", borderRadius: "16px", background: "#EFE4D2", padding: "0 8px 0 16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#4A3D33" }}>
                <span style={{ flex: "1" }}>{x.goneText}</span>
                <button className="tap" onClick={x.undo} style={{ height: "40px", padding: "0 14px", border: "none", borderRadius: "20px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "700", color: "var(--primary)", cursor: "pointer" }}>Undo</button>
              </div>
              )}
              {x.gone && x.warn && (
<div className="swap" style={{ height: "52px", borderRadius: "16px", background: "#FDF0E1", padding: "0 8px 0 16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6E3A0E" }}>
                <span style={{ flex: "1" }}>{x.goneText}</span>
                <button className="tap" onClick={x.undo} style={{ height: "40px", padding: "0 14px", border: "none", borderRadius: "20px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "700", color: "#8A4A12", cursor: "pointer" }}>Undo</button>
              </div>
              )}
            </Fragment>
          ))}
          {v.noneSaved && (
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>Nothing saved yet. Save an area before you head somewhere with weak signal.</div>
          )}
        </div>
        {((v.groups ?? []) as any[]).map((g: any) => (
          <div key={g.key} className="rise d5" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>{g.title}</div>
            {((g.items ?? []) as any[]).map((x: any) => (
              <Fragment key={x.key}>
            <div style={{ background: "var(--surface)", border: "1.5px dashed #D8C6A6", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ padding: "3px", border: "1.5px dashed #CDB894", borderRadius: "4px", flexShrink: "0" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "2px", background: "#A4462B" }} />
              </div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", lineHeight: "1.05" }}>{x.name}</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{x.status}</div>
              </div>
              <button className="tap" onClick={x.download} disabled={x.busy} aria-label={x.downloadLabel} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: "none", background: x.btnBg, color: x.btnFg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{x.btnLabel}</button>
            </div>
            {x.showBar && (
              <>
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--line)", overflow: "hidden" }}>
                  <div className="prog" style={{ height: "4px", width: x.prog, background: "var(--primary)" }} />
                </div>
              </>
            )}
            </div>
              </Fragment>
            ))}
          </div>
        ))}
        <div className="rise d6" style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Auto-download for planned trips</div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.autoText}</div>
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
