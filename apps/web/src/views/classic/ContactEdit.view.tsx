// Generated from design-reference/classic/ContactEdit.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-ContactEdit a{color:var(--primary)}
.scr-classic-ContactEdit a:hover{color:var(--primary-strong)}
@keyframes cContactEdit-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cContactEdit-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.scr-classic-ContactEdit .rise{animation:cContactEdit-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-ContactEdit .swap{animation:cContactEdit-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-ContactEdit .d1{animation-delay:.05s}
.scr-classic-ContactEdit .d2{animation-delay:.12s}
.scr-classic-ContactEdit .d3{animation-delay:.19s}
.scr-classic-ContactEdit .d4{animation-delay:.26s}
.scr-classic-ContactEdit .d5{animation-delay:.33s}
.scr-classic-ContactEdit .d6{animation-delay:.4s}
.scr-classic-ContactEdit .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-classic-ContactEdit .tap:active{transform:scale(.97)}
.scr-classic-ContactEdit .pick:hover{border-color:var(--primary)}
.scr-classic-ContactEdit .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-ContactEdit .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-ContactEdit .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-ContactEdit .track{transition:background-color .35s}
.scr-classic-ContactEdit .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-ContactEdit .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-ContactEdit .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-ContactEdit *,.scr-classic-ContactEdit *::after{animation:none!important;transition:none!important}}
`;

export default function ContactEditView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-ContactEdit" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-ContactEdit" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/settings/contacts" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>{v.title}</h1>
          <div style={{ width: "44px" }} />
        </div>
        {v.isAdd && (
          <>
            <button className="rise d2 tap pick" onClick={v.pickContact} style={{ height: "54px", flexShrink: "0", borderRadius: "27px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7.5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" />
              </svg>
              {" "}{v.pickLabel}
            </button>
          </>
        )}
        {v.showAvatar && (
          <>
            <div className="rise d2 swap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "40px", background: "#4A3426", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "32px" }}>{v.initial}</div>
            </div>
          </>
        )}
        <label className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NAME</span>
          <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input value={v.name} onChange={v.onName} placeholder="Name" style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>RELATION</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }} role="radiogroup" aria-label="Relation">
            {((v.rels ?? []) as any[]).map((r: any, rIndex: number) => (
              <Fragment key={r?.key ?? rIndex}>
                <button className="tap" role="radio" aria-checked={r.checked} onClick={r.pick} style={{ height: "36px", padding: "0 14px", borderRadius: "18px", border: `1px solid ${r.bd}`, background: r.bg, color: r.fg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{r.label}</button>
              </Fragment>
            ))}
          </div>
        </div>
        <label className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>MOBILE NUMBER</span>
          <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 5px" }}>
            <span style={{ height: "40px", padding: "0 10px", borderRadius: "10px", background: "#F0F1EE", display: "flex", alignItems: "center", fontSize: "14.5px", fontWeight: "600" }}>+91</span>
            <input type="tel" inputMode="numeric" value={v.phone} placeholder="98XXX XXXXX" style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "16px", letterSpacing: "0.04em", background: "transparent", color: "var(--ink)" }} readOnly />
          </span>
        </label>
        <div className="rise d5" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Primary contact</div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Alerted first, and gets a call if they don't open the SMS</div>
          </div>
          <button onClick={v.togglePrimary} aria-label="Primary contact" aria-pressed={v.primaryPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
            <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.primaryTrack }} />
            <span className="knob" style={{ position: "absolute", top: "4px", left: v.primaryKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
          </button>
        </div>
        <div className="rise d6" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/settings/contacts" className="cta" style={{ height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{v.ctaLabel}</Link>
          {v.canRemove && (
            <>
              {v.notConfirming && (
                <>
                  <button className="tap" onClick={v.askRemove} style={{ height: "48px", borderRadius: "24px", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "14.5px", fontWeight: "600", color: "#A3281A", cursor: "pointer" }}>Remove contact</button>
                </>
              )}
              {v.confirming && (
                <>
                  <div className="swap" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "16px", background: "#FBE9E5" }}>
                    <div style={{ flex: "1", fontSize: "13px", color: "#7A1E12" }}>{"Remove "}{v.name}? They won't get SOS alerts.</div>
                    <button className="tap" onClick={v.cancelRemove} style={{ height: "36px", padding: "0 12px", borderRadius: "18px", border: "1px solid #E5B3AA", background: "var(--surface)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "var(--ink)", cursor: "pointer" }}>Keep</button>
                    <Link to="/settings/contacts" className="tap" style={{ height: "36px", padding: "0 12px", borderRadius: "18px", background: "#A3281A", color: "var(--surface)", display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Remove</Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
