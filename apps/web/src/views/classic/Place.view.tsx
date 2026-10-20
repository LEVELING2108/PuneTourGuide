// Generated from design-reference/classic/Place.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import type { ViewProps } from '../types';
import { NearbyPlaces } from '../../components/NearbyPlaces';

const css = `
.scr-classic-Place a{color:var(--primary)}
.scr-classic-Place a:hover{color:var(--primary-strong)}
@keyframes cPlace-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cPlace-zoom{from{transform:scale(1.08)}to{transform:scale(1)}}
.scr-classic-Place .rise{animation:cPlace-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Place .zoom{animation:cPlace-zoom 1.4s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Place .d1{animation-delay:.05s}
.scr-classic-Place .d2{animation-delay:.12s}
.scr-classic-Place .d3{animation-delay:.19s}
.scr-classic-Place .d4{animation-delay:.26s}
.scr-classic-Place .d5{animation-delay:.33s}
.scr-classic-Place .d6{animation-delay:.4s}
.scr-classic-Place .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s}
.scr-classic-Place .tap:active{transform:scale(.96)}
.scr-classic-Place .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Place .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(15,76,66,.7)}
.scr-classic-Place .cta:active{transform:scale(.97)}
.scr-classic-Place .ghost{transition:background-color .3s,transform .25s cubic-bezier(.2,.7,.2,1)}
.scr-classic-Place .ghost:hover{background-color:var(--surface)}
.scr-classic-Place .ghost:active{transform:scale(.97)}
@keyframes cPlace-toast{0%{opacity:0;transform:translateY(-8px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-4px)}}
.scr-classic-Place .toast{animation:cPlace-toast 2.4s ease both}
@media (prefers-reduced-motion:reduce){.scr-classic-Place *,.scr-classic-Place *::after{animation:none!important;transition:none!important}}
`;

export default function PlaceView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Place" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Place" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ height: "400px", position: "relative", overflow: "hidden", background: "var(--primary)" }}>
          <div className="zoom" style={{ position: "absolute", inset: "0", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="420" height="420" viewBox="0 0 420 420" aria-hidden="true" style={{ position: "absolute", right: "-120px", top: "-80px", opacity: "0.16" }}>
              <circle cx="210" cy="210" r="90" fill="none" stroke="var(--bg)" />
              <circle cx="210" cy="210" r="140" fill="none" stroke="var(--bg)" />
              <circle cx="210" cy="210" r="190" fill="none" stroke="var(--bg)" />
            </svg>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", color: "#A9CFC6", border: "1px dashed #5F8F86", borderRadius: "12px", padding: "8px 14px", marginTop: "-40px" }}>PLACE PHOTO</div>
          </div>
          <Link to="/explore" className="tap" aria-label="Back" onClick={v.back} style={{ position: "absolute", top: "56px", left: "20px", width: "44px", height: "44px", borderRadius: "22px", background: "rgba(246,246,243,0.16)", border: "1px solid rgba(246,246,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <button className="tap" onClick={v.toggleSave} aria-label={v.saveLabel} aria-pressed={v.savePressed} style={{ position: "absolute", top: "56px", right: "20px", width: "44px", height: "44px", borderRadius: "22px", background: v.saveBg, border: "1px solid rgba(246,246,243,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={v.saveFill} stroke={v.saveStroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
          {v.showToast && (
            <>
              <div className="toast" role="status" style={{ position: "absolute", top: "112px", right: "20px", padding: "10px 14px", borderRadius: "14px", background: "var(--bg)", color: "var(--ink)", fontSize: "13px", fontWeight: "600", boxShadow: "0 14px 28px -14px rgba(0,0,0,0.5)" }}>{v.toastText}</div>
            </>
          )}
          <div className="rise d2" style={{ position: "absolute", left: "24px", right: "24px", bottom: "44px", color: "var(--bg)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "#A9CFC6" }}>{v.kicker}</div>
            <h1 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: "400", lineHeight: "0.95" }}>
              {v.titleA}
              {v.titleA && <br />}
              <span style={{ fontStyle: "italic" }}>{v.titleB}</span>
            </h1>
            <div style={{ fontFamily: "'Mukta', sans-serif", fontSize: "15px", color: "#CFE3DE" }}>{v.nameMr}</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: "372px", left: "0", right: "0", bottom: "0", background: "var(--bg)", borderRadius: "30px 30px 0 0", padding: "28px 24px 28px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", boxSizing: "border-box" }}>
        <p className="rise d3" style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#2C3431" }}>
          {v.description}
        </p>
        <div className="rise d4" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ padding: "14px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>OPEN</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "21px" }}>{v.hours}</div>
          </div>
          <div style={{ padding: "14px 0 14px 14px", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>ENTRY</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "21px" }}>{v.fee}</div>
          </div>
          <div style={{ padding: "14px 0 14px 14px", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", color: "var(--muted)" }}>VISIT</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "21px" }}>{v.visit}</div>
          </div>
        </div>
        <Link to={v.helpHref} className="rise d5 tap" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--ink)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid #EFC9C1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8321C" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Nearest hospital</div>
            <div style={{ fontSize: "14.5px", fontWeight: "600" }}>{v.hospitalLine}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        {v.visited && (
          <div className="rise d5" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>Visited</div>
              <div style={{ fontSize: "14.5px", fontWeight: "600" }}>{v.visitedText}</div>
            </div>
          </div>
        )}
        {v.notVisited && (
          <button className="rise d5 tap" onClick={v.markVisited} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0", border: "none", background: "transparent", color: "var(--ink)", fontFamily: "var(--font-body)", textAlign: "left", cursor: "pointer" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "20px", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
            </span>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{v.visitTitle}</span>
              <span style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--primary)" }}>{v.visitText}</span>
            </span>
          </button>
        )}
        {v.googleHref && (
          <a href={v.googleHref} target="_blank" rel="noreferrer" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", color: "var(--muted)", fontSize: "13px", textDecoration: "none" }}>
            Reviews and photos on Google Maps
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
          </a>
        )}
        <div className="rise d6" style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
          <Link to={v.directionsHref} className="ghost" style={{ flex: "1", height: "56px", borderRadius: "28px", border: "1px solid #C9D0CC", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-8-8 18-2-8z" />
            </svg>
            Directions
          </Link>
          <Link to="/plan" className="cta" onClick={v.addToPlan} style={{ flex: "1.4", height: "56px", borderRadius: "28px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "600", color: "var(--bg)", textDecoration: "none" }}>
            {v.ctaLabel}{" "}
            <span style={{ fontSize: "12.5px", color: "#A9CFC6" }}>{v.xpLabel}</span>
          </Link>
        </div>
        <div style={{ paddingTop: "12px", paddingBottom: "32px" }}>
          <NearbyPlaces sections={v.nearbySections} loading={v.nearbyLoading} emptyText={v.nearbyEmpty} mapHref={v.nearbyMapHref} />
        </div>
      </div>
    </div>
  );
}
