// Generated from design-reference/deccan/DeccanHome.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { CollectionArt, DayRoute, StatusCard } from '../../screens/home/HomeParts';
import { HomeSky } from '../../screens/home/HomeSky';
import type { ViewProps } from '../types';

const css = `
.scr-deccan-DeccanHome a{color:var(--primary)}
.scr-deccan-DeccanHome a:hover{color:var(--primary-strong)}
@keyframes dDeccanHome-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dDeccanHome-pulse{from{transform:scale(1);opacity:.55}to{transform:scale(1.7);opacity:0}}
.scr-deccan-DeccanHome .rise{animation:dDeccanHome-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-deccan-DeccanHome .d1{animation-delay:.05s}
.scr-deccan-DeccanHome .d2{animation-delay:.12s}
.scr-deccan-DeccanHome .d3{animation-delay:.19s}
.scr-deccan-DeccanHome .d4{animation-delay:.26s}
.scr-deccan-DeccanHome .d5{animation-delay:.33s}
.scr-deccan-DeccanHome .d6{animation-delay:.4s}
.scr-deccan-DeccanHome .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s,color .3s}
.scr-deccan-DeccanHome .tap:active{transform:scale(.96)}
.scr-deccan-DeccanHome .lift{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-deccan-DeccanHome .lift:hover{transform:translateY(-3px) rotate(-.4deg);box-shadow:0 18px 32px -18px rgba(35,28,23,.5)}
.scr-deccan-DeccanHome .lift:active{transform:scale(.98)}
.scr-deccan-DeccanHome .navi:hover{color:var(--bg)}
.scr-deccan-DeccanHome .sos::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1.5px solid #C8321C;animation:dDeccanHome-pulse 2.6s ease-out infinite}
@media (prefers-reduced-motion:reduce){.scr-deccan-DeccanHome *,.scr-deccan-DeccanHome *::after{animation:none!important;transition:none!important}}
`;

