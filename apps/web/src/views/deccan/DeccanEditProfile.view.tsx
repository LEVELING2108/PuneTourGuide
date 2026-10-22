// Generated from design-reference/deccan/DeccanEditProfile.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanEditProfile a{color:var(--primary)}
.scr-deccan-DeccanEditProfile a:hover{color:var(--primary-strong)}
@keyframes dDeccanEditProfile-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-deccan-DeccanEditProfile .rise{animation:dDeccanEditProfile-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanEditProfile .d1{animation-delay:.05s}
.scr-deccan-DeccanEditProfile .d2{animation-delay:.12s}
.scr-deccan-DeccanEditProfile .d3{animation-delay:.19s}
.scr-deccan-DeccanEditProfile .d4{animation-delay:.26s}
.scr-deccan-DeccanEditProfile .d5{animation-delay:.33s}
.scr-deccan-DeccanEditProfile .d6{animation-delay:.4s}
.scr-deccan-DeccanEditProfile .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanEditProfile .tap:active{transform:scale(.96)}
.scr-deccan-DeccanEditProfile .field{transition:border-color .3s,box-shadow .3s}
.scr-deccan-DeccanEditProfile .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(122,31,78,.12)}
.scr-deccan-DeccanEditProfile .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanEditProfile .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(122,31,78,.7)}
.scr-deccan-DeccanEditProfile .cta:active{transform:scale(.97)}
@keyframes dDeccanEditProfile-fade{from{opacity:0}to{opacity:1}}
@keyframes dDeccanEditProfile-sheetup{from{transform:translateY(100%)}to{transform:none}}
.scr-deccan-DeccanEditProfile .scrim{animation:dDeccanEditProfile-fade .35s ease both}
.scr-deccan-DeccanEditProfile .sheetup{animation:dDeccanEditProfile-sheetup .45s cubic-bezier(.2,.8,.2,1) both}
.scr-deccan-DeccanEditProfile .opt:hover{background-color:var(--bg)}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanEditProfile *,.scr-deccan-DeccanEditProfile *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanEditProfileView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanEditProfile" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanEditProfile" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "calc(var(--sb) + 12px) 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <svg width="390" height="10" viewBox="0 0 390 10" aria-hidden="true" style={{ position: "absolute", top: "0", left: "0", zIndex: "6", pointerEvents: "none" }}>
          <defs>
            <pattern id="zz" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="var(--gold)" />
              <path d="M0 10 L5 2 L10 10 Z" fill="var(--primary-strong)" />
            </pattern>
          </defs>
          <rect width="390" height="10" fill="url(#zz)" />
        </svg>
        <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/settings" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#A4462B" }}>प्रोफाइल</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>Edit profile</h1>
          </div>
          <div style={{ width: "44px" }} />
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", width: "96px", height: "96px", borderRadius: "48px", background: v.avatarBg, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: v.avatarSize, letterSpacing: v.avatarTrack }}>
            {v.avatarUrl && <img src={v.avatarUrl} alt="Your profile photo" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />}
            {v.avatarText}{" "}
            <button className="tap" onClick={v.openPhoto} aria-label="Change photo" style={{ position: "absolute", right: "-2px", bottom: "-2px", width: "36px", height: "36px", borderRadius: "18px", border: "3px solid var(--bg)", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>FULL NAME</span>
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input value={v.name} onChange={v.onName} autoComplete="name" maxLength={60} aria-label="Full name" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input type="email" value={v.email} onChange={v.onEmail} autoComplete="email" maxLength={254} aria-label="Email" placeholder="you@example.com" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PHONE</span>
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DCCDB6", background: "var(--surface)", display: "flex", alignItems: "center", gap: "10px", padding: "0 16px" }}>
              <span style={{ fontSize: "15px", color: "var(--muted)" }}>+91</span>
              <input value={v.phone} readOnly aria-label="Phone (verified by SMS)" placeholder="Add with mobile sign-in" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>I LIKE · SHAPES YOUR SUGGESTIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {((v.tastes ?? []) as any[]).map((t: any, tIndex: number) => (
              <Fragment key={t?.key ?? tIndex}>
                <button className="tap" onClick={t.pick} aria-pressed={t.pressed} style={{ height: "38px", padding: "0 16px", borderRadius: "19px", border: `1px solid ${t.bd}`, background: t.bg, color: t.fg, fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}>{t.label}</button>
              </Fragment>
            ))}
          </div>
        </div>
        {v.status && (
          <div role="status" style={{ fontSize: "13px", color: v.statusColor }}>{v.status}</div>
        )}
        <button className="rise d5 cta" onClick={v.save} disabled={v.saving} style={{ marginTop: "auto", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" , border: "none", fontFamily: "var(--font-body)", cursor: "pointer" }}>{v.saveLabel}</button>
        {v.fileInputs}
      </div>
      {v.photoOpen && (
        <>
          <button className="scrim" onClick={v.closePhoto} aria-label="Close" style={{ position: "absolute", inset: "0", border: "none", padding: "0", background: "rgba(35,28,23,0.5)", cursor: "pointer" }} />
          <div className="sheetup" role="dialog" aria-label="Profile photo" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", borderTop: "3px solid var(--gold)", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D8C6A6", alignSelf: "center", marginBottom: "10px" }} />
            <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>Profile photo</h2>
            <button className="tap opt" onClick={v.takePhoto} style={{ display: "flex", alignItems: "center", gap: "14px", height: "54px", padding: "0 8px", border: "none", borderRadius: "14px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textAlign: "left", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              Take a photo
            </button>
            <button className="tap opt" onClick={v.pickGallery} style={{ display: "flex", alignItems: "center", gap: "14px", height: "54px", padding: "0 8px", border: "none", borderRadius: "14px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textAlign: "left", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M21 16l-5-5-9 9" />
              </svg>
              Choose from gallery
            </button>
            <button className="tap opt" onClick={v.removePhoto} style={{ display: "flex", alignItems: "center", gap: "14px", height: "54px", padding: "0 8px", border: "none", borderRadius: "14px", background: "transparent", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "#A3281A", textAlign: "left", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
              Remove photo
            </button>
            <div style={{ fontSize: "12px", color: "var(--muted)", padding: "6px 8px 0" }}>Your phone's camera or gallery opens next.</div>
          </div>
        </>
      )}
    </div>
  );
}
