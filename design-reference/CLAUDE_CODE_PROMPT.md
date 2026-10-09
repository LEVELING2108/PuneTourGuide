# Prompts for Claude Code (run `claude` in the PuneTourGuide folder)

Unzip so `CLAUDE.md` and the `design-reference/` folder sit in the repo root. Work on a new branch: `git checkout -b redesign`.
Commit after every phase that works (`git commit`), so you can always roll back.

## Phase 0 — plan (no code yet)

```
Read CLAUDE.md, design-reference/TECH_DESIGN.md, design-reference/README.md and design-reference/FEATURES.md, then skim
design-reference/classic/Main.dc.html and design-reference/deccan/DeccanHome.dc.html to learn the .dc.html format.
Also read this repo's frontend (src/) and backend (backend/src, backend/prisma/schema.prisma).

Goal: rework the whole app to match the new UI in design-reference/ — same layout, copy, animations and
interactions — with two switchable themes (Classic, Deccan), and make EVERY button and feature in FEATURES.md
actually work end to end (frontend + backend), not just look right.

Rules:
- Rebuild the .dc.html screens as React components; never ship the .dc.html files.
- One component set for both themes; all colours/fonts/radii from CSS variables in src/styles/themes.css switched by
  <html data-theme>. SOS red is never themed. Deccan decorations render only when theme === 'deccan'.
- Keep existing endpoints working; extend them rather than duplicate. New endpoints exactly as listed in FEATURES.md
  unless you have a better reason (tell me first).
- SOS, emergency numbers and nearby help must work logged-out and offline.
- Add a Prisma migration for each schema change; validate inputs with zod; rate-limit OTP/SOS/test alerts.
- Write a test for every new endpoint (supertest) and run the existing build/lint after each phase.
- Small steps. Show me the plan first and wait for approval.

Produce: folder structure, routing approach, component list, the list of backend changes, required env vars
and third-party accounts (SMS, Google OAuth, email, image upload), and a phase-by-phase build order.
```

## Phases (one message each, after approving the plan)

1. `Phase 1 — foundation: themes.css, Tailwind tokens, ThemeProvider/useTheme/DeccanOnly, fonts, global animation CSS, floating nav, routing for all screens (empty placeholders are fine). Move translations to i18next.`
2. `Phase 2 — backend schema: Prisma migration for everything in FEATURES.md §2, seed data for places (category, hours, fee, weakSignal, nameMr, nearest hospital), and PATCH /api/users/me.`
3. `Phase 3 — Home, Explore (+ search, chips, Filters sheet with real counts, route tickets, + add to plan), Place (save, add to plan). Match classic/ and deccan/ files.`
4. `Phase 4 — Plan (day tabs, tick visited → XP + stamp, Optimise with time saved, Share live trip via the safety service), Map (3 layers), Navigation (OSRM walk/auto).`
5. `Phase 5 — SOS: port countdown, shake detection and haptics from the RoadSoS repo; tel:112; start tracking session; POST /api/sos/alert to contacts with sms: fallback offline; cancel flow. Must work logged-out.`
6. `Phase 6 — Settings: profile edit + avatar upload, contacts CRUD + test alert, medical (encrypted), offline packs with service-worker caching, language, theme (persisted), toggles, sign out, Deccan passport with stamps.`
7. `Phase 7 — Auth & first launch: Splash, Intro, Permissions, Login/SignUp with email + mobile OTP + Google, Forgot password, Almost there, first emergency contact, HomeSetup amber state.`
8. `Phase 8 — QA: go through every row in FEATURES.md §3 and confirm each control works in both themes; list anything missing. Then check accessibility (labels, 44px targets, reduced motion) and Lighthouse PWA.`

After each phase: `Compare each screen you built with its .dc.html file in both themes and list differences, then fix them.`
