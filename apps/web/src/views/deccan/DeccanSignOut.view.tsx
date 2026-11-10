// Generated from design-reference/deccan/DeccanSignOut.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanSignOut a{color:var(--primary)}
.scr-deccan-DeccanSignOut a:hover{color:var(--primary-strong)}
@keyframes dDeccanSignOut-fade{from{opacity:0}to{opacity:1}}
@keyframes dDeccanSignOut-up{from{transform:translateY(100%)}to{transform:none}}
.scr-deccan-DeccanSignOut .scrim{animation:dDeccanSignOut-fade .5s ease both}
.scr-deccan-DeccanSignOut .up{animation:dDeccanSignOut-up .6s cubic-bezier(.2,.8,.2,1) .1s both}
.scr-deccan-DeccanSignOut .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .3s}
.scr-deccan-DeccanSignOut .tap:active{transform:scale(.97)}
.scr-deccan-DeccanSignOut .danger:hover{background-color:#8E2014}
.scr-deccan-DeccanSignOut .ghost:hover{background-color:#EFE4D2}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanSignOut *,.scr-deccan-DeccanSignOut *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanSignOutView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanSignOut" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanSignOut" precedence="screens">{css}</style>
      {v.underlay /* dc-import DeccanSettings  */}
      <div className="scrim" style={{ position: "absolute", inset: "0", background: "rgba(35,28,23,0.5)" }} />
      <div className="up" role="dialog" aria-label="Sign out" style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "var(--surface)", borderRadius: "30px 30px 0 0", borderTop: "3px solid var(--gold)", padding: "12px 24px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D8C6A6", alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "6px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "16px", lineHeight: "1.25", color: "#A4462B" }}>बाहेर पडायचं?</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "400", lineHeight: "1" }}>Sign out?</h2>
          </div>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>Your plans and XP are saved to your account.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "14px", background: "#F5E6EE" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0", marginTop: "1px" }}>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div style={{ fontSize: "13px", lineHeight: "1.45", color: "#4A1530" }}>
            SOS still works without an account. Emergency contacts, medical info and offline packs stay on this phone.
          </div>
        </div>
        <Link to="/login" className="tap danger" onClick={v.signOut} style={{ height: "56px", borderRadius: "28px", background: "#A3281A", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Sign out</Link>
        <Link to="/settings" className="tap ghost" style={{ height: "52px", borderRadius: "26px", border: "1px solid #D8C6A6", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>Cancel</Link>
        <Link to="/settings/delete-account" style={{ alignSelf: "center", padding: "10px 12px", color: "var(--muted)", fontSize: "13px", textDecoration: "underline" }}>Delete my account</Link>
      </div>
    </div>
  );
}
