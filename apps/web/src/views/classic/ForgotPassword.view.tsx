// Generated from design-reference/classic/ForgotPassword.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-ForgotPassword a{color:var(--primary)}
.scr-classic-ForgotPassword a:hover{color:var(--primary-strong)}
@keyframes cForgotPassword-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cForgotPassword-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes cForgotPassword-spin{to{transform:rotate(360deg)}}
@keyframes cForgotPassword-swap{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes cForgotPassword-popin{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:none}}
.scr-classic-ForgotPassword .rise{animation:cForgotPassword-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-ForgotPassword .up{animation:cForgotPassword-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-classic-ForgotPassword .swap{animation:cForgotPassword-swap .45s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-ForgotPassword .pop{animation:cForgotPassword-popin .55s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-ForgotPassword .d1{animation-delay:.05s}
.scr-classic-ForgotPassword .d2{animation-delay:.12s}
.scr-classic-ForgotPassword .d3{animation-delay:.25s}
.scr-classic-ForgotPassword .d4{animation-delay:.32s}
.scr-classic-ForgotPassword .rings{animation:cForgotPassword-spin 90s linear infinite;transform-origin:50% 50%}
.scr-classic-ForgotPassword .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s}
.scr-classic-ForgotPassword .tap:active{transform:scale(.97)}
.scr-classic-ForgotPassword .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-ForgotPassword .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-ForgotPassword .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-ForgotPassword .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-ForgotPassword .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-ForgotPassword *,.scr-classic-ForgotPassword *::after{animation:none!important;transition:none!important}}
`;

export default function ForgotPasswordView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-ForgotPassword" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-ForgotPassword" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg className="rings" width="440" height="440" viewBox="0 0 440 440" aria-hidden="true" style={{ position: "absolute", right: "-170px", top: "-150px", opacity: "0.16" }}>
          <circle cx="220" cy="220" r="80" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="130" fill="none" stroke="var(--bg)" strokeDasharray="2 6" />
          <circle cx="220" cy="220" r="180" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="215" fill="none" stroke="var(--bg)" strokeDasharray="1 9" />
        </svg>
        <div style={{ position: "absolute", top: "calc(var(--sb) + 12px)", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "24px", color: "var(--bg)" }}>
          <Link to="/login" className="rise d1 tap" aria-label="Back to log in" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid rgba(246,246,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "46px", fontWeight: "400", lineHeight: "0.95" }}>
              Reset your
              <br />
              <span style={{ fontStyle: "italic", color: "#A9CFC6" }}>password</span>
            </h1>
            <div style={{ fontSize: "14px", color: "#CFE3DE" }}>It happens. We'll email you a link to set a new one.</div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "calc(var(--sb) + 224px)", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "30px 24px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "18px" }}>
        {v.notSent && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
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
              <div className="pop" style={{ width: "64px", height: "64px", borderRadius: "32px", background: "#E8F0ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
