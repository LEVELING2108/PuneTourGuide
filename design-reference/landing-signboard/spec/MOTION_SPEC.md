# Motion spec · Landing page, PMPML Signboard theme

Every animation on the page: what moves, what starts it, its timing and keyframes, and what happens when motion is reduced. The values are copied from `spec/landing-signboard.css`, so treat that file as the source and this one as the explanation.

Watch `motion/motion-walkthrough.mp4` first. It shows each numbered animation below with an on-screen "MOTION 01–11" label. Some clips in it are sped up 1.3–2.4×, so the timings below, not the video, are the real ones.

## 1. Principles

1. **One signature motion per section.** Each section has one "hero" animation that shows a real feature: the route drawing, the optimiser, the stamp, the countdown. Everything else is quiet.
2. **Flow, not fireworks.** Three things run the full length of the page and tie it together. Together they make the "flow" feel:
   - the **bus on the rail** (left edge);
   - the **progress bar** (top);
   - the **moving hazard stripes** between sections.
3. **Three kinds of trigger:**
   - **Load:** plays once when the page opens (hero only).
   - **Loop:** CSS `infinite`, always running, so the section is alive whenever you look at it.
   - **Scroll:** driven by scroll position through `animation-timeline: scroll()` or `view()`, so it moves exactly as fast as the reader scrolls.
4. **Motion must never be needed to understand the page.** Every element looks complete when frozen, which is how the reference screenshots were taken.

## 2. Global rules (must keep)

```css
/* Browsers without scroll-driven animations (Safari < 18, Firefox): show everything, no scroll motion */
@supports not (animation-timeline: view()) { .reveal, .ring, .drop, h2, .progress, .progress-pin, .rail { animation: none } .rail { display: none } }

/* People who ask their device for less motion: stop everything, show final states */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important }
  .mins::after { content: '81' }   /* counter shows its end value */
}
```

