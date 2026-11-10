# Prompt for Claude Code (terminal or VS Code)

1. Unzip into your repo's `design-reference/` folder, so the files land in `design-reference/landing-signboard/`.
2. Open the repo in VS Code. Start Claude Code, from the Claude Code panel or by running `claude` in the integrated terminal at the repo root.
3. Paste everything below the line.

---

You are implementing **Landing page 2.0, PMPML Signboard theme** for Pune Explorer in this repo. The approved design is in `design-reference/landing-signboard/`. Read these first, in this order:

1. `design-reference/landing-signboard/README.md`: what's in the kit.
2. `design-reference/landing-signboard/spec/DESIGN_SPEC.md`: tokens, type, components, exact copy, accessibility.
3. `design-reference/landing-signboard/spec/MOTION_SPEC.md`: **every animation**, with its trigger, timing, keyframes and reduced-motion behaviour, including the page-long "flow" layer (bus on the rail, progress bar, moving hazard stripes).
4. `design-reference/landing-signboard/reference/landing-signboard.html`: the finished page as one static HTML file. **This is the visual source of truth.** Match it exactly: spacing, sizes, colours, copy, motion timings.
5. `design-reference/landing-signboard/spec/landing-signboard.css`: all the CSS, tokens (`--pe-*`) and keyframes.
6. `design-reference/landing-signboard/reference/screenshot-desktop-1440.png` and `screenshot-mobile-390.png`: how it must look, with motion paused.
7. `design-reference/landing-signboard/motion/motion-walkthrough.mp4`: shows each animation with a numbered label. You can't watch video, so rely on MOTION_SPEC for the exact values. The video is for me to compare against.

## How I want you to work
- **Ask before acting.** Show me a plan first and change no code until I say yes.
- Never commit, push, open a PR, delete files or install packages without asking me.
- Work on a new branch, `feat/landing-signboard`, created from `research`. Ask me before creating it.
- Don't touch existing app screens, themes, routes or the service worker, except for the one route or link I approve.

## Step 1: read the code and propose a plan (no edits)
Look at:
- `apps/web/src/app/router.tsx` and how screens are lazy-loaded;
- `apps/web/src/views/` (the Classic and Deccan views);
- how global CSS, Tailwind and `@fontsource` fonts are loaded;
- `apps/web/vite.config.ts` (the PWA `injectManifest` globPatterns);
- `apps/web/e2e/a11y.spec.ts`;
- the bundle budget in the docs.

Then give me a short plan with these choices for me to make:

- **Where the page lives.**
  - A: a lazy-loaded route `/about`, linked from the Welcome screen and Settings.
  - B: shown at `/` to first-time desktop visitors.
  - C: a separate static Vite entry `landing.html` outside the app.

  Recommend one with reasons (bundle size, PWA caching, SEO, deep links). Default to A.
- **Where "Open the web app" and "Open the app" go.** They should be in-app links (`/welcome` for new users, `/` otherwise), not the external URL.
- **Text and i18n.** English first, keeping the Marathi lines exactly as designed, or i18next keys now. Default: English first.
- **Component split.** List the components you'll create, for example:
  - `LandingNav`, `RouteBoard` (LED), `Hero`, `SkylineRoute`, `PlaceTicker`, `WalkingMap`;
  - `OptimiserDemo`, `TripStrip`, `SosDemo`, `PuneriPati`, `ThemeSwitch`, `GetIt`;
  - `HazardDivider`, `BusRail`, `ScrollProgress`, `PhoneFrame`, `TicketStub`.

## Step 2: implement (after I approve)
- **Faithful conversion.** Convert `reference/landing-signboard.html` to JSX section by section. Keep the structure, inline values, copy and every `aria-*`, `alt`, `lang="mr"` and `aria-hidden`.
- **CSS.**
  - Move `spec/landing-signboard.css` into one stylesheet imported only by the landing screen.
  - Scope element rules (`body`, `a`, `h1`, `h2`, `.ph`, `.card` …) under a `.pe-landing` wrapper.
  - Prefix keyframes `pel-` if any clash with existing ones.
  - Keep all `--pe-*` tokens on `.pe-landing`, not `:root`, so the app's own themes are unaffected.
