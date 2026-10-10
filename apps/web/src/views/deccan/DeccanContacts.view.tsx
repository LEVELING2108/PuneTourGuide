// Generated from design-reference/deccan/DeccanContacts.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanContacts a{color:var(--primary)}
.scr-deccan-DeccanContacts a:hover{color:var(--primary-strong)}
@keyframes dDeccanContacts-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanContacts-toast{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px)}}
.scr-deccan-DeccanContacts .rise{animation:dDeccanContacts-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanContacts .d1{animation-delay:.05s}
.scr-deccan-DeccanContacts .d2{animation-delay:.12s}
.scr-deccan-DeccanContacts .d3{animation-delay:.19s}
.scr-deccan-DeccanContacts .d4{animation-delay:.26s}
.scr-deccan-DeccanContacts .d5{animation-delay:.33s}
.scr-deccan-DeccanContacts .d6{animation-delay:.4s}
.scr-deccan-DeccanContacts .toast{animation:dDeccanContacts-toast 2.8s ease both}
.scr-deccan-DeccanContacts .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s,border-color .3s}
.scr-deccan-DeccanContacts .tap:active{transform:scale(.96)}
.scr-deccan-DeccanContacts .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanContacts .lift:hover{transform:translateY(-2px);box-shadow:0 16px 30px -20px rgba(35,28,23,.45)}
.scr-deccan-DeccanContacts .add{transition:border-color .3s,background-color .3s}
.scr-deccan-DeccanContacts .add:hover{border-color:var(--primary);background-color:var(--surface)}
.scr-deccan-DeccanContacts .knob{transition:left .35s cubic-bezier(.3,.8,.2,1)}
.scr-deccan-DeccanContacts .track{transition:background-color .35s}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanContacts *,.scr-deccan-DeccanContacts *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanContactsView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanContacts" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanContacts" precedence="screens">{css}</style>
      <div data-scroll="" data-flex="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", padding: "56px 24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
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
          <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{v.countText}</div>
        </div>
        <div className="rise d2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: "19px", lineHeight: "1.25", color: "#A4462B" }}>आपत्कालीन संपर्क</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
              Emergency
              <br />
              <span style={{ fontStyle: "italic", color: "var(--primary)" }}>contacts</span>
            </h1>
          </div>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>
            When an SOS starts, they get your live location and an alert, before 112 is called.
          </p>
        </div>
        <div className="rise d3" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {((v.contacts ?? []) as any[]).map((c: any) => (
            <Fragment key={c.key}>
            <div className="lift" style={{ background: "var(--surface)", border: "1.5px dashed #D8C6A6", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: c.tone, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "20px", flexShrink: "0" }}>{c.initial}</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "15.5px", fontWeight: "600" }}>{c.name}</span>
                  {c.isPrimary && <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.1em", color: "var(--primary)", border: "1px solid #E3B9CE", borderRadius: "8px", padding: "2px 6px" }}>PRIMARY</span>}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>{c.meta}</div>
              </div>
              <a className="tap" href={c.tel} aria-label={c.callLabel} style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #D8C6A6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
              </a>
              <Link to={c.editHref} className="tap" aria-label={c.editLabel} style={{ width: "40px", height: "40px", boxSizing: "border-box", borderRadius: "20px", border: "1px solid #D8C6A6", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20h4L19 9l-4-4L4 16z" />
                </svg>
              </Link>
            </div>
            </Fragment>
          ))}
          {v.empty && (
            <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--muted)" }}>No contacts yet. Add someone who should know when you need help.</p>
          )}
          {v.canAdd && (
          <Link to="/settings/contacts/new" className="add" style={{ height: "64px", boxSizing: "border-box", borderRadius: "20px", border: "1.5px dashed #C9B79C", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14.5px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add a contact
          </Link>
          )}
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
            <button className="tap" onClick={v.sendTest} disabled={v.testBusy} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: `1px solid ${v.testBd}`, background: v.testBg, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: v.testFg, cursor: "pointer" }}>{v.testLabel}</button>
          </div>
        </div>
      </div>
      {v.showToast && (
        <>
          <div className="toast" role="status" style={{ position: "absolute", left: "24px", right: "24px", bottom: "32px", padding: "14px 16px", borderRadius: "16px", background: "var(--ink)", color: "var(--bg)", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 16px 30px -14px rgba(35,28,23,0.6)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#2FA58A", flexShrink: "0" }} />
            {v.toastText}
          </div>
        </>
      )}
    </div>
  );
}
