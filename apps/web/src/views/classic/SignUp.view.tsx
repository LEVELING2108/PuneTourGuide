// Generated from design-reference/classic/SignUp.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';
import { GoogleButton } from '../../components/GoogleButton';
import { GoogleG } from '../../components/GoogleG';

const css = `
.scr-classic-SignUp a{color:var(--primary)}
.scr-classic-SignUp a:hover{color:var(--primary-strong)}
@keyframes cSignUp-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cSignUp-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes cSignUp-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cSignUp-spin{to{transform:rotate(360deg)}}
.scr-classic-SignUp .rise{animation:cSignUp-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-SignUp .up{animation:cSignUp-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-classic-SignUp .swap{animation:cSignUp-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-SignUp .d1{animation-delay:.05s}
.scr-classic-SignUp .d2{animation-delay:.12s}
.scr-classic-SignUp .d3{animation-delay:.25s}
.scr-classic-SignUp .d4{animation-delay:.32s}
.scr-classic-SignUp .d5{animation-delay:.39s}
.scr-classic-SignUp .d6{animation-delay:.46s}
.scr-classic-SignUp .rings{animation:cSignUp-spin 90s linear infinite;transform-origin:50% 50%}
.scr-classic-SignUp .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-SignUp .tap:active{transform:scale(.97)}
.scr-classic-SignUp .gbtn:hover{border-color:var(--ink);box-shadow:0 12px 24px -16px rgba(17,22,20,.45)}
.scr-classic-SignUp .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-SignUp .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-SignUp .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-classic-SignUp .segtxt{transition:color .35s}
.scr-classic-SignUp .bar{transition:background-color .35s}
.scr-classic-SignUp .box{transition:background-color .25s,border-color .25s}
.scr-classic-SignUp .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s,background-color .35s}
.scr-classic-SignUp .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-SignUp .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-SignUp *,.scr-classic-SignUp *::after{animation:none!important;transition:none!important}}
`;

export default function SignUpView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-SignUp" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-SignUp" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg className="rings" width="440" height="440" viewBox="0 0 440 440" aria-hidden="true" style={{ position: "absolute", right: "-170px", top: "-160px", opacity: "0.16" }}>
          <circle cx="220" cy="220" r="80" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="130" fill="none" stroke="var(--bg)" strokeDasharray="2 6" />
          <circle cx="220" cy="220" r="180" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="215" fill="none" stroke="var(--bg)" strokeDasharray="1 9" />
        </svg>
        <div style={{ position: "absolute", top: "calc(var(--sb) + 12px)", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "20px", color: "var(--bg)" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/login" className="tap" aria-label="Back to log in" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid rgba(246,246,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </Link>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "19px" }}>Pune Explorer</span>
            <span style={{ width: "40px" }} />
          </div>
          <h1 className="rise d2" style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: "400", lineHeight: "0.95" }}>
            Create your{" "}
            <span style={{ fontStyle: "italic", color: "#A9CFC6" }}>account</span>
          </h1>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "calc(var(--sb) + 162px)", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "24px 24px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "13px" }}>
        <GoogleButton context="signup" className="rise d3" onToken={v.googleToken} onUnavailable={v.googleUnavailable}>
          <Link to="/first-contact" className="tap gbtn" style={{ height: "54px", boxSizing: "border-box", flexShrink: "0", borderRadius: "27px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>
            <GoogleG />
            {" "}Sign up with Google
          </Link>
        </GoogleButton>
        <div className="rise d4" role="tablist" aria-label="Sign up with" style={{ position: "relative", height: "44px", flexShrink: "0", borderRadius: "22px", background: "#E9EBE7", padding: "4px", boxSizing: "border-box", display: "flex" }}>
          <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "36px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 2px 8px -2px rgba(17,22,20,0.2)", transform: `translateX(${v.segX})` }} />
          <button className="segtxt" role="tab" aria-selected={v.emailSel} onClick={v.pickEmail} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.emailColor, cursor: "pointer" }}>Email</button>
          <button className="segtxt" role="tab" aria-selected={v.phoneSel} onClick={v.pickPhone} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.phoneColor, cursor: "pointer" }}>Mobile number</button>
        </div>
        <label className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>NAME</span>
          <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <input placeholder="Your name" autoComplete="name" aria-label="Your name" maxLength={60} value={v.name} onChange={v.onName} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
          </span>
        </label>
        {v.isEmail && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="email" placeholder="you@example.com" autoComplete="email" aria-label="Email" value={v.email} onChange={v.onEmail} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PASSWORD</span>
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
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
                <span className="field" style={{ height: "48px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 5px" }}>
                  <span style={{ height: "38px", padding: "0 10px", borderRadius: "10px", background: "#F0F1EE", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>
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