- **Motion: do it all in CSS**, exactly as specified. No Framer Motion, GSAP or JS animation libraries. Keep:
  - the scroll-driven ones (`animation-timeline: scroll()/view()`) with their `@supports not (…)` fallback;
  - every loop with its delays, so they stay in sync. The SOS countdown digits have 0–4 s delays; the skyline pins have 0 / 1.5 / 2.8 / 4 s;
  - `@property --mins` for the 131 → 81 counter;
  - the `prefers-reduced-motion` override that stops everything and shows final states;
  - the skyline SVG fixed at 1440×200 and centred, so `offset-path` matches the route;
  - the bus rail as `position: fixed` inside the landing wrapper, hidden under 900 px. The wrapper uses `overflow-x: clip`, not `hidden`, so the sticky progress bar works.
- **Fonts.** Ask me before installing; then add `@fontsource/khand` (500/600/700), `@fontsource-variable/anek-latin` and `@fontsource-variable/anek-devanagari`.
  - Import them only in the landing chunk.
  - Remove the Google Fonts `<link>`.
- **Images.** Copy `assets/screens/*.jpg` and `assets/qr-puneexplorer.svg` to `apps/web/src/assets/landing/` and import them. Add `loading="lazy"` and `decoding="async"` below the hero.
- **Theme switch.** Rebuild it with `useState`: `aria-pressed`, swap the image src and alt, swap the paragraph.
- **Waitlist form.** Front-end only: `preventDefault`, and keep the note "[Connect this form to your waitlist tool]". No backend, no third-party script.
- **Optional, ask me first:** pause off-screen loops with an `IntersectionObserver` that toggles `animation-play-state`.
- **Nothing extra.** Do not add sections, stats, testimonials, gradients, emoji or animations that aren't in the reference. If something seems missing, ask.

## Step 3: check your work
- `npm run lint`, `npm run typecheck`, and `npm test -w apps/web`.
  - Add tests: the H1 renders; clicking Classic sets `aria-pressed="true"` and swaps the image alt; the reduced-motion media query exists in the stylesheet.
- Add the new route to `e2e/a11y.spec.ts` (both app themes) and run it: no WCAG 2.1 A/AA violations.
- Tab through the page: the focus ring (3 px black outline + 6 px yellow halo) must show on the white, yellow and black sections.
- `npm run build`, then report:
  - the main bundle's gzip size before and after (it must not grow);
  - the landing chunk's size.
- Run the dev server and take Playwright screenshots of the page with motion paused, using the same CSS as the reference:
  `*,*::before,*::after{animation:none!important} .mins::after{content:"81"!important} .rail{display:none!important}`.
  - Take them at 1440×900 (full page) and 390×844 (full page, 2×).
  - Compare side by side with the reference PNGs, list every visible difference, fix them, and show me the final screenshots.
- **Motion check in Chrome**, against MOTION_SPEC. Confirm each of these runs:
  1. LED board flips;
  2. route draws with pins and the travelling dot; kite sways;
  3. ticker scrolls;
  4. rings draw on scroll; pins drop; radar sweeps; walker walks;
  5. optimiser cycle: grey route → orange route → dot → counter 131 → 81;
  6. arrival banner slides in; stamp lands; +40 XP floats up;
  7. phone shakes; countdown 5-4-3-2-1; live pin moves; messages arrive;
  8. signal bars drop; SAVED OFFLINE stamp lands;
  9. theme switch works;
  10. bus rides the rail and the progress bar fills as you scroll; hazard stripes move.

  Then check that the page is complete and static in Firefox, and with reduced motion turned on.

## Step 4: hand back
Give me:
- the list of files you added or changed;
- the screenshots;
- the test, a11y and bundle results;
- the motion checklist with ✓ or ✗ against each item;
- anything you couldn't match exactly, and why.

Then **wait for me** before committing. When I approve, use Conventional Commits, for example `feat(landing): add signboard landing page`.
