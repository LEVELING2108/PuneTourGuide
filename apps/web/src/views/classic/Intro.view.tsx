// Generated from design-reference/classic/Intro.dc.html by scripts/convert-designs.py, then wired up by hand.
import { Link } from 'react-router';
import { Fragment } from 'react';
import type { ViewProps } from '../types';

const css = `
.scr-classic-Intro a{color:var(--primary)}
.scr-classic-Intro a:hover{color:var(--primary-strong)}
@keyframes cIntro-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cIntro-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes cIntro-ripple{from{transform:scale(.8);opacity:.5}to{transform:scale(1.9);opacity:0}}
.scr-classic-Intro .rise{animation:cIntro-rise .7s cubic-bezier(.2,.7,.2,1) both}
.scr-classic-Intro .d1{animation-delay:.05s}
.scr-classic-Intro .d2{animation-delay:.15s}
.scr-classic-Intro .d3{animation-delay:.3s}
.scr-classic-Intro .bob{animation:cIntro-bob 5s ease-in-out infinite}
.scr-classic-Intro .b2{animation-delay:-1.6s}
.scr-classic-Intro .b3{animation-delay:-3.2s}
.scr-classic-Intro .rip{position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);animation:cIntro-ripple 2.6s ease-out infinite}
.scr-classic-Intro .rp2{animation-delay:1.3s}
.scr-classic-Intro .track{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain}
.scr-classic-Intro .track::-webkit-scrollbar{display:none}
.scr-classic-Intro .track>*{scroll-snap-align:start;scroll-snap-stop:always}
.scr-classic-Intro .dot{transition:width .4s cubic-bezier(.2,.7,.2,1),background-color .4s}
.scr-classic-Intro .tap{transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .3s,background-color .3s}
.scr-classic-Intro .tap:active{transform:scale(.97)}
.scr-classic-Intro .cta{transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.scr-classic-Intro .cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px rgba(17,22,20,.6)}
.scr-classic-Intro .cta:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.scr-classic-Intro *,.scr-classic-Intro *::after{animation:none!important;transition:none!important}}
`;

