// Generated from design-reference/deccan/DeccanPermissions.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanPermissions a{color:var(--primary)}
.scr-deccan-DeccanPermissions a:hover{color:var(--primary-strong)}
@keyframes dDeccanPermissions-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanPermissions-pop{0%{transform:scale(.7)}60%{transform:scale(1.1)}100%{transform:none}}
.scr-deccan-DeccanPermissions .rise{animation:dDeccanPermissions-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanPermissions .d1{animation-delay:.05s}
.scr-deccan-DeccanPermissions .d2{animation-delay:.12s}
.scr-deccan-DeccanPermissions .d3{animation-delay:.2s}
.scr-deccan-DeccanPermissions .d4{animation-delay:.28s}
.scr-deccan-DeccanPermissions .d5{animation-delay:.36s}
.scr-deccan-DeccanPermissions .d6{animation-delay:.44s}
.scr-deccan-DeccanPermissions .card{transition:border-color .35s,background-color .35s}
.scr-deccan-DeccanPermissions .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanPermissions .tap:active{transform:scale(.96)}
.scr-deccan-DeccanPermissions .ok{animation:dDeccanPermissions-pop .4s cubic-bezier(.2,.7,.2,1)}
.scr-deccan-DeccanPermissions .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanPermissions .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanPermissions .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanPermissions *,.scr-deccan-DeccanPermissions *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanPermissionsView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanPermissions" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanPermissions" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "64px 24px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0", zIndex: "6", pointerEvents: "none" }}>
          <defs>
            <pattern id="zz" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zz)" />
        </svg>
        <div className="rise d1" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--muted)" }}>BEFORE YOU START</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#A4462B" }}>सुरक्षा चालू करा</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "44px", fontWeight: "400", lineHeight: "0.98" }}>
              Turn on{" "}
              <span style={{ fontStyle: "italic", color: "var(--primary)" }}>safety</span>
            </h1>
          </div>
          <p style={{ margin: "0", fontSize: "14.5px", lineHeight: "1.5", color: "#4A3D33" }}>
            Two permissions make SOS work instantly, even before you have an account. Your phone will ask you to confirm each.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {((v.perms ?? []) as any[]).map((p: any, pIndex: number) => (
            <Fragment key={p?.key ?? pIndex}>
              <div className={`card rise ${p.delay}`} style={{ borderRadius: "20px", border: `1.5px dashed ${p.bd}`, background: p.bg, padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "21px", background: "#F5E6EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  {p.isLoc && (
                    <>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </>
                  )}
                  {p.isMotion && (
                    <>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="7" y="3" width="10" height="18" rx="2" />
                        <path d="M3 8l1.5 1.5L3 11M21 8l-1.5 1.5L21 11" />
                      </svg>
                    </>
                  )}
                  {p.isNotify && (
                    <>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
                        <path d="M10 21h4" />
                      </svg>
                    </>
                  )}
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>{p.title}</div>
                  <div style={{ fontSize: "12.5px", lineHeight: "1.45", color: "var(--muted)" }}>{p.why}</div>
                </div>
                {p.pending && (
                  <>
                    <button className="tap" onClick={p.allow} style={{ height: "36px", padding: "0 14px", borderRadius: "18px", border: "none", background: "var(--ink)", color: "var(--bg)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: "0" }}>Allow</button>
                  </>
                )}
                {p.granted && (
                  <>
                    <span className="ok" role="img" aria-label="Allowed" style={{ width: "36px", height: "36px", borderRadius: "18px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    </span>
                  </>
                )}
              </div>
            </Fragment>
          ))}
        </div>
        <div className="rise d5" style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12.5px", lineHeight: "1.45", color: "var(--muted)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0", marginTop: "1px" }}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>
            Your location is only shared when you start an SOS or turn on trip sharing. You can change these any time in Profile.
          </span>
        </div>
        <div className="rise d6" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Link to="/signup" onClick={v.done} className="cta" style={{ width: "100%", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{v.ctaLabel}</Link>
          <div style={{ display: "flex", gap: "18px", fontSize: "13.5px" }}>
            <Link to="/signup" onClick={v.done} style={{ color: "var(--muted)", textDecoration: "none" }}>Not now</Link>
            <span style={{ color: "#CDBDA3" }}>·</span>
            <span style={{ color: "var(--muted)" }}>
              Have an account?{" "}
              <Link to="/login" onClick={v.done} style={{ fontWeight: "600", textDecoration: "none" }}>Log in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
