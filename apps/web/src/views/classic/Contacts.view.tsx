// Generated from design-reference/classic/Contacts.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Contacts a{color:var(--primary)}
.scr-classic-Contacts a:hover{color:var(--primary-strong)}
@keyframes cContacts-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cContacts-toast{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
.scr-classic-Contacts .rise{animation:cContacts-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Contacts .d1{animation-delay:.05s}
.scr-classic-Contacts .d2{animation-delay:.12s}
.scr-classic-Contacts .d3{animation-delay:.19s}
.scr-classic-Contacts .d4{animation-delay:.26s}
.scr-classic-Contacts .d5{animation-delay:.33s}
.scr-classic-Contacts .d6{animation-delay:.4s}
.scr-classic-Contacts .toast{animation:cContacts-toast 2.8s ease both}
.scr-classic-Contacts .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-classic-Contacts .tap:active{transform:scale(.96)}
.scr-classic-Contacts .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Contacts .lift:hover{transform:translateY(-2px);box-shadow:0 16px 30px -20px rgba(17,22,20,.45)}
.scr-classic-Contacts .add{transition:border-color .3s,background-color .3s}
.scr-classic-Contacts .add:hover{border-color:var(--primary);background-color:var(--surface)}
.scr-classic-Contacts .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-classic-Contacts .track{transition:background-color .35s}
@media (prefers-reduced-motion:reduce){.scr-classic-Contacts *,.scr-classic-Contacts *::after{animation:none!important;transition:none!important}}
`;

export default function ContactsView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Contacts" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Contacts" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="rise d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/profile" className="tap" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "22px", border: "1px solid #E1E4E0", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>2 of 5</div>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
            Emergency
            <br />
            <span style={{ fontStyle: "italic", color: "var(--primary)" }}>contacts</span>
          </h1>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
            When an SOS starts, they get your live location and an alert, before 112 is called.
          </p>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="lift" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: "#4A3426", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "20px", flexShrink: "0" }}>A</div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "15.5px", fontWeight: "600" }}>Aai</span>
                <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.1em", color: "var(--primary)", border: "1px solid #B9D3CC", borderRadius: "8px", padding: "2px 6px" }}>PRIMARY</span>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Mother · +91 ••••• •4521</div>
            </div>
            <a className="tap" href="tel:" aria-label="Call Aai" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D5DAD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </a>
            <Link to="/settings/contacts/edit" className="tap" aria-label="Edit Aai" style={{ width: "40px", height: "40px", boxSizing: "border-box", borderRadius: "20px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L19 9l-4-4L4 16z" />
              </svg>
            </Link>
          </div>
          <div className="lift" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: "#26303B", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "20px", flexShrink: "0" }}>A</div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "15.5px", fontWeight: "600" }}>Aman</div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Friend · +91 ••••• •7788</div>
            </div>
            <a className="tap" href="tel:" aria-label="Call Aman" style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D5DAD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </a>
            <Link to="/settings/contacts/edit" className="tap" aria-label="Edit Aman" style={{ width: "40px", height: "40px", boxSizing: "border-box", borderRadius: "20px", border: "1px solid #D5DAD6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L19 9l-4-4L4 16z" />
              </svg>
            </Link>
          </div>
          <Link to="/settings/contacts/new" className="add" style={{ height: "64px", boxSizing: "border-box", borderRadius: "20px", border: "1.5px dashed #B9C1BD", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14.5px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add a contact
          </Link>
        </div>
        <div className="rise d4" style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Send SMS when offline</div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.smsText}</div>
            </div>
            <button onClick={v.toggleSms} aria-label="Send SMS when offline" aria-pressed={v.smsPressed} style={{ position: "relative", width: "52px", height: "32px", border: "none", padding: "0", background: "transparent", cursor: "pointer", flexShrink: "0" }}>
              <span className="track" style={{ position: "absolute", inset: "0", borderRadius: "16px", background: v.smsTrack }} />
              <span className="knob" style={{ position: "absolute", top: "4px", left: v.smsKnob, width: "24px", height: "24px", borderRadius: "12px", background: "var(--surface)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0" }}>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: "600" }}>Send a test alert</div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>Check they receive it, marked as a test</div>
            </div>
            <button className="tap" onClick={v.sendTest} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: `1px solid ${v.testBd}`, background: v.testBg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: v.testFg, cursor: "pointer" }}>{v.testLabel}</button>
          </div>
        </div>
      </div>
      {v.showToast && (
        <>
          <div className="toast" role="status" style={{ position: "absolute", left: "24px", right: "24px", bottom: "32px", padding: "14px 16px", borderRadius: "16px", background: "var(--ink)", color: "var(--bg)", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 16px 30px -14px rgba(17,22,20,0.6)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#2FA58A", flexShrink: "0" }} />
            {" "}Test alert sent to Aai and Aman
          </div>
        </>
      )}
    </div>
  );
}
