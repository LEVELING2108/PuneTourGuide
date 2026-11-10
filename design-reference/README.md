# Pune Explorer — design reference

These files are the approved UI mockups for Pune Explorer (PuneTourGuide + RoadSoS merged).
They are **reference only** — rebuild them as React components; do not ship these files.

- `classic/` — Classic theme (emerald + ivory). 28 screens.
- `deccan/` — Deccan theme (Paithani plum, sandalwood, zari gold, Marathi accents). 29 screens.
- `canvas.json` — how the screens were laid out on the design canvas (rows = flows). Ignore for code.

Each Deccan file is the twin of the Classic file with the same name minus the `Deccan` prefix
(`Explore.dc.html` ↔ `DeccanExplore.dc.html`). Exceptions: `Profile.dc.html` ↔ `DeccanSettings.dc.html`,
`Main.dc.html` ↔ `DeccanHome.dc.html`, and `DeccanProfile.dc.html` (travel passport) has no Classic twin.

## How to read a `.dc.html` file

The files run on a small design-tool runtime (`support.js`, not included), so they will **not** open
correctly by double-clicking. Read them as source:

| Syntax | Meaning | React equivalent |
|---|---|---|
| `<x-dc> … </x-dc>` | The screen's markup | The component's JSX |
| `<helmet><style>…` | Fonts + keyframes/hover classes (`.rise`, `.tap`, `.lift`, `.sos` …) | Global CSS / Tailwind plugin |
| `style="…"` inline | Exact sizes, colours, spacing (390×844 phone frame) | Tailwind classes / theme tokens |
| `{{name}}` | Value returned by `renderVals()` in the script at the bottom | JSX expression / derived state |
| `<sc-for list="{{items}}" as="item">` | Loop | `items.map(item => …)` |
| `<sc-if value="{{cond}}">` | Conditional | `{cond && …}` |
| `onClick="{{fn}}"` | Event handler from `renderVals()` | `onClick={fn}` |
| `class Component extends DCLogic` + `this.state` / `setState` | Screen logic (countdowns, toggles, filters) | `useState` / `useEffect` |
| `<a href="Plan.dc.html">` | Navigates to that screen | Router link / tab change |
| `<dc-import name="Explore">` | Renders another screen underneath (used for sheets/overlays) | Render the screen + an overlay component |
| `data-props` | Design-tool tweak settings | Component props |

## Screen index (Classic name → purpose)

**Main tabs:** Main (Home), Explore, Map (places / my route / help layers), Plan (day plan, safety per stop), Profile (settings list)
**Detail:** Place, Navigation (turn-by-turn), Filters (sheet over Explore), SOS (5-s countdown, call 112)
**Settings:** EditProfile, Contacts, ContactEdit, ContactAdd, Medical, Offline, Language, Theme, SignOut
**Account:** Login (email / mobile tabs, Google), SignUp, Otp, PhoneName, Onboard (first emergency contact), ForgotPassword
**First launch:** Splash → Intro (3 slides) → Permissions (location + motion) → SignUp/Login/skip → Home; HomeSetup = Home with "safety not set up" card
**Deccan only:** DeccanProfile (travel passport with stamps)

## Theme tokens (implement as CSS variables, switch with `<html data-theme="…">`)

| Token | Classic | Deccan |
|---|---|---|
| bg | #F6F6F3 | #F3EADB |
| surface | #FFFFFF | #FFFBF3 |
| ink | #111614 | #231C17 |
| muted | #5E6763 | #6B5D50 |
| line | #E4E6E2 | #E2D4BE |
| primary | #0F4C42 | #7A1F4E |
| tiles | #4A3426 · #26303B · #1B2220 | #7A1F4E · #A4462B · #0E5B5E |
| accent | — | gold #C59A3A |
| sos (never themed) | #C8321C | #C8321C |
| display font | Instrument Serif | DM Serif Display |
| body font | Hanken Grotesk | Mukta |
| Marathi accent font | — | Yatra One |

Deccan-only decorations: zari border strip, fort skyline SVG, Marathi kicker above headings, postage-stamp tiles,
ticket/boarding-pass cards, postmarks. Copy the SVG paths straight from the Deccan files.

## Placeholders to replace with real data
`[HOURS]`, `[FEE]`, hospital distances, XP numbers, contact numbers, place photos (coloured blocks), Google logo slot (use Google's official sign-in button).
