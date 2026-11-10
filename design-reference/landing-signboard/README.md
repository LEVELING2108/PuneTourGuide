# Pune Explorer · Landing kit · PMPML Signboard theme

Everything needed to build the approved Signboard+ landing page into the app with Claude Code, from VS Code or the terminal.

```
landing-signboard/
├── PROMPT.md                          ← paste into Claude Code at the repo root
├── README.md
├── reference/
│   ├── landing-signboard.html         ← the finished page in one file: open in Chrome to see all the motion
│   ├── screenshot-desktop-1440.png    ← full page, motion paused
│   ├── screenshot-mobile-390.png      ← full page at phone width (2×)
│   ├── still-hero-in-motion.png       ← the hero mid-animation
│   └── landing-signboard.design-source.dc.html   (original design-canvas file, reference only)
├── spec/
│   ├── DESIGN_SPEC.md                 ← tokens, type, components, exact copy, accessibility
│   ├── MOTION_SPEC.md                 ← every animation: trigger, timing, keyframes, reduced motion, flow layer
│   ├── landing-signboard.css          ← all CSS + --pe-* tokens + keyframes
│   ├── tokens.json                    ← the --pe-* tokens as JSON
│   └── tailwind.signboard.ts          ← optional Tailwind theme extension with the same tokens
├── motion/
│   └── motion-walkthrough.mp4         ← 54 s, labels each animation (MOTION 01–11); some clips sped up
└── assets/
    ├── screens/                       ← home, plan, trip, passport, sos, classic (600 px JPEG)
    └── qr-puneexplorer.svg / .png
```

## How to use it
1. Unzip into your repo's `design-reference/` folder, so the files land in `design-reference/landing-signboard/`.
2. Open `reference/landing-signboard.html` in Chrome to see the page with all its motion. It loads its fonts from Google Fonts, so you need to be online.
3. Start Claude Code: the Claude Code panel in VS Code, or `claude` in the terminal at the repo root.
4. Paste the prompt from `PROMPT.md` (everything below the line).
5. Claude reads the code, proposes where the page lives and how it's split into components, then waits for your approval. It won't edit code, install packages, create the branch or commit until you say so.

## What's in the motion (details in `spec/MOTION_SPEC.md`)

**Flow (whole page):**
- the bus rides the rail as you scroll;
- the progress bar fills;
- hazard stripes move continuously;
- headings wipe in.

**Per section:**
1. **Hero:** headline lines rise; the LED route board flips मराठी ↔ English.
2. **Skyline:** the route draws itself with ticket-stub stops; the kite sways.
3. **Ticker:** place names scroll.
4. **Discover:** walking rings draw; pins drop; radar sweep and walker.
5. **Plan:** zig-zag route → optimised route; counter 131 → 81.
6. **Trip:** the arrival banner slides in; पाहिले stamp lands; +40 XP floats up.
7. **SOS:** phone shakes; 5-4-3-2-1 countdown; live pin moves; messages arrive.
8. **Offline:** signal bars drop one by one; SAVED OFFLINE stamp lands.
9. **Theme switch:** Deccan ↔ Classic.

All of it is CSS only. It stays complete in browsers without scroll-driven animations and stops for people who ask their device for reduced motion.

## Placeholders still to fill
- **Waitlist form:** "[Connect this form to your waitlist tool]" (no backend yet).
- **Screenshots:** they show the Deccan app theme (22–24 Oct 2026). Retake them if the app screens change, or once the Signboard app theme exists.
