// Generated from design-reference/deccan/DeccanForgotPassword.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanForgotPassword a{color:var(--primary)}
.scr-deccan-DeccanForgotPassword a:hover{color:var(--primary-strong)}
@keyframes dDeccanForgotPassword-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanForgotPassword-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes dDeccanForgotPassword-spin{to{transform:rotate(360deg)}}
@keyframes dDeccanForgotPassword-swap{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dDeccanForgotPassword-popin{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:none}}
.scr-deccan-DeccanForgotPassword .rise{animation:dDeccanForgotPassword-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanForgotPassword .up{animation:dDeccanForgotPassword-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-deccan-DeccanForgotPassword .swap{animation:dDeccanForgotPassword-swap .45s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanForgotPassword .pop{animation:dDeccanForgotPassword-popin .55s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanForgotPassword .d1{animation-delay:.05s}
.scr-deccan-DeccanForgotPassword .d2{animation-delay:.12s}
.scr-deccan-DeccanForgotPassword .d3{animation-delay:.25s}
.scr-deccan-DeccanForgotPassword .d4{animation-delay:.32s}
.scr-deccan-DeccanForgotPassword .rings{animation:dDeccanForgotPassword-spin 90s linear infinite;transform-origin:50% 50%}
.scr-deccan-DeccanForgotPassword .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s}
.scr-deccan-DeccanForgotPassword .tap:active{transform:scale(.97)}
.scr-deccan-DeccanForgotPassword .field{transition:border-color .3s,box-shadow .3s}
.scr-deccan-DeccanForgotPassword .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(122,31,78,.12)}
.scr-deccan-DeccanForgotPassword .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanForgotPassword .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanForgotPassword .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanForgotPassword *,.scr-deccan-DeccanForgotPassword *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanForgotPasswordView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanForgotPassword" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanForgotPassword" precedence="screens">{css}</style>
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
        <div aria-hidden="true" style={{ position: "absolute", right: "54px", top: "calc(var(--sb) + 74px)", width: "58px", height: "58px", borderRadius: "29px", background: "#E2B95B", opacity: "0.85" }} />
        <svg width="390" height="80" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", top: "calc(var(--sb) + 152px)", opacity: "0.9" }}>
          <path d="M0 74 Q60 34 120 58 T240 44 T390 54 V96 H0 Z" fill="#6A1A44" />
          <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H118 V52 H126 V58 H134 V52 H142 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#4E0F30" />
        </svg>
        <div style={{ position: "absolute", top: "calc(var(--sb) + 12px)", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "24px", color: "var(--bg)" }}>
          <Link to="/login" className="rise d1 tap" aria-label="Back to log in" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid rgba(255,251,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#E2B95B" }}>पासवर्ड विसरलात?</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "46px", fontWeight: "400", lineHeight: "0.95" }}>
                Reset your
                <br />
                <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>password</span>
              </h1>
            </div>
            <div style={{ fontSize: "14px", color: "#F2D5E3" }}>It happens. We'll email you a link to set a new one.</div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "calc(var(--sb) + 224px)", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "30px 24px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "18px" }}>
        {v.notSent && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="email" placeholder="you@example.com" autoComplete="email" aria-label="Email" value={v.email} onChange={v.onEmail} onKeyDown={v.onEnter} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              {v.error && <div role="alert" style={{ fontSize: "13px", color: "#A3281A", lineHeight: "1.4" }}>{v.error}</div>}
              <button className="cta" onClick={v.send} disabled={v.busy} style={{ height: "56px", borderRadius: "28px", border: "none", background: "var(--primary)", color: "var(--bg)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Send reset link</button>
              <div style={{ fontSize: "13px", lineHeight: "1.45", color: "var(--muted)", textAlign: "center" }}>
                Signed up with your mobile?{" "}
                <Link to="/login" style={{ fontWeight: "600", textDecoration: "none" }}>Log in with a code instead</Link>
              </div>
            </div>
          </>
        )}
        {v.sent && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "center", textAlign: "center", paddingTop: "8px" }}>
              <div className="pop" style={{ width: "64px", height: "64px", borderRadius: "32px", background: "#F5E6EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "28px" }}>Check your inbox</div>
                <div style={{ fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
                  If there's an account for that email, a reset link is on its way. It works for 30 minutes.
                </div>
              </div>
              <a className="cta" href="mailto:" style={{ width: "100%", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Open email app</a>
              <div style={{ display: "flex", gap: "18px", fontSize: "13.5px" }}>
                {v.devLink && <a href={v.devLink} style={{ fontSize: "12.5px" }}>Development: open the reset link</a>}
              <button className="tap" onClick={v.again} style={{ border: "none", background: "transparent", padding: "0", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}>Send again</button>
                <Link to="/login" style={{ fontWeight: "600", textDecoration: "none" }}>Back to log in</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