export default function DeccanHomeView({ v }: ViewProps) {
  return (
    <div className="scr scr-deccan-DeccanHome" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-deccan-DeccanHome" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", paddingBottom: "calc(var(--sab) + 176px)" }}>
        <div style={{ padding: "calc(var(--sb) + 12px) 22px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="rise d1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--muted)" }}>{v.greeting}</div>
              <h1 style={{ margin: "0", fontFamily: "var(--font-accent)", fontSize: "40px", fontWeight: "400", lineHeight: "1.2", color: "var(--ink)" }}>चला, फिरूया!</h1>
            </div>
            <Link to="/settings/language" className="tap" aria-label="Language" style={{ width: "44px", height: "44px", boxSizing: "border-box", borderRadius: "22px", border: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", color: "var(--ink)", textDecoration: "none" }}>अ</Link>
          </div>
          <Link to={v.nextHref} className="rise d2 lift" style={{ position: "relative", height: "212px", borderRadius: "16px", overflow: "hidden", background: "var(--primary)", color: "white", textDecoration: "none", display: "block", flexShrink: "0" }}>
            <HomeSky sky={v.sky} />
            <div style={{ position: "absolute", left: "20px", top: "28px", right: "115px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "14px" }}>{v.nextKicker}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", lineHeight: "32px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.nextName}</div>
              <div style={{ fontSize: "14px", lineHeight: "20px" }}>
                {v.nextMeta.map((m: string) => (
                  <div key={m} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m}</div>
                ))}
              </div>
            </div>
          </Link>
          <DayRoute route={v.route} />
          {v.notReady && (
            <>
              <Link to="/permissions" className="rise d3 tap" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 10px 10px 14px", borderRadius: "16px", background: "#FDF0E1", border: "1px dashed #D9A55F", textDecoration: "none", color: "#6E3A0E" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A4A12" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                <div style={{ flex: "1", fontSize: "14px" }}>
                  <b style={{ fontWeight: "600" }}>Safety not set up</b>
                  {" "}
                  <span style={{ color: "#8A4A12" }}>{v.stepsLeft}</span>
                </div>
                <span style={{ height: "32px", padding: "0 12px", borderRadius: "16px", background: "#8A4A12", color: "#FDF0E1", display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600" }}>Set up</span>
              </Link>
            </>
          )}
          <StatusCard status={v.status} />
          <div className="rise d4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "400" }}>Collect the city</h2>
              <Link to="/explore" style={{ padding: "8px 0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>See all</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
              <Link to="/explore" onClick={v.collections?.[0]?.open} className="lift" style={{ padding: "4px", borderRadius: "4px", background: "var(--surface)", border: "2px dashed color-mix(in srgb, var(--gold) 55%, var(--line))", textDecoration: "none" }}>
                <div style={{ position: "relative", height: "76px", borderRadius: "2px", background: "var(--bg)", padding: "8px 10px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
                  <CollectionArt kind="fort" />
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", lineHeight: "28px", color: "var(--primary)" }}>गड-किल्ले</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{["Forts", v.collections?.[0]?.count].filter(Boolean).join(", ")}</div>
                </div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[1]?.open} className="lift" style={{ padding: "4px", borderRadius: "4px", background: "var(--surface)", border: "2px dashed color-mix(in srgb, var(--gold) 55%, var(--line))", textDecoration: "none" }}>
                <div style={{ position: "relative", height: "76px", borderRadius: "2px", background: "var(--bg)", padding: "8px 10px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
                  <CollectionArt kind="temple" />
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", lineHeight: "28px", color: "var(--primary)" }}>मंदिरे</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{["Temples", v.collections?.[1]?.count].filter(Boolean).join(", ")}</div>
                </div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[2]?.open} className="lift" style={{ padding: "4px", borderRadius: "4px", background: "var(--surface)", border: "2px dashed color-mix(in srgb, var(--gold) 55%, var(--line))", textDecoration: "none" }}>
                <div style={{ position: "relative", height: "76px", borderRadius: "2px", background: "var(--bg)", padding: "8px 10px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
                  <CollectionArt kind="wada" />
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", lineHeight: "28px", color: "var(--primary)" }}>वारसा</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{["Heritage", v.collections?.[2]?.count].filter(Boolean).join(", ")}</div>
                </div>
              </Link>
              <Link to="/explore" onClick={v.collections?.[3]?.open} className="lift" style={{ padding: "4px", borderRadius: "4px", background: "var(--surface)", border: "2px dashed color-mix(in srgb, var(--gold) 55%, var(--line))", textDecoration: "none" }}>
                <div style={{ position: "relative", height: "76px", borderRadius: "2px", background: "var(--bg)", padding: "8px 10px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
                  <CollectionArt kind="food" />
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", lineHeight: "28px", color: "var(--primary)" }}>खाऊगल्ली</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{["Food", v.collections?.[3]?.count].filter(Boolean).join(", ")}</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Link to="/sos" className="tap sos" aria-label="Emergency SOS" style={{ position: "absolute", right: "22px", bottom: "calc(var(--sab) + 100px)", width: "60px", height: "60px", borderRadius: "30px", background: "#C8321C", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(200,50,28,0.75)" }}>SOS</Link>
      <nav className="rise d6" aria-label="Main" style={{ position: "absolute", left: "16px", right: "16px", bottom: "calc(var(--sab) + 20px)", height: "64px", borderRadius: "32px", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxSizing: "border-box", boxShadow: "0 20px 40px -18px rgba(35,28,23,0.6)", borderTop: "2px solid var(--gold)" }}>
        <Link to="/" className="tap" style={{ height: "48px", padding: "0 18px", borderRadius: "24px", background: "var(--bg)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
          Home
        </Link>
        <Link to="/explore" className="tap navi" aria-label="Explore" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" />
          </svg>
        </Link>
        <Link to="/map" className="tap navi" aria-label="Map" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
          </svg>
        </Link>
        <Link to="/plan" className="tap navi" aria-label="Plan" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </Link>
        <Link to="/profile" className="tap navi" aria-label="Profile" style={{ width: "48px", height: "48px", borderRadius: "24px", color: "#B5A795", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
