// Generated from design-reference/classic/EditProfile.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-EditProfile a{color:var(--primary)}
.scr-classic-EditProfile a:hover{color:var(--primary-strong)}
@keyframes cEditProfile-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.scr-classic-EditProfile .rise{animation:cEditProfile-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-EditProfile .d1{animation-delay:.05s}
.scr-classic-EditProfile .d2{animation-delay:.12s}
.scr-classic-EditProfile .d3{animation-delay:.19s}
.scr-classic-EditProfile .d4{animation-delay:.26s}
.scr-classic-EditProfile .d5{animation-delay:.33s}
.scr-classic-EditProfile .d6{animation-delay:.4s}
.scr-classic-EditProfile .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-EditProfile .tap:active{transform:scale(.96)}
.scr-classic-EditProfile .field{transition:border-color .3s,box-shadow .3s}
.scr-classic-EditProfile .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(15,76,66,.12)}
.scr-classic-EditProfile .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-EditProfile .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-EditProfile .cta:active{transform:scale(.97)}
@keyframes cEditProfile-fade{from{opacity:0}to{opacity:1}}
@keyframes cEditProfile-sheetup{from{transform:translateY(100%)}to{transform:none}}
.scr-classic-EditProfile .scrim{animation:cEditProfile-fade .35s ease both}
.scr-classic-EditProfile .sheetup{animation:cEditProfile-sheetup .45s cubic-bezier(.2,.8,.2,1) both}
.scr-classic-EditProfile .opt:hover{background-color:var(--bg)}
@media (prefers-reduced-motion:reduce){.scr-classic-EditProfile *,.scr-classic-EditProfile *::after{animation:none!important;transition:none!important}}
`;

export default function EditProfileView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-EditProfile" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-EditProfile" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "400" }}>Edit profile</h1>
          <div style={{ width: "44px" }} />
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", width: "96px", height: "96px", borderRadius: "48px", background: v.avatarBg, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: v.avatarSize, letterSpacing: v.avatarTrack }}>
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
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input defaultValue="Sourav Suman" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>EMAIL</span>
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <input defaultValue="sourav@example.com" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
            </span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>PHONE</span>
            <span className="field" style={{ height: "50px", borderRadius: "14px", border: "1px solid #DDE1DD", background: "var(--surface)", display: "flex", alignItems: "center", gap: "10px", padding: "0 16px" }}>
              <span style={{ fontSize: "15px", color: "var(--muted)" }}>+91</span>
              <input placeholder="98XXX XXXXX" style={{ border: "none", outline: "none", flex: "1", fontFamily: "var(--font-body)", fontSize: "15px", background: "transparent", color: "var(--ink)" }} />
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
        <Link to="/profile" className="rise d5 cta" style={{ marginTop: "auto", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Save changes</Link>
      </div>
      {v.photoOpen && (
        <>
          <button className="scrim" onClick={v.closePhoto} aria-label="Close" style={{ position: "absolute", inset: "0", border: "none", padding: "0", background: "rgba(17,22,20,0.5)", cursor: "pointer" }} />
          <div className="sheetup" role="dialog" aria-label="Profile photo" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D5DAD6", alignSelf: "center", marginBottom: "10px" }} />
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
