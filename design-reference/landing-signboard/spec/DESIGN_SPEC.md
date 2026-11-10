# Design spec · Landing page, PMPML Signboard theme

The source of truth is `reference/landing-signboard.html`: open it in Chrome and match it exactly. This file explains the system so nothing gets "improved" by accident. All the motion is described in `MOTION_SPEC.md`.

## 1. Direction

**A Pune bus stop, not a SaaS template.** It's built from:
- black, white and bus-stop yellow, with one orange-red action colour;
- condensed all-caps headings, like route boards and road signs;
- hard 2 px rules, hard offset shadows and square corners;
- real Pune things as graphics:
  - the PMPML route-number plate and LED destination board;
  - ticket stubs for stop times;
  - hazard stripes;
  - a Puneri pati;
  - a PMPML bus riding a rail down the page.

### Do not add
- gradients (except the functional radar-sweep fade);
- glows (except the LED text);
- rounded "pill" cards or soft shadows;
- emoji or sparkle icons, or icon-in-a-tinted-square bullet lists;
- a big-numbers stats band;
- testimonials or logos that don't exist.

## 2. Tokens (`spec/tokens.json`)

| Token | Value | Use |
|---|---|---|
| `--pe-ink` | `#111111` | Text, rules, dark sections, phone bezels, hazard black |
| `--pe-paper` | `#FFFFFF` | Page ground, cards |
| `--pe-yellow` / `--pe-band` | `#FFD400` | Bus-stop yellow: skyline band, plan section, route plate, pati board, phone offset shadows, hazard yellow |
| `--pe-hill` | `#E0B800` | Darker yellow for the hills in the skyline |
| `--pe-accent` | `#C8410F` | The one action colour: primary buttons, route lines, counter, "Never far from help.", the bus. White text on it is 5.0:1 |
| `--pe-accent-hover` | `#8F2D09` | Hover and pressed |
| `--pe-sos` | `#C81E16` | SOS section only. Always red, never orange |
| `--pe-sos-map` / `--pe-sos-map-line` / `--pe-sos-rule` / `--pe-sos-note` | `#A51A13` / `#F06A5E` / `#FF9B85` / `#FFE1DA` | Inside the SOS section |
| `--pe-text` | `#222222` | Body copy |
| `--pe-text-2` / `--pe-muted` | `#444444` / `#555555` | Secondary text, captions |
| `--pe-rule` | `#D0D0D0` | Thin dividers |
| `--pe-route-before` | `#8A8A8A` | The "order as added" route in the optimiser |
| `--pe-on-ink-2` | `#CFCFCF` | Secondary text on black |
| LED text | `#FF8A1E` on `#0A0A0A` | Route board only |

**Contrast.** All text pairs pass WCAG AA:
- black on yellow 13:1;
- white on accent 5.0:1;
- white on SOS red 5.75:1.

Don't put yellow text on white, or orange text below 18 px bold on white.

## 3. Type

| Role | Font | Settings |
|---|---|---|
| Display | **Khand 700** (Indian Type Foundry; Latin + Devanagari) | Uppercase, letter-spacing 0, line-height .86 for the H1 and 1 for H2s |
| Body / UI | **Anek Latin + Anek Devanagari** (Ek Type, Mumbai), variable | `font-family: 'Anek Latin','Anek Devanagari',system-ui,sans-serif` |

| Element | Size |
|---|---|
| H1 | `clamp(56px, 8.4vw, 124px)` |
| H2 | `clamp(40px, 5vw, 70px)`; up to 86 px for "PLAN IT. WALK IT. STAMP IT." |
| Body | 17–20 px, line-height 1.5 |
| Labels | 13–15 px, uppercase, letter-spacing .06–.12em |

`text-wrap: pretty` on headings and paragraphs.

## 4. Components

- **Route board** (under the nav): a black bar with a 4 px yellow bottom border.
  - A `52` route plate: yellow block, Khand 34 px.
  - The LED destination window (see MOTION 01).
  - "VIA LAL MAHAL · KASBA" in yellow, 14 px uppercase.
  - The whole board is decorative: `aria-hidden="true"`.
- **Ticket stub** (`.stub`): white; 2 px ink border with a **dashed left edge**; 3 px hard shadow; 14 px bold.
- **Phone frame** (`.ph`): 8 px `--pe-phone` bezel, 36 px radius, and a **10 px / 10 px hard yellow offset shadow**.
- **Hazard divider** (`.hazard`): 18 px diagonal black/yellow stripes with 2 px black top and bottom borders. It sits between Discover/Plan and Trip, between Trip and SOS, and before Get it.
- **Puneri pati:**
  - yellow board, 3 px ink border, 8 px hard ink shadow, rotated −1.2°;
  - Khand Devanagari text: "सिंहगडावर नेटवर्क मिळेलच असे नाही. ऑफलाइन पॅक आधीच घ्यावा.";
  - English line under it, signed "— आज्ञेवरून, Pune Explorer";
  - a "SAVED OFFLINE" stamp in the corner.
- **Buttons:** 6 px radius, minimum 44 px tall (54 px in the hero).
  - Primary: `--pe-accent` fill with white text.
  - Secondary: an underlined text link.
- **Bus** (`.rail .bus`): 23×32 px orange body, yellow window strip, black bumper; on a 3 px dashed black rail at left 22 px.

