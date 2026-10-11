// Generated from design-reference/deccan/DeccanLogin.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';
import { GoogleG } from '../../components/GoogleG';

const css = `
.scr-deccan-DeccanLogin a{color:var(--primary)}
.scr-deccan-DeccanLogin a:hover{color:var(--primary-strong)}
@keyframes dDeccanLogin-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanLogin-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes dDeccanLogin-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes dDeccanLogin-spin{to{transform:rotate(360deg)}}
.scr-deccan-DeccanLogin .rise{animation:dDeccanLogin-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanLogin .up{animation:dDeccanLogin-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-deccan-DeccanLogin .swap{animation:dDeccanLogin-swap .4s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanLogin .d1{animation-delay:.05s}
.scr-deccan-DeccanLogin .d2{animation-delay:.12s}
.scr-deccan-DeccanLogin .d3{animation-delay:.25s}
.scr-deccan-DeccanLogin .d4{animation-delay:.32s}
.scr-deccan-DeccanLogin .d5{animation-delay:.39s}
.scr-deccan-DeccanLogin .d6{animation-delay:.46s}
.scr-deccan-DeccanLogin .rings{animation:dDeccanLogin-spin 90s linear infinite;transform-origin:50% 50%}
.scr-deccan-DeccanLogin .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanLogin .tap:active{transform:scale(.97)}
.scr-deccan-DeccanLogin .gbtn:hover{border-color:var(--ink);box-shadow:0 12px 24px -16px rgba(35,28,23,.45)}
.scr-deccan-DeccanLogin .field{transition:border-color .3s,box-shadow .3s}
.scr-deccan-DeccanLogin .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(122,31,78,.12)}
.scr-deccan-DeccanLogin .seg{transition:transform .45s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanLogin .segtxt{transition:color .35s}
.scr-deccan-DeccanLogin .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanLogin .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanLogin .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanLogin *,.scr-deccan-DeccanLogin *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanLoginView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanLogin" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanLogin" precedence="screens">{css}</style>
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
        <div aria-hidden="true" style={{ position: "absolute", right: "54px", top: "102px", width: "58px", height: "58px", borderRadius: "29px", background: "#E2B95B", opacity: "0.85" }} />
        <svg width="390" height="80" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", top: "180px", opacity: "0.9" }}>
          <path d="M0 74 Q60 34 120 58 T240 44 T390 54 V96 H0 Z" fill="#6A1A44" />
          <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H118 V52 H126 V58 H134 V52 H142 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#4E0F30" />
        </svg>
        <div style={{ position: "absolute", top: "60px", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "26px", color: "var(--bg)" }}>
          <div className="rise d1" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M15.5 8.5l-2 5-5 2 2-5z" />
            </svg>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}>Pune Explorer</span>
          </div>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#E2B95B" }}>पुन्हा स्वागत</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: "400", lineHeight: "0.95" }}>
                Welcome
                <br />
                <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>back</span>
              </h1>
            </div>
            <div style={{ fontSize: "14px", color: "#F2D5E3" }}>Log in to sync your plans, saves and XP.</div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "252px", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "26px 24px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "14px" }}>
        <Link to="/" className="rise d3 tap gbtn" onClick={v.google} style={{ height: "54px", boxSizing: "border-box", borderRadius: "27px", border: "1px solid #D8C6A6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>
          <GoogleG />
          {" "}Continue with Google
        </Link>
        <div className="rise d3" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--muted)" }}>
          <span style={{ flex: "1", height: "1px", background: "#DCCDB6" }} />
          or
          <span style={{ flex: "1", height: "1px", background: "#DCCDB6" }} />
        </div>
        <div className="rise d4" role="tablist" aria-label="Log in with" style={{ position: "relative", height: "44px", borderRadius: "22px", background: "#E7DAC4", padding: "4px", boxSizing: "border-box", display: "flex" }}>
          <div className="seg" style={{ position: "absolute", top: "4px", left: "4px", width: "calc(50% - 4px)", height: "36px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 2px 8px -2px rgba(35,28,23,0.2)", transform: `translateX(${v.segX})` }} />
          <button className="segtxt" role="tab" aria-selected={v.emailSel} onClick={v.pickEmail} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.emailColor, cursor: "pointer" }}>Email</button>
          <button className="segtxt" role="tab" aria-selected={v.phoneSel} onClick={v.pickPhone} style={{ position: "relative", flex: "1", border: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: v.phoneColor, cursor: "pointer" }}>Mobile number</button>
        </div>
        {v.isEmail && (
          <>
            <div className="swap" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <input type="email" placeholder="you@example.com" autoComplete="email" value={v.email} onChange={v.onEmail} onKeyDown={v.onEnter} style={{ border: "none", outline: "none", flex: "1", minWidth: "0", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
                </span>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PASSWORD</span>
                  <Link to="/forgot" style={{ fontSize: "12.5px", fontWeight: "600", textDecoration: "none" }}>Forgot?</Link>
                </span>
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", gap: "8px", padding: "0 6px 0 16px" }}>
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
                <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 0 6px" }}>
                  <span style={{ height: "38px", padding: "0 10px", borderRadius: "10px", background: "#EFE4D2", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>
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
