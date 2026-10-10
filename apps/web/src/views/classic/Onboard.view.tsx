// Generated from design-reference/classic/Onboard.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Onboard a{color:var(--primary)}
.scr-classic-Onboard a:hover{color:var(--primary-strong)}
@keyframes cOnboard-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cOnboard-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes cOnboard-spin{to{transform:rotate(360deg)}}
@keyframes cOnboard-grow{from{width:50%}to{width:100%}}
.scr-classic-Onboard .rise{animation:cOnboard-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Onboard .up{animation:cOnboard-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-classic-Onboard .d1{animation-delay:.05s}
.scr-classic-Onboard .d2{animation-delay:.12s}
.scr-classic-Onboard .d3{animation-delay:.25s}
.scr-classic-Onboard .d4{animation-delay:.32s}
.scr-classic-Onboard .d5{animation-delay:.39s}
.scr-classic-Onboard .d6{animation-delay:.46s}
.scr-classic-Onboard .rings{animation:cOnboard-spin 90s linear infinite;transform-origin:50% 50%}
.scr-classic-Onboard .grow{animation:cOnboard-grow 1s cubic-bezier(.3,.8,.2,1) .3s both}
.scr-classic-Onboard .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Onboard .tap:active{transform:scale(.97)}
.scr-classic-Onboard .pick:hover{border-color:var(--primary);box-shadow:0 12px 24px -16px rgba(15,76,66,.5)}
.scr-classic-Onboard .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-Onboard .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-Onboard .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Onboard .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Onboard .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Onboard *,.scr-classic-Onboard *::after{animation:none!important;transition:none!important}}
`;

export default function OnboardView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Onboard" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Onboard" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg className="rings" width="440" height="440" viewBox="0 0 440 440" aria-hidden="true" style={{ position: "absolute", right: "-170px", top: "-160px", opacity: "0.16" }}>
          <circle cx="220" cy="220" r="80" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="130" fill="none" stroke="var(--bg)" strokeDasharray="2 6" />
          <circle cx="220" cy="220" r="180" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="215" fill="none" stroke="var(--bg)" strokeDasharray="1 9" />
        </svg>
        <div style={{ position: "absolute", top: "56px", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "18px", color: "var(--bg)" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: "1", height: "3px", borderRadius: "2px", background: "rgba(246,246,243,0.2)", overflow: "hidden" }}>
              <div className="grow" style={{ height: "3px", background: "var(--bg)", borderRadius: "2px" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#CFE3DE" }}>Step 2 of 2</span>
          </div>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: "400", lineHeight: "0.95" }}>
              Who should we{" "}
              <span style={{ fontStyle: "italic", color: "#A9CFC6" }}>alert?</span>
            </h1>
            <div style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#CFE3DE" }}>
              If you start an SOS, this person gets your live location right away.
            </div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "214px", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "24px 24px 22px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "13px" }}>
        <button className="rise d3 tap pick" onClick={v.pickContact} style={{ height: "54px", flexShrink: "0", borderRadius: "27px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7.5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" />
          </svg>
          {" "}{v.pickLabel}
        </button>
        <div className="rise d3" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--muted)" }}>
          <span style={{ flex: "1", height: "1px", background: "#DDE1DD" }} />
          or add manually
          <span style={{ flex: "1", height: "1px", background: "#DDE1DD" }} />
        </div>
        <label className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NAME</span>
          <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input placeholder="e.g. Aai" aria-label="Their name" maxLength={60} value={v.name} onChange={v.onName} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        <div className="rise d4" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }} role="radiogroup" aria-label="Relation">
          {((v.rels ?? []) as any[]).map((r: any, rIndex: number) => (
            <Fragment key={r?.key ?? rIndex}>
              <button className="tap" role="radio" aria-checked={r.checked} onClick={r.pick} style={{ height: "34px", padding: "0 14px", borderRadius: "17px", border: `1px solid ${r.bd}`, background: r.bg, color: r.fg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{r.label}</button>
            </Fragment>
          ))}
        </div>
        <label className="rise d5" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>MOBILE NUMBER</span>
          <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 5px" }}>
            <span style={{ height: "38px", padding: "0 10px", borderRadius: "10px", background: "#F0F1EE", display: "flex", alignItems: "center", fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>+91</span>
            <input type="tel" inputMode="numeric" placeholder="98XXX XXXXX" aria-label="Their mobile number" autoComplete="off" value={v.phone} onChange={v.onPhone} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "16px", letterSpacing: "0.04em", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        <div className="rise d5" style={{ borderRadius: "16px", background: "var(--surface)", border: "1px solid var(--line)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", color: "var(--muted)" }}>{"WHAT "}{v.whoUpper}{" WILL GET"}</div>
          <div style={{ alignSelf: "flex-start", maxWidth: "92%", padding: "9px 12px", borderRadius: "14px 14px 14px 4px", background: "#F0F1EE", fontSize: "12.5px", lineHeight: "1.45", color: "var(--ink)" }}>
            Sourav started an SOS on Pune Explorer. Live location: [link]. Nearest hospital: KEM, 1.2 km.
          </div>
        </div>
        {v.error && <div role="alert" style={{ fontSize: "13px", color: "#A3281A", lineHeight: "1.4" }}>{v.error}</div>}
        <Link to="/" onClick={v.save} aria-disabled={v.saveDisabled} className="rise d6 cta" style={{ height: "56px", flexShrink: "0", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", marginTop: "auto" }}>Save & start exploring</Link>
        <Link to="/" onClick={v.skip} className="rise d6" style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", textDecoration: "none" }}>Skip for now · SOS will still call 112</Link>
      </div>
    </div>
  );
}
