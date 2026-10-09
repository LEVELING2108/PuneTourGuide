// Generated from design-reference/deccan/DeccanOtp.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanOtp a{color:var(--primary)}
.scr-deccan-DeccanOtp a:hover{color:var(--primary-strong)}
@keyframes dDeccanOtp-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanOtp-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes dDeccanOtp-spin{to{transform:rotate(360deg)}}
@keyframes dDeccanOtp-blink{50%{opacity:0}}
@keyframes dDeccanOtp-pop{0%{transform:scale(.9)}60%{transform:scale(1.06)}100%{transform:none}}
.scr-deccan-DeccanOtp .rise{animation:dDeccanOtp-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanOtp .up{animation:dDeccanOtp-up .8s cubic-bezier(.2,.7,.2,1) .1s both}
.scr-deccan-DeccanOtp .d1{animation-delay:.05s}
.scr-deccan-DeccanOtp .d2{animation-delay:.12s}
.scr-deccan-DeccanOtp .d3{animation-delay:.25s}
.scr-deccan-DeccanOtp .d4{animation-delay:.32s}
.scr-deccan-DeccanOtp .d5{animation-delay:.39s}
.scr-deccan-DeccanOtp .d6{animation-delay:.46s}
.scr-deccan-DeccanOtp .rings{animation:dDeccanOtp-spin 90s linear infinite;transform-origin:50% 50%}
.scr-deccan-DeccanOtp .cell{transition:border-color .25s,box-shadow .25s,background-color .25s}
.scr-deccan-DeccanOtp .caret{animation:dDeccanOtp-blink 1s step-end infinite}
.scr-deccan-DeccanOtp .digit{animation:dDeccanOtp-pop .3s cubic-bezier(.2,.7,.2,1)}
.scr-deccan-DeccanOtp .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s}
.scr-deccan-DeccanOtp .tap:active{transform:scale(.97)}
.scr-deccan-DeccanOtp .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s,background-color .35s}
.scr-deccan-DeccanOtp .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanOtp .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanOtp *,.scr-deccan-DeccanOtp *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanOtpView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanOtp" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--primary)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanOtp" precedence="screens">{css}</style>
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
        <div aria-hidden="true" style={{ position: "absolute", right: "54px", top: "118px", width: "58px", height: "58px", borderRadius: "29px", background: "#E2B95B", opacity: "0.85" }} />
        <svg width="390" height="80" viewBox="0 0 390 96" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "0", top: "196px", opacity: "0.9" }}>
          <path d="M0 74 Q60 34 120 58 T240 44 T390 54 V96 H0 Z" fill="#6A1A44" />
          <path d="M0 96 V66 H30 V54 a14 14 0 0 1 28 0 V66 H110 V58 H118 V52 H126 V58 H134 V52 H142 V58 H150 V66 H170 V44 a22 22 0 0 1 44 0 V66 H260 V56 a12 12 0 0 1 24 0 V66 H330 V50 a16 16 0 0 1 32 0 V66 H390 V96 Z" fill="#4E0F30" />
        </svg>
        <div style={{ position: "absolute", top: "56px", left: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "24px", color: "var(--bg)" }}>
          <Link to="/login" className="rise d1 tap" aria-label="Back" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid rgba(255,251,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#E2B95B" }}>संदेश तपासा</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "46px", fontWeight: "400", lineHeight: "0.95" }}>
                Check your
                <br />
                <span style={{ fontStyle: "italic", color: "#F2C9DC" }}>messages</span>
              </h1>
            </div>
            <div style={{ fontSize: "14px", color: "#F2D5E3" }}>
              We sent a 6-digit code to{" "}
              <b style={{ color: "var(--bg)", fontWeight: "600" }}>+91 98••• ••210</b>
            </div>
          </div>
        </div>
      </div>
      <div className="up" style={{ position: "absolute", left: "0", right: "0", top: "268px", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "30px 24px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "22px" }}>
        <label className="rise d3" style={{ position: "relative", display: "block" }}>
          <span style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)", marginBottom: "10px" }}>ENTER CODE</span>
          <span style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}>
            {((v.cells ?? []) as any[]).map((c: any, cIndex: number) => (
              <Fragment key={c?.key ?? cIndex}>
                <span className="cell" style={{ height: "60px", borderRadius: "16px", border: `1.5px solid ${c.bd}`, background: "var(--surface)", boxShadow: c.shadow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "30px", color: "var(--ink)" }}>
                  {c.filled && (
                    <>
                      <span className="digit">{c.d}</span>
                    </>
                  )}
                  {c.caret && (
                    <>
                      <span className="caret" style={{ width: "1.5px", height: "26px", background: "var(--primary)" }} />
                    </>
                  )}
                </span>
              </Fragment>
            ))}
            <input aria-label="6-digit code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} onInput={v.onCode} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", border: "none", fontSize: "16px", color: "transparent", background: "transparent", caretColor: "transparent", cursor: "text" }} />
          </span>
        </label>
        <div className="rise d4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
          <span style={{ color: "var(--muted)" }}>Didn't get it?</span>
          {v.waiting && (
            <>
              <span style={{ color: "var(--muted)" }}>
                Resend in{" "}
                <b style={{ color: "var(--ink)", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>0:{v.secs}</b>
              </span>
            </>
          )}
          {v.canResend && (
            <>
              <span style={{ display: "flex", gap: "16px" }}>
                <button className="tap" onClick={v.resend} style={{ border: "none", background: "transparent", padding: "0", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}>Resend SMS</button>
                <button className="tap" onClick={v.resend} style={{ border: "none", background: "transparent", padding: "0", fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}>Call me</button>
              </span>
            </>
          )}
        </div>
        <Link to="/almost-there" className="rise d5 cta" aria-disabled={v.ctaDisabled} style={{ height: "56px", borderRadius: "28px", background: v.ctaBg, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Verify</Link>
        <div className="rise d6" style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--muted)", textAlign: "center" }}>
          <div>
            Wrong number?{" "}
            <Link to="/login" style={{ fontWeight: "600", textDecoration: "none" }}>Change it</Link>
          </div>
          <div style={{ fontSize: "12px" }}>The code fills in automatically on most phones.</div>
        </div>
      </div>
    </div>
  );
}
