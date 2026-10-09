# CLAUDE.md — Pune Explorer

Pune Explorer = PuneTourGuide (this repo: places, plans, XP) merged with RoadSoS (SOS, live location, nearby hospitals).
Solo project by Sourav. Read these before any task:

1. `design-reference/TECH_DESIGN.md` — architecture, stack, data model, API, auth, how every feature works, build phases. **Source of truth.**
2. `design-reference/FEATURES.md` — what every button/control must do, and which endpoint it uses.
3. `design-reference/README.md` — how to read the `.dc.html` mockups + theme tokens.
4. `design-reference/classic/*.dc.html`, `design-reference/deccan/*.dc.html` — approved UI for each screen (reference only, never ship them).

## Non-negotiable rules
- SOS must work logged-out and offline: the phone dials `tel:112` itself; server calls are best-effort on top.
- One component set, two themes (Classic, Deccan) via CSS variables in `src/styles/themes.css` and `<html data-theme>`.
  Never hard-code a theme colour in a component. SOS red `#C8321C` is never themed.
- Deccan-only decorations render through `<DeccanOnly>`; Marathi strings live in i18n files, not components.
- Tour API layering: route → rateLimit → auth → validate(zod) → controller → service → repository/client. Only repositories touch Prisma.
- Every schema change = a Prisma migration. Raw PostGIS SQL only via tagged `$queryRaw`.
- Validate every input with Zod; rate-limit OTP, SOS alert, test alert, login, password reset.
- Never log tokens, OTP codes or medical data; mask phone numbers.
- Access token in memory, refresh token in httpOnly cookie (web) / secure storage (Capacitor). No tokens in localStorage.
- Keep existing endpoints working; extend rather than duplicate.

## How to work
- One phase from TECH_DESIGN.md §11 per session. Propose a plan first and wait for approval.
- After building a screen, compare it with its `.dc.html` file in both themes and list differences.
- After each phase: run lint, type-check and tests; tick off the FEATURES.md rows that now work.
- SMS and email providers run in console/dev mode unless env keys are set.
