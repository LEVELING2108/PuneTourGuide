// Generated from design-reference/deccan/DeccanPhoneName.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanPhoneName a{color:var(--primary)}
.scr-deccan-DeccanPhoneName a:hover{color:var(--primary-strong)}
@keyframes dDeccanPhoneName-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanPhoneName-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes dDeccanPhoneName-spin{to{transform:rotate(360deg)}}
@keyframes dDeccanPhoneName-draw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}
@keyframes dDeccanPhoneName-popin{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:none}}
.scr-deccan-DeccanPhoneName .rise{animation:dDeccanPhoneName-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPhoneName .up{animation:dDeccanPhoneName-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-deccan-DeccanPhoneName .d1{animation-delay:.05s}
.scr-deccan-DeccanPhoneName .d2{animation-delay:.12s}
.scr-deccan-DeccanPhoneName .d3{animation-delay:.25s}
.scr-deccan-DeccanPhoneName .d4{animation-delay:.32s}
.scr-deccan-DeccanPhoneName .d5{animation-delay:.39s}
.scr-deccan-DeccanPhoneName .d6{animation-delay:.46s}
.scr-deccan-DeccanPhoneName .rings{animation:dDeccanPhoneName-spin 90s linear infinite;transform-origin:50% 50%}
.scr-deccan-DeccanPhoneName .badge{animation:dDeccanPhoneName-popin .6s cubic-bezier(.2,.7,.2,1) .2s both}
.scr-deccan-DeccanPhoneName .tick{stroke-dasharray:30;animation:dDeccanPhoneName-draw .5s ease-out .6s both}
.scr-deccan-DeccanPhoneName .field{transition:border-color .3s,box-shadow .3s}
.scr-deccan-DeccanPhoneName .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(122,31,78,.12)}
.scr-deccan-DeccanPhoneName .box{transition:background-color .25s,border-color .25s}
.scr-deccan-DeccanPhoneName .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s,background-color .35s}
.scr-deccan-DeccanPhoneName .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanPhoneName .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanPhoneName *,.scr-deccan-DeccanPhoneName *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanPhoneNameView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanPhoneName" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanPhoneName" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0", zIndex: "5" }}>
          <defs>
            <pattern id="zz" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zz)" />
        </svg>
        <div aria-hidden="true" style={{ position: "absolute", right: "54px", top: "calc(var(--sb) + 86px)", width: "58px", height: "58px", borderRadius: "29px", background: "#E2B95B", opacity: "0.85" }} />
        <svg width="390" height="80" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", top: "calc(var(--sb) + 164px)", opacity: "0.9" }}>
          <path d="M0 74 Q60 34 120 58 T240 44 T390 54 V96 H0 Z" fill="#6A1A44" />
          <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H118 V52 H126 V58 H134 V52 H142 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#4E0F30" />
        </svg>
        <div style={{ position: "absolute", top: "calc(var(--sb) + 20px)", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "22px", color: "var(--bg)" }}>
          <div className="badge" style={{ width: "52px", height: "52px", borderRadius: "26px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path className="tick" d="M5 12l5 5 9-10" />
            </svg>
          </div>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#E2B95B" }}>जवळजवळ झालं</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "46px", fontWeight: "400", lineHeight: "0.95" }}>
                Almost{" "}
                <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>there</span>
              </h1>
            </div>
            <div style={{ fontSize: "14px", color: "#F2D5E3" }}>
              +91 98••• ••210 is verified. This number is new, so let's set up your account.
            </div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "calc(var(--sb) + 236px)", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "30px 24px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px" }}>
        <label className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>WHAT SHOULD WE CALL YOU?</span>
          <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input placeholder="Your name" autoComplete="name" aria-label="Your name" maxLength={60} value={v.name} onChange={v.onName} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        <label className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Optional</span>
          </span>
          <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input type="email" placeholder="For trip summaries and account recovery" autoComplete="email" aria-label="Email (optional)" value={v.email} onChange={v.onEmail} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "14.5px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        <div className="rise d5" style={{ display: "flex", alignItems: "flex-start", gap: "10px", textAlign: "left", fontFamily: "var(--font-body)" }}>
          <button onClick={v.toggleAgree} role="checkbox" aria-checked={v.agreeChecked} aria-labelledby="agree-text" style={{ border: "none", background: "transparent", padding: "0", cursor: "pointer", flexShrink: "0", display: "flex" }}>
          <span className="box" style={{ width: "20px", height: "20px", borderRadius: "6px", border: `1.5px solid ${v.boxBd}`, background: v.boxBg, boxSizing: "border-box", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </span>
          </button>
          <span id="agree-text" onClick={v.agreeTextClick} style={{ fontSize: "13px", lineHeight: "1.45", color: "var(--muted)", cursor: "pointer" }}>
            I agree to the{" "}
            <Link to="/terms" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Privacy Policy</Link>
          </span>
        </div>
        {v.error && <div role="alert" style={{ fontSize: "13px", color: "#A3281A", lineHeight: "1.4" }}>{v.error}</div>}
        <Link to="/first-contact" onClick={v.submit} className="rise d5 cta" aria-disabled={v.ctaDisabled} style={{ height: "56px", borderRadius: "28px", background: v.ctaBg, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", marginTop: "4px" }}>
          Continue{" "}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <div className="rise d6" style={{ marginTop: "auto", display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "14px", background: "#F5E6EE" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0", marginTop: "1px" }}>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#4A1530" }}>
            Next, we'll ask for one emergency contact. It takes 20 seconds and makes SOS work from day one.
          </div>
        </div>
      </div>
    </div>
  );
}
