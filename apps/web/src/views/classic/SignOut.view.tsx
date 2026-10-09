// Generated from design-reference/classic/SignOut.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-SignOut a{color:var(--primary)}
.scr-classic-SignOut a:hover{color:var(--primary-strong)}
@keyframes cSignOut-fade{from{opacity:0}to{opacity:1}}
@keyframes cSignOut-up{from{transform:translateY(100%)}to{transform:none}}
.scr-classic-SignOut .scrim{animation:cSignOut-fade .5s ease both}
.scr-classic-SignOut .up{animation:cSignOut-up .6s cubic-bezier(.2,.8,.2,1) .1s both}
.scr-classic-SignOut .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s}
.scr-classic-SignOut .tap:active{transform:scale(.97)}
.scr-classic-SignOut .danger:hover{background-color:#8E2014}
.scr-classic-SignOut .ghost:hover{background-color:#F0F1EE}
@media (prefers-reduced-motion:reduce){.scr-classic-SignOut *,.scr-classic-SignOut *::after{animation:none!important;transition:none!important}}
`;

export default function SignOutView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-SignOut" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-SignOut" precedence="screens">{css}</style>
      {v.underlay /* dc-import Profile  */}
      <div className="scrim" style={{ position: "absolute", inset: "0", background: "rgba(17,22,20,0.5)" }} />
      <div className="up" role="dialog" aria-label="Sign out" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", padding: "12px 24px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D5DAD6", alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "6px" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "400", lineHeight: "1" }}>Sign out?</h2>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>Your plans and XP are saved to your account.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "14px", background: "#E8F0ED" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0", marginTop: "1px" }}>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div style={{ fontSize: "13px", lineHeight: "1.45", color: "#1E3D37" }}>
            SOS still works without an account. Emergency contacts, medical info and offline packs stay on this phone.
          </div>
        </div>
        <Link to="/login" className="tap danger" onClick={v.signOut} style={{ height: "56px", borderRadius: "28px", background: "#A3281A", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Sign out</Link>
        <Link to="/profile" className="tap ghost" style={{ height: "52px", borderRadius: "26px", border: "1px solid #D5DAD6", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Cancel</Link>
      </div>
    </div>
  );
}