- Elements that only make sense while moving start at `opacity: 0` in their resting style, so they disappear when frozen: the walker dot on the discover map, the travelling dot on the skyline, and the arrival banner on the trip phone.
- Only animate `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, `background-position`, `offset-distance` and SVG `cx/cy`. **Never animate layout properties** (width, height, margin) on large elements. The exceptions are small absolutely positioned elements (`.progress-pin`, `.bus`, the walker), which only change `left`/`top`.
- The page wrapper uses `overflow-x: clip` (not `hidden`), or the sticky progress bar stops sticking.

## 3. Flow layer (whole page)

| # | Name | Element | Trigger | Keyframes | Notes |
|---|---|---|---|---|---|
| F1 | Progress bar | `.progress` (6 px, orange `--pe-accent` fill) inside a sticky 6 px yellow bar at the top | Scroll · `scroll(root)` | `grow`: `scaleX(0 → 1)`, `transform-origin: left` | The bar background is `--pe-band` (yellow), the fill `--pe-accent` |
| F2 | Progress pin | `.progress-pin` (14 px white dot, 3 px orange ring) | Scroll · `scroll(root)` | `pinRun`: `left 0% → 100%` | Rides the end of the bar |
| F3 | Bus on the rail | `.rail` (fixed, 3 px dashed line, left 22 px) + `.rail .bus` (23×32 px, orange body, yellow window, black bumper) | Scroll · `scroll(root)` | `busRun`: `top 0 → calc(100% - 32px)` | Hidden under 900 px wide and when unsupported. `pointer-events: none` |
| F4 | Hazard stripes | `.hazard` dividers (18 px) and the hero `.theme-fx` strip (14 px) | Loop · 1.4 s linear | `hz`: `background-position 0 → 51px 0` on a `repeating-linear-gradient(135deg, #111 0 18px, #FFD400 18px 36px)` sized `51px 51px` | 51 px is 36 √2, the stripe period on the diagonal, so the loop has no visible jump |
| F5 | Heading wipe | every `h2` | Scroll · `view()`, range `entry 5% → cover 32%` | `wipe`: `clip-path inset(0 0 100% 0) → inset(0 0 -10% 0)` + `translateY(18px → 0)` | Headings unmask upward like a sign being uncovered |
| F6 | Block rise | `.reveal` blocks | Scroll · `view()`, range `entry 0% → cover 24%` | `rise`: `opacity 0→1`, `translateY(24px → 0)` | Subtle; never more than 24 px |

## 4. Section by section

### 01 · Hero (on load)

| Element | Animation | Timing |
|---|---|---|
| H1 line 1 "SEE MORE" | `lineUp`: `translateY(105% → 0)` inside a `.line` mask (`overflow: hidden`) | 1 s `cubic-bezier(.2,.8,.2,1)`, delay 0 |
| H1 line 2 "OF PUNE." | same | delay .14 s |
| "Never far from help." | `fadeUp`: `opacity 0→1`, `translateY(16px → 0)` | .8 s ease-out, delay .5 s |
| Body paragraph | `fadeUp` | .8 s, delay .7 s |
| Hero phone | `phoneIn`: `opacity 0→1`, `translateY(120px → 0)` | 1.1 s `cubic-bezier(.2,.8,.2,1)`, delay .35 s |
| **Route board LED** | `board`: rows translate 0 → −46 → −92 → −138 px (4 rows, the last repeats the first so the loop is seamless). Holds 28% of the cycle on each row; the flips use `cubic-bezier(.7,0,.3,1)` | Loop 9 s |

The LED look:
- `#FF8A1E` text with `text-shadow: 0 0 10px rgba(255,138,30,.65)` on `#0A0A0A`;
- a `::after` scan-line grid made of two repeating gradients;
- Khand 700, 30 px, uppercase.

The rows read: `शनिवार वाडा → सिंहगड` / `Shaniwar Wada → Sinhagad` / `Pune Explorer · see more of Pune` / (first row again).

### 02 · Skyline route (loop)

| Element | Animation | Timing |
|---|---|---|
| Route path (orange, 3 px) | `draw`: `stroke-dashoffset var(--len) → 0` over the first 50%, then holds. `--len: 1500` = `stroke-dasharray` | Loop 10 s ease-in-out |
| 4 stop circles | `pin`: drop 14 px + fade in at 6–12% | Loop 10 s, delays 0 / 1.5 / 2.8 / 4 s so they land as the line reaches them |
| Travelling dot | `travel`: `offset-distance 0 → 100%` along `offset-path: path('M40 160C240 110 …')`, fades out at 56% | Loop 10 s, synced with `draw` |
| Kite | `kite`: rotate −6° ↔ 7° + translate (16, −10) px; `transform-origin` at the string | Loop 5 s ease-in-out |
| Ticket stubs | static: `.stub` = white, 2 px ink border, dashed left edge (the tear line), 3 px hard shadow | — |

The SVG must stay **fixed at 1440×200** and centred (left 50%, translateX −50%) inside an `overflow: hidden` band. `offset-path` coordinates are in CSS pixels, so the dot only follows the line if the SVG is never scaled.

### Ticker (loop)
`marquee`: `translateX(0 → -50%)`, 70 s linear. The content is written twice and the second copy is `aria-hidden="true"`, so the loop is seamless.

### 04 · Discover · walking map

| Element | Animation | Timing |
|---|---|---|
| 5- and 15-minute rings | `.ring` → `drawOnce`: `stroke-dashoffset var(--len) → 0` (`--len` = circumference: 566, 1131) | Scroll · `view()`, range `entry 10% → cover 45%` |
| Place pins | `.drop` → `pinIn`: 16 px drop + fade | Scroll · `view()`, range `entry 30% → cover 50%` |
| Radar sweep | a 2 px line with a fading gradient, `transform-origin: 0 50%`, `sweep` rotate 0→360° | Loop 6 s linear |
| Walker dot | `walk`: from centre (50%, 50%) to Lal Mahal (57.5%, 45.2%), fades in at 15%, out at 70% | Loop 4.5 s ease-in-out |

### 05 · Plan · optimiser (one synced 9 s loop)

| 0–30% | 30–50% | 50–78% | 78–100% |
|---|---|---|---|
| Grey "order as added" route draws (`zig`) | Grey route fades to 16% | Orange optimised route draws (`best`); the dot runs the stops (`bus`); the counter rolls 131 → 81 (`mins`) | Hold on the result |

- **Label swap:** `label` and `label2` with `steps(1)` swap "ORDER AS ADDED" / "AFTER OPTIMISE" at exactly 50%.
- **Counter:** `@property --mins { syntax: '<integer>'; initial-value: 81 }`, with `counter-reset: m var(--mins)` and `::after { content: counter(m) }`. The integer interpolates in Chromium. In a React build you can keep this CSS or drive the number with `requestAnimationFrame`.
- **Dot path** (SVG `circle` with CSS `cx/cy` keyframes): 213,214 → 189,184 → 85,129 → 172,310 → 422,241 → 438,73. These are the real optimised order: Shaniwar Wada → Pataleshwar → Chaturshringi → Parvati → Empress Garden → Aga Khan Palace.

### 06 · Trip mode

| Element | Animation | Timing |
|---|---|---|
| "You've arrived at Shaniwar Wada?" banner on the trip phone | `slideIn`: drops from −110%, holds 28–80%, leaves at 88% | Loop 7 s ease-in-out |
| पाहिले / VISITED stamp on the passport | `stamp`: from `scale(2.4) rotate(-20deg)` → `scale(.94) rotate(-8deg)` (overshoot at 38%) → settles at 44%, gone at 100% | Loop 5 s ease-out |
| "+40 XP" | `xpUp`: appears at 44% (just after the stamp lands), floats −34 → −50 px, fades by 80% | Loop 5 s ease-out (same cycle as the stamp) |

### 07–08 · SOS

| Element | Animation | Timing |
|---|---|---|
| Phone | `shake`: still for 70% of the cycle, then a damped wobble −12° → 11° → −10° → 8° → −4° → 0°, `transform-origin: 50% 90%` | Loop 4 s ease-in-out |
| Countdown 5-4-3-2-1 | 5 stacked digits, each `cd`: pop in (`scale 1.4 → 1`) and show for 17% of 5 s ≈ 1 s | Loop 5 s linear, delays 0 / 1 / 2 / 3 / 4 s |
| Live-location pin | `livePin`: 5 waypoints across the mini map | 8 s linear, `alternate` |
| Message rows to Aai / Baba / Dada | `msg`: slide in from +18 px, hold, fade | Loop 6 s ease-out, delays 0 / .5 / 1 s |

The SOS section stays **red (`--pe-sos` #C81E16)** in every theme. Never put the accent orange on SOS.

### 09 · Offline · Puneri pati

| Element | Animation | Timing |
|---|---|---|
| Bar 1 (weakest) | `bar`: opacity .2 ↔ 1 (flicker) | Loop 1.8 s |
| Bars 2–4 | `drop3` / `drop2` / `drop1`: ink → grey at 60% / 40% / 20%, `steps(1)`, so the signal drops one bar at a time | Loop 5 s |
| "SAVED OFFLINE" stamp | `savedIn`: lands at 72–78% (after the bars are gone), holds until 96% | Loop 5 s ease-out |

### 10 · Deccan / Classic switch (interaction, not a loop)
- Two real `<button aria-pressed>` elements.
- A click swaps the phone image, its `alt` and the paragraph.
- The pressed button gets the light fill; no animation is needed. In React, an optional 200 ms cross-fade on the image is fine.

### 11 · Phone layout
- Under 900 px the rail hides.
- Sections are flex-wrap rows, so they stack; nothing else changes.
- All loops keep running. The walking-map labels shrink with `clamp(11px, 2.6vw, 15px)`.

## 5. Implementation notes (React / Vite)

- Keep the motion in **CSS**, not a JS animation library. That's lighter, it works with `prefers-reduced-motion` for free, and it matches the reference exactly. No Framer Motion or GSAP is needed.
- **Scroll-driven animations** (`animation-timeline`) work in Chrome/Edge 115+, and in Safari 26 and Firefox only behind support checks. The `@supports` fallback above keeps the page complete without them. Don't polyfill.
- **Pause off-screen loops** if you want to save battery. An `IntersectionObserver` can toggle a `.paused` class (`animation-play-state: paused`) on sections outside the viewport. Optional.
- **Fonts:**
  - `@fontsource/khand` (500/600/700, Latin + Devanagari);
  - `@fontsource-variable/anek-latin`;
  - `@fontsource-variable/anek-devanagari`;
  - load them only in the landing chunk.
- **Images:** the six phone screenshots are 600 px wide JPEGs and display at about 290 px, so they're sharp at 2×. Add `loading="lazy"` below the hero.
