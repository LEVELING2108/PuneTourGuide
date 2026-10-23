// Generated from design-reference/classic/Login.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';
import { GoogleButton } from '../../components/GoogleButton';
import { GoogleG } from '../../components/GoogleG';

const css = `
.scr-classic-Login a{color:var(--primary)}
.scr-classic-Login a:hover{color:var(--primary-strong)}
@keyframes cLogin-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cLogin-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes cLogin-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cLogin-spin{to{transform:rotate(360deg)}}
.scr-classic-Login .rise{animation:cLogin-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Login .up{animation:cLogin-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-classic-Login .swap{animation:cLogin-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Login .d1{animation-delay:.05s}
.scr-classic-Login .d2{animation-delay:.12s}
.scr-classic-Login .d3{animation-delay:.25s}
.scr-classic-Login .d4{animation-delay:.32s}
.scr-classic-Login .d5{animation-delay:.39s}
.scr-classic-Login .d6{animation-delay:.46s}
.scr-classic-Login .rings{animation:cLogin-spin 90s linear infinite;transform-origin:50% 50%}
.scr-classic-Login .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Login .tap:active{transform:scale(.97)}
.scr-classic-Login .gbtn:hover{border-color:var(--ink);box-shadow:0 12px 24px -16px rgba(17,22,20,.45)}
.scr-classic-Login .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-Login .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-Login .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Login .segtxt{transition:color .35s}
.scr-classic-Login .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Login .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Login .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Login *,.scr-classic-Login *::after{animation:none!important;transition:none!important}}
`;

export default function LoginView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Login" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Login" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <svg className="rings" width="440" height="440" viewBox="0 0 440 440" aria-hidden="true" style={{ position: "absolute", right: "-170px", top: "-150px", opacity: "0.16" }}>
          <circle cx="220" cy="220" r="80" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="130" fill="none" stroke="var(--bg)" strokeDasharray="2 6" />
          <circle cx="220" cy="220" r="180" fill="none" stroke="var(--bg)" />
          <circle cx="220" cy="220" r="215" fill="none" stroke="var(--bg)" strokeDasharray="1 9" />
        </svg>
        <div style={{ position: "absolute", top: "calc(var(--sb) + 16px)", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "26px", color: "var(--bg)" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M15.5 8.5l-2 5-5 2 2-5z" />
            </svg>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}>Pune Explorer</span>
          </div>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: "400", lineHeight: "0.95" }}>
              Welcome
              <br />
              <span style={{ fontStyle: "italic", color: "#A9CFC6" }}>back</span>
            </h1>
            <div style={{ fontSize: "14px", color: "#CFE3DE" }}>Log in to sync your plans, saves and XP.</div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "calc(var(--sb) + 208px)", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "26px 24px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "14px" }}>
        <GoogleButton context="signin" className="rise d3" onToken={v.googleToken} onUnavailable={v.googleUnavailable}>
          <Link to="/" className="tap gbtn" style={{ height: "54px", boxSizing: "border-box", borderRadius: "27px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>
            <GoogleG />
            {" "}Continue with Google
          </Link>
        </GoogleButton>
        <div className="rise d3" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--muted)" }}>
          <span style={{ flex: "1", height: "1px", background: "#DDE1DD" }} />
          or
          <span style={{ flex: "1", height: "1px", background: "#DDE1DD" }} />
        </div>
        {v.phoneLogin && (
          <div className="rise d4" role="tablist" aria-label="Log in with" style={{ position: "relative", height: "44px", borderRadius: "22px", background: "#E9EBE7", padding: "4px", boxSizing: "border-box", display: "flex" }}>
            <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "36px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 2px 8px -2px rgba(17,22,20,0.2)", transform: `translateX(${v.segX})` }} />
            <button className="segtxt" role="tab" aria-selected={v.emailSel} onClick={v.pickEmail} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.emailColor, cursor: "pointer" }}>Email</button>
            <button className="segtxt" role="tab" aria-selected={v.phoneSel} onClick={v.pickPhone} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.phoneColor, cursor: "pointer" }}>Mobile number</button>
          </div>
        )}
        {v.isEmail && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="email" placeholder="you@example.com" autoComplete="email" value={v.email} onChange={v.onEmail} onKeyDown={v.onEnter} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PASSWORD</span>
                  <Link to="/forgot" style={{ fontSize: "12.5px", fontWeight: "600", textDecoration: "none" }}>Forgot?</Link>
                </span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "8px", padding: "0 6px 0 16px" }}>
                  <input type={v.pwType} placeholder="Your password" autoComplete="current-password" value={v.password} onChange={v.onPassword} onKeyDown={v.onEnter} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                  <button className="tap" onClick={v.toggleShow} aria-label={v.showLabel} style={{ width: "40px", height: "40px", borderRadius: "20px", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    {v.hidden && (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </>
                    )}
                    {v.shown && (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
                          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                        </svg>
                      </>
                    )}
                  </button>
                </span>
              </label>
              <Link to="/" className="cta" onClick={v.submitEmail} aria-disabled={v.busy} style={{ height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", marginTop: "4px" }}>{v.loginLabel}</Link>
              {v.error && <div role="alert" style={{ fontSize: "13px", lineHeight: "1.4", color: "#A3281A" }}>{v.error}</div>}
            </div>
          </>
        )}
        {v.isPhone && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>MOBILE NUMBER</span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 6px" }}>
                  <span style={{ height: "38px", padding: "0 10px", borderRadius: "10px", background: "#F0F1EE", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>
                    IN +91{" "}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                  <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98XXX XXXXX" value={v.phone} onChange={v.onPhone} onKeyDown={v.onEnter} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "16px", letterSpacing: "0.04em", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <div style={{ fontSize: "12.5px", lineHeight: "1.45", color: "var(--muted)" }}>
                We'll text a 6-digit code to this number. New here? The same code creates your account.
              </div>
              <Link to="/otp" className="cta" onClick={v.sendCode} aria-disabled={v.busy} style={{ height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", marginTop: "4px" }}>{v.sendLabel}</Link>
              {v.error && <div role="alert" style={{ fontSize: "13px", lineHeight: "1.4", color: "#A3281A" }}>{v.error}</div>}
            </div>
          </>
        )}
        <div className="rise d6" style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", fontSize: "13.5px", color: "var(--muted)" }}>
          <div>
            New to Pune Explorer?{" "}
            <Link to="/signup" style={{ fontWeight: "600", textDecoration: "none" }}>Create account</Link>
          </div>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--muted)", textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            </svg>
            {" "}Skip for now · SOS works without an account
          </Link>
        </div>
      </div>
    </div>
  );
}
