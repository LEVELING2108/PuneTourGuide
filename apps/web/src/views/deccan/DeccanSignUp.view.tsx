// Generated from design-reference/deccan/DeccanSignUp.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';
import { GoogleButton } from '../../components/GoogleButton';
import { GoogleG } from '../../components/GoogleG';

const css = `
.scr-deccan-DeccanSignUp a{color:var(--primary)}
.scr-deccan-DeccanSignUp a:hover{color:var(--primary-strong)}
@keyframes dDeccanSignUp-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanSignUp-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes dDeccanSignUp-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes dDeccanSignUp-spin{to{transform:rotate(360deg)}}
.scr-deccan-DeccanSignUp .rise{animation:dDeccanSignUp-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanSignUp .up{animation:dDeccanSignUp-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-deccan-DeccanSignUp .swap{animation:dDeccanSignUp-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanSignUp .d1{animation-delay:.05s}
.scr-deccan-DeccanSignUp .d2{animation-delay:.12s}
.scr-deccan-DeccanSignUp .d3{animation-delay:.25s}
.scr-deccan-DeccanSignUp .d4{animation-delay:.32s}
.scr-deccan-DeccanSignUp .d5{animation-delay:.39s}
.scr-deccan-DeccanSignUp .d6{animation-delay:.46s}
.scr-deccan-DeccanSignUp .rings{animation:dDeccanSignUp-spin 90s linear infinite;transform-origin:50% 50%}
.scr-deccan-DeccanSignUp .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanSignUp .tap:active{transform:scale(.97)}
.scr-deccan-DeccanSignUp .gbtn:hover{border-color:var(--ink);box-shadow:0 12px 24px -16px rgba(35,28,23,.45)}
.scr-deccan-DeccanSignUp .field{transition:border-color .3s,box-shadow .3s}
.scr-deccan-DeccanSignUp .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(122,31,78,.12)}
.scr-deccan-DeccanSignUp .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanSignUp .segtxt{transition:color .35s}
.scr-deccan-DeccanSignUp .bar{transition:background-color .35s}
.scr-deccan-DeccanSignUp .box{transition:background-color .25s,border-color .25s}
.scr-deccan-DeccanSignUp .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s,background-color .35s}
.scr-deccan-DeccanSignUp .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanSignUp .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanSignUp *,.scr-deccan-DeccanSignUp *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanSignUpView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanSignUp" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanSignUp" precedence="screens">{css}</style>
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
        <div aria-hidden="true" style={{ position: "absolute", right: "54px", top: "56px", width: "58px", height: "58px", borderRadius: "29px", background: "#E2B95B", opacity: "0.85" }} />
        <svg width="390" height="80" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", top: "134px", opacity: "0.9" }}>
          <path d="M0 74 Q60 34 120 58 T240 44 T390 54 V96 H0 Z" fill="#6A1A44" />
          <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H118 V52 H126 V58 H134 V52 H142 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#4E0F30" />
        </svg>
        <div style={{ position: "absolute", top: "56px", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "20px", color: "var(--bg)" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/login" className="tap" aria-label="Back to log in" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid rgba(255,251,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </Link>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "19px" }}>Pune Explorer</span>
            <span style={{ width: "40px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#E2B95B" }}>नवीन खाते</div>
            <h1 className="rise d2" style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: "400", lineHeight: "0.95" }}>
              Create your{" "}
              <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>account</span>
            </h1>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "206px", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "24px 24px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "13px" }}>
        <GoogleButton context="signup" className="rise d3" onToken={v.googleToken} onUnavailable={v.googleUnavailable}>
          <Link to="/first-contact" className="tap gbtn" style={{ height: "54px", boxSizing: "border-box", flexShrink: "0", borderRadius: "27px", border: "1px solid #D8C6A6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>
            <GoogleG />
            {" "}Sign up with Google
          </Link>
        </GoogleButton>
        <div className="rise d4" role="tablist" aria-label="Sign up with" style={{ position: "relative", height: "44px", flexShrink: "0", borderRadius: "22px", background: "#E7DAC4", padding: "4px", boxSizing: "border-box", display: "flex" }}>
          <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "36px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 2px 8px -2px rgba(35,28,23,0.2)", transform: `translateX(${v.segX})` }} />
          <button className="segtxt" role="tab" aria-selected={v.emailSel} onClick={v.pickEmail} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.emailColor, cursor: "pointer" }}>Email</button>
          <button className="segtxt" role="tab" aria-selected={v.phoneSel} onClick={v.pickPhone} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.phoneColor, cursor: "pointer" }}>Mobile number</button>
        </div>
        <label className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NAME</span>
          <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input placeholder="Your name" autoComplete="name" aria-label="Your name" maxLength={60} value={v.name} onChange={v.onName} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        {v.isEmail && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="email" placeholder="you@example.com" autoComplete="email" aria-label="Email" value={v.email} onChange={v.onEmail} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PASSWORD</span>
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="password" placeholder="At least 8 characters" autoComplete="new-password" aria-label="Password" value={v.pw} onChange={v.onPw} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ flex: "1", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "4px" }}>
                  {((v.segs ?? []) as any[]).map((s: any, sIndex: number) => (
                    <Fragment key={s?.key ?? sIndex}>
                      <span className="bar" style={{ height: "4px", borderRadius: "2px", background: s.bg }} />
                    </Fragment>
                  ))}
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: v.strengthColor, minWidth: "64px", textAlign: "right" }}>{v.strengthLabel}</span>
              </div>
            </div>
          </>
        )}
        {v.isPhone && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>MOBILE NUMBER</span>
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 5px" }}>
                  <span style={{ height: "38px", padding: "0 10px", borderRadius: "10px", background: "#EFE4D2", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>
                    IN +91{" "}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                  <input type="tel" inputMode="numeric" autoComplete="tel-national" aria-label="Mobile number" placeholder="98XXX XXXXX" value={v.phone} onChange={v.onPhone} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "16px", letterSpacing: "0.04em", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <div style={{ fontSize: "12.5px", lineHeight: "1.45", color: "var(--muted)" }}>
                No password needed. We'll text you a 6-digit code to confirm it's you.
              </div>
            </div>
          </>
        )}
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
        <Link className="rise d5 cta" to={v.ctaHref} onClick={v.submit} aria-disabled={v.ctaDisabled} style={{ height: "56px", flexShrink: "0", borderRadius: "28px", background: v.ctaBg, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{v.ctaLabel}</Link>
        <div className="rise d6" style={{ marginTop: "auto", textAlign: "center", fontSize: "13.5px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: "600", textDecoration: "none" }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