## 5. Layout
- Content max-width 1240 px, 24 px side padding.
- Sections are `flex-wrap` rows with `flex: 1 1 <basis>`, so they stack on phones with no media queries. The one media query hides the rail under 900 px.
- Section padding is about 100–120 px top.
- The skyline SVG is fixed at 1440×200, centred in an `overflow: hidden` band (see MOTION 02).

## 6. Page structure and exact copy

1. **Nav**
   - "PUNE EXPLORER" + "पुणे" (accent).
   - Links: Discover · Plan · Trip mode · Safety, plus a black **Open the app** button.
2. **Route board**: see Components.
3. **Hero**
   - H1: "SEE MORE / OF PUNE."
   - Line: "Never far from help."
   - Body: "Shaniwar Wada is on every list. Lal Mahal, 200 m away, usually isn't. Pune Explorer shows you both, puts your day in a sensible order, and keeps 112 one tap away."
   - Buttons: **Open the web app →**, plus a text link "Android waitlist".
   - Meta line: "FREE · 52 PLACES · ENGLISH, मराठी, हिंदी, ગુજરાતી · WORKS OFFLINE".
   - One phone (home.jpg), cropped at the bottom.
4. **Hazard strip, then the yellow skyline band**
   - Ticket stubs: 9:00 Shaniwar Wada · 10:45 Lal Mahal · 11:30 Kasba Ganpati · 1:00 Bedekar Misal.
   - A kite.
5. **Ticker**: black strip; place names alternating with Devanagari names in yellow.
6. **Discover**
   - H2: "WHAT'S NEXT TO WHERE YOU'RE STANDING."
   - Side note: "Every place in the app lists up to six places and six food spots within 3 km, nearest first, with the walk time."
   - Walking map:
     - 5 / 15 / 30-minute rings;
     - centre diamond: Shaniwar Wada;
     - pins:
       - Lal Mahal 200 m, Kasba Ganpati 550 m, Dagdusheth Ganpati 400 m (places, black dots);
       - Bedekar Misal 900 m, Goodluck Cafe 1.5 km (food, orange squares);
       - Parvati Hill steps (side quest, triangle).
   - Definition list: Places nearby / Food nearby / Side quests.
7. **Plan** (yellow section)
   - H2: "STOP ZIG-ZAGGING ACROSS THE CITY."
   - Body: "Add places to Day 1 or Day 2, or load a ready route. Optimise reorders the stops by real travel time and never makes your day longer."
   - Counter + "minutes of travel".
   - Footnote: "Six real places: 131 min in the order they were added, 81 after Optimise."
   - Map with 6 places.
8. **Hazard**, then **Trip**
   - H2: "PLAN IT. WALK IT. STAMP IT."
   - Note: "Start Day walks you through the plan. It asks 'You've arrived?' only after you've been near the stop for 30 seconds, and keeps working with no signal."
   - Three phones: Plan / Walk / Stamp, with captions.
9. **Hazard**, then **SOS** (red)
   - H2: "IF SOMETHING GOES WRONG: ONE TAP, OR ONE SHAKE."
   - Steps:
     1. Tap SOS on any screen, or shake the phone three times.
     2. Five seconds to cancel, in case it was a mistake.
     3. The dialler opens with 112. You press call.
     4. Your phone texts each emergency contact a live location link and the nearest hospital, even without mobile data.
   - Disclaimer: "Pune Explorer helps you reach emergency services faster. It does not replace them, and it never calls or texts without you."
   - Phone + countdown, then the live map + 3 message rows.
10. **Offline**
    - Pati (see Components).
    - H2: "FORTS GET ONE BAR OF SIGNAL. THE APP IS READY FOR THAT."
    - Body about offline packs, plus "About 2,000 help points across Pune district, refreshed every night."
11. **Deccan or Classic** (black section): the working switch.
12. **Hazard**, then **Get it**
    - H2: "SEE MORE / OF PUNE."
    - Email form: visible label, **Notify me** button, and the placeholder note "[Connect this form to your waitlist tool]".
    - QR code + **Open puneexplorer.dev**.
13. **Footer**
    - "Made in Pune by Sourav Suman, Aman Kumar and Sanika Darekar."
    - Links: GitHub · Privacy · Terms.

## 7. Accessibility (keep all of it)
- Real `<a href>` and `<button>` elements; the email `<input>` has a `<label>`.
- Touch targets are at least 44 px.
- Focus ring: a 3 px black outline with a 6 px yellow halo (`outline` + `box-shadow`), so it shows on white, yellow and black sections alike.
- Decorative layers are `aria-hidden="true"`: the rail, route board, skyline, maps, countdown and stamps.
- Phone screenshots that carry meaning have real `alt` text.
- The pati paragraph has `lang="mr"`. The duplicated ticker copy is `aria-hidden`.
- All motion respects `prefers-reduced-motion` (MOTION_SPEC §2).

## 8. Assets
- `assets/screens/*.jpg`: real app screenshots, Deccan theme (classic.jpg is the Classic theme), 600 px wide, taken on 22–24 Oct 2026. Retake them if the screens change.
- `assets/qr-puneexplorer.svg|png`: QR code for https://puneexplorer.dev.