export default function IntroView({ v }: ViewProps) {
  return (
    <div className="scr scr-classic-Intro" style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style href="scr-classic-Intro" precedence="screens">{css}</style>
      <div data-scroll="" style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden" }}>
        <div className="rise d1" style={{ position: "absolute", top: "56px", left: "24px", right: "24px", height: "44px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: "2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M15.5 8.5l-2 5-5 2 2-5z" />
            </svg>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "19px" }}>Pune Explorer</span>
          </div>
          <Link to="/permissions" onClick={v.done} style={{ height: "44px", display: "flex", alignItems: "center", padding: "0 4px", fontSize: "14px", fontWeight: "600", color: "var(--muted)", textDecoration: "none" }}>Skip</Link>
        </div>
        <div className="track" ref={v.trackRef} onScroll={v.onSlide} tabIndex={0} role="region" aria-label="Introduction" style={{ position: "absolute", top: "112px", left: "0", width: "100%", height: "560px", display: "flex" }}>
          <section aria-label="Discover" style={{ flex: "0 0 100%", boxSizing: "border-box", padding: "0 24px", display: "flex", flexDirection: "column", gap: "26px" }}>
            <div style={{ height: "380px", borderRadius: "32px", background: "var(--primary)", position: "relative", overflow: "hidden" }}>
              <svg width="360" height="360" viewBox="0 0 360 360" aria-hidden="true" style={{ position: "absolute", right: "-150px", bottom: "-150px", opacity: "0.14" }}>
                <circle cx="180" cy="180" r="80" fill="none" stroke="var(--bg)" />
                <circle cx="180" cy="180" r="130" fill="none" stroke="var(--bg)" />
                <circle cx="180" cy="180" r="175" fill="none" stroke="var(--bg)" />
              </svg>
              <div className="bob" style={{ position: "absolute", left: "24px", top: "40px" }}>
                <div style={{ transform: "rotate(-4deg)", width: "228px", display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 18px 30px -18px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#1B2220" }} />
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", lineHeight: "1.1" }}>Shaniwar Wada</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Heritage · 2.1 km</div>
                  </div>
                </div>
              </div>
              <div className="bob b2" style={{ position: "absolute", left: "86px", top: "128px" }}>
                <div style={{ transform: "rotate(3deg)", width: "228px", display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 18px 30px -18px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#26303B" }} />
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", lineHeight: "1.1" }}>Pataleshwar Caves</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Temple · 3.4 km</div>
                  </div>
                </div>
              </div>
              <div className="bob b3" style={{ position: "absolute", left: "36px", top: "216px" }}>
                <div style={{ transform: "rotate(-2deg)", width: "228px", display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "18px", background: "var(--surface)", boxShadow: "0 18px 30px -18px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#4A3426" }} />
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", lineHeight: "1.1" }}>Sinhagad Fort</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Fort · trek</div>
                  </div>
                </div>
              </div>
              <div style={{ position: "absolute", left: "22px", right: "22px", bottom: "22px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ padding: "5px 11px", borderRadius: "14px", background: "var(--bg)", color: "var(--primary)", fontSize: "12.5px", fontWeight: "600" }}>English</span>
                <span style={{ padding: "3px 11px", borderRadius: "14px", border: "1px solid rgba(246,246,243,0.4)", color: "var(--bg)", fontFamily: "'Mukta', sans-serif", fontSize: "14px" }}>मराठी</span>
                <span style={{ padding: "3px 11px", borderRadius: "14px", border: "1px solid rgba(246,246,243,0.4)", color: "var(--bg)", fontFamily: "'Mukta', sans-serif", fontSize: "14px" }}>हिन्दी</span>
                <span style={{ padding: "3px 11px", borderRadius: "14px", border: "1px solid rgba(246,246,243,0.4)", color: "var(--bg)", fontFamily: "'Mukta Vaani', sans-serif", fontSize: "14px" }}>ગુજરાતી</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--primary)" }}>01 · DISCOVER</div>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
                Discover{" "}
                <span style={{ fontStyle: "italic", color: "var(--primary)" }}>Pune</span>
              </h2>
              <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.5", color: "#4A5451" }}>
                Forts, temples, food and the old peths, curated and in your own language.
              </p>
            </div>
          </section>
          <section aria-label="Plan" style={{ flex: "0 0 100%", boxSizing: "border-box", padding: "0 24px", display: "flex", flexDirection: "column", gap: "26px" }}>
            <div style={{ height: "380px", borderRadius: "32px", background: "#26303B", position: "relative", overflow: "hidden" }}>
              <div className="bob" style={{ position: "absolute", left: "28px", right: "28px", top: "44px" }}>
                <div style={{ background: "var(--surface)", borderRadius: "22px", padding: "18px 18px 8px", boxShadow: "0 22px 40px -22px rgba(0,0,0,0.6)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "10px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}>Saturday</div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#86611F" }}>+150 XP</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", paddingTop: "4px" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "7px", background: "var(--primary)" }} />
                      <span style={{ flex: "1", width: "1px", background: "#D5DAD6" }} />
                    </div>
                    <div style={{ flex: "1", paddingBottom: "12px" }}>
                      <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--muted)", fontWeight: "600" }}>9:30 AM</div>
                      <div style={{ fontSize: "15px", fontWeight: "600" }}>Shaniwar Wada</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", paddingTop: "4px" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "7px", border: "2px solid var(--primary)", boxSizing: "border-box" }} />
                      <span style={{ flex: "1", width: "1px", background: "#D5DAD6" }} />
                    </div>
                    <div style={{ flex: "1", paddingBottom: "12px" }}>
                      <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--muted)", fontWeight: "600" }}>11:30 AM</div>
                      <div style={{ fontSize: "15px", fontWeight: "600" }}>Dagdusheth Ganpati</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", paddingTop: "4px" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "7px", border: "2px solid #C27A1E", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: "1", paddingBottom: "12px" }}>
                      <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--muted)", fontWeight: "600" }}>3:00 PM</div>
                      <div style={{ fontSize: "15px", fontWeight: "600" }}>Sinhagad Fort</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bob b2" style={{ position: "absolute", left: "28px", bottom: "30px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "16px", background: "var(--bg)", fontSize: "13px", fontWeight: "600", color: "var(--ink)", boxShadow: "0 14px 24px -14px rgba(0,0,0,0.6)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 17l6-6 4 4 6-8" />
                  <path d="M15 7h5v5" />
                </svg>
                Stops ordered for you
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "var(--primary)" }}>02 · PLAN</div>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
                Plan{" "}
                <span style={{ fontStyle: "italic", color: "var(--primary)" }}>smarter</span>
                {" "}days
              </h2>
              <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.5", color: "#4A5451" }}>
                Add the places you like. We order the stops, map the route and you earn XP at every one.
              </p>
            </div>
          </section>
          <section aria-label="Stay safe" style={{ flex: "0 0 100%", boxSizing: "border-box", padding: "0 24px", display: "flex", flexDirection: "column", gap: "26px" }}>
            <div style={{ height: "380px", borderRadius: "32px", background: "#8F1D12", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "50%", top: "46%", width: "0", height: "0" }}>
                <span className="rip" />
                <span className="rip rp2" />
                <div style={{ position: "absolute", left: "-54px", top: "-54px", width: "108px", height: "108px", borderRadius: "54px", background: "var(--surface)", color: "#8F1D12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", boxShadow: "0 20px 40px -16px rgba(0,0,0,0.5)" }}>SOS</div>
              </div>
              <div className="bob" style={{ position: "absolute", left: "20px", top: "30px", display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", borderRadius: "14px", background: "var(--surface)", fontSize: "12.5px", fontWeight: "600", boxShadow: "0 14px 24px -14px rgba(0,0,0,0.6)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#C8321C" }} />
                KEM Hospital · 1.2 km
              </div>
              <div className="bob b2" style={{ position: "absolute", right: "18px", top: "248px", display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", borderRadius: "14px", background: "var(--surface)", fontSize: "12.5px", fontWeight: "600", boxShadow: "0 14px 24px -14px rgba(0,0,0,0.6)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#2FA58A" }} />
                Live location shared
              </div>
              <div className="bob b3" style={{ position: "absolute", left: "24px", bottom: "26px", display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", borderRadius: "14px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.35)", color: "var(--surface)", fontSize: "12.5px", fontWeight: "600" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
                </svg>
                Works offline
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: "600", letterSpacing: "0.16em", color: "#A3281A" }}>03 · STAY SAFE</div>
              <h2 style={{ margin: "0", fontFamily: "var(--font-display)", fontSize: "40px", fontWeight: "400", lineHeight: "1" }}>
                Help is always{" "}
                <span style={{ fontStyle: "italic", color: "#A3281A" }}>near</span>
              </h2>
              <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.5", color: "#4A5451" }}>
                Shake your phone or tap SOS. We call 112, share your live location and show the nearest hospital, even offline.
              </p>
            </div>
          </section>
        </div>
      </div>
      <div style={{ position: "absolute", left: "24px", right: "24px", bottom: "36px", display: "flex", flexDirection: "column", gap: "18px", alignItems: "center" }}>
        <div aria-hidden="true" style={{ display: "flex", gap: "6px" }}>
          {((v.dots ?? []) as any[]).map((d: any, dIndex: number) => (
            <Fragment key={d?.key ?? dIndex}>
              <span className="dot" style={{ width: d.w, height: "6px", borderRadius: "3px", background: d.bg }} />
            </Fragment>
          ))}
        </div>
        {v.notLast && (
          <>
            <button className="tap cta" onClick={v.next} style={{ width: "100%", height: "56px", borderRadius: "28px", border: "none", background: "var(--ink)", color: "var(--bg)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
              Next{" "}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
        {v.isLast && (
          <>
            <Link to="/permissions" onClick={v.done} className="cta" style={{ width: "100%", height: "56px", borderRadius: "28px", background: "var(--primary)", color: "var(--bg)", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>Get started</Link>
          </>
        )}
        <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link to="/login" onClick={v.done} style={{ fontWeight: "600", textDecoration: "none" }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
