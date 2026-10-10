# Launch setup checklist

Everything Pune Explorer needs from the outside world, in the order to set it up, with a way to
check each piece really works. Updated at the end of every build phase.

**How to use it:** work top to bottom. Each step lists the features that depend on it, the
settings to fill in, and a **Verify** check you can run for real. Tick the box when it passes.
Development defaults (console SMS, public demo servers) keep everything working locally, but
none of them are allowed in production.

_Last updated: Phase 8 (hardening: logs, error reporting, deploy files, Android app). Every build phase is done; what is left is this list and the real data (steps 6, 13, 14)._

---

## 1. Which feature uses what

| Feature | Database (Postgres + PostGIS) | Redis | Other services |
| --- | --- | --- | --- |
| Log in, sign up, sessions | Users, refresh tokens | Rate limits | — |
| Mobile sign-in (OTP) | Users, one-time codes (hashed) | Resend wait, codes per hour, rate limits | **SMS provider** (OTP template); Twilio for “Call me” |
| Sign in with Google | Users | Rate limits | **Google Identity Services** (OAuth client ID) |
| Forgot / reset password | Users, reset links (hashed) | Rate limits | **Email provider** (Resend) |
| Explore, filters, place detail | Places (PostGIS distance), saved places | Places cache, rate limits | — |
| Home weather | — | Weather cache | **Open-Meteo** |
| Explore address search | — | Geocode cache, 1 request/s slot | **Nominatim** (OSM geocoder) |
| Plan, tick → XP + stamp | Itinerary, stamps | — | — |
| Plan → Optimise | Itinerary | Travel-time cache | **OSRM** (car) |
| Map: places / my route | Places, itinerary | Route cache | **Map tiles provider**, **OSRM** |
| Map: help nearby, nearest hospital | Help points (imported from OSM) | Help cache | **Overpass** (nightly import); safety service as fallback |
| Directions (walk / auto) | — | Route cache | **OSRM** (foot + car), **map tiles** |
| SOS: call 112 | — | — | The phone itself (works with no network) |
| SOS: alert contacts | SOS events, contacts, medical (encrypted), SMS log | SMS queue, rate limits | **SMS provider**, **safety service** |
| Live location / tracking page | — | Session + last location, live fan-out | **Safety service** (WebSocket) |
| Share live trip | Trip shares, contacts, SMS log | SMS queue | **SMS provider**, **safety service** |
| Emergency contacts + test alert | Contacts, SMS log | Daily test-alert counter | **SMS provider** |
| Medical info | Medical profile (encrypted with `MEDICAL_ENC_KEY`) | — | — |
| Profile photo | Avatars (WebP bytes) | — | — |
| Offline packs | Places, help points | Pack bundle cache | **Map tiles provider** (only if it allows offline) |
| Works offline (app shell) | — | — | Needs **HTTPS** (service worker) |
| Crash and error reports | — | — | **Sentry** (optional, step 19) |
| Android app | Same as the web app | Same | Google Play (step 23); talks to the same API over HTTPS |

## 2. What is stored where

| Where | What | Notes |
| --- | --- | --- |
| Postgres | Users, places, plans, stamps, contacts, SOS events, trip shares, help points, avatars, SMS delivery log (masked numbers only), medical profile | Medical free text is AES-256-GCM encrypted. Back up the database **and** `MEDICAL_ENC_KEY` separately |
| Redis | Rate-limit counters (hashed keys), caches, SMS job queue (job contents encrypted), live-tracking sessions and last location (24 h) | Can be wiped safely; it rebuilds. Without it, limits and caches fall back to one server's memory |
| Phone (browser) | Theme, language, settings, last position, a copy of emergency contacts (for SOS with no network), offline packs (IndexedDB), cached app shell and map tiles | No login tokens are stored in browser storage. The refresh token is an httpOnly cookie (`SameSite=Lax`); a second cookie, `pe_session=1`, only says "signed in" and holds nothing secret |
| Phone (Android app) | The same, plus the refresh token | The token is encrypted with a key in the Android Keystore. App data is excluded from cloud backups and device transfers |
| Logs (your host) | One JSON line per request: time, request id, method, path, status | Never bodies, query strings, tokens, codes or medical data; phone numbers masked. Keep 14–30 days |

---

## 3. Setup steps

### ☐ 1. Domain and HTTPS
**Needed by:** everything. Browsers only allow location, the camera, the service worker (offline) and secure cookies on HTTPS.
- Get a domain and serve the web app and the Tour API from the **same origin** (the API under `/api`), which is how the refresh cookie works. The production image does exactly this; step 20 has two ready-made ways to host it.
- Settings (Tour API): `APP_URL=https://your-domain`, `CORS_ORIGINS=https://your-domain`, `NODE_ENV=production`.
- **Verify:** open the site on a phone. The browser shows a padlock, the location prompt appears on Home, and logging in survives a reload.

### ☐ 2. PostgreSQL with PostGIS
**Needed by:** all data. Use a managed Postgres that supports the PostGIS extension (for example Neon, Supabase, AWS RDS, or Render Postgres).
- Settings: `DATABASE_URL=postgresql://…?schema=public&connection_limit=10&pool_timeout=10`. Keep instances × `connection_limit` under the server's maximum connections, or use PgBouncer (`&pgbouncer=true`).
- Run `npm run prisma:deploy`. This applies every migration, including the PostGIS indexes and triggers.
- **Verify:** `GET https://your-domain/api/v1/health/ready` returns `"db": true`.

### ☐ 3. Redis
**Needed by:** shared rate limits, caches, the SMS queue, live tracking across servers. Required as soon as you run more than one API or safety instance. Managed options include Upstash and Redis Cloud.
- Settings: `REDIS_URL` on **both** the Tour API and the safety service (the same Redis).
- **Verify:** `/api/v1/health/ready` returns `"redis": true`. Then log in with a wrong password 6 times: the 6th attempt returns "Too many attempts", even when retried against a second instance.

### ☐ 4. Secrets
**Needed by:** logins (`JWT_SECRET`) and medical info (`MEDICAL_ENC_KEY`). In production the API refuses to start without them.
- Generate:
  - `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
  - `MEDICAL_ENC_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- ⚠️ Store `MEDICAL_ENC_KEY` in a password manager or secrets vault. **Losing it makes every saved medical profile unreadable.** Never change it without a migration plan.
- **Verify:** the API starts with `NODE_ENV=production`. Save medical info in the app, reload, and it reads back. In the database, `MedicalProfile.allergiesEnc` is unreadable text.

### ☐ 5. Safety service (live tracking, help fallback)
**Needed by:** SOS live location, the tracking page contacts open, Share live trip, and Help nearby outside the imported area. This is the RoadSoS FastAPI app in `services/safety` (Dockerfile and `render.yaml` included).
- Settings (safety): `REDIS_URL`, `ALLOWED_ORIGINS=https://your-domain`, and optionally `OVERPASS_ENDPOINTS`.
- Settings (web build): `VITE_SAFETY_URL=https://safety.your-domain`, or serve it under `/safety` on the same domain through your proxy, with WebSocket upgrade enabled for `/safety/ws/`.
- **Verify:**
  - `GET /safety/health` returns `healthy`.
  - Start an SOS on phone A (as a test you can cancel; see step 9). Open the tracking link on phone B: the blue dot moves as phone A moves.
  - Tap "I'm safe" on phone A: phone B shows "Sharing has ended".

### ☐ 6. Help points (hospitals, police, fire) from OpenStreetMap
**Needed by:** Help nearby, each place's nearest hospital, the SOS "nearest trauma care" line, and offline packs.
- Run `npm run refresh:help` once after deploy, then **nightly** (a Render cron job, a GitHub Actions schedule, or system cron). If the download is broken or partial, the existing data is kept.
- The public Overpass servers are shared and often slow. For reliability, set `OVERPASS_ENDPOINTS` to a paid or self-hosted Overpass instance; the variable is read by both the import and the safety service.
- **Verify:**
  - The command prints about 1,300+ points, including roughly 650+ hospitals.
  - `GET /api/v1/help?near=18.5195,73.8553` lists real hospitals, emergency ones first.
  - Spot-check 3 hospitals and their phone numbers against Google Maps or a phone call.

### ☐ 7. Map tiles provider
**Needed by:** Map, Directions, the tracking page, and offline packs (for map tiles).
- The development default is the OpenStreetMap public tile server, which **forbids app traffic and bulk downloading**. Sign up with a provider, for example **MapTiler** or **Stadia Maps**, which have free tiers.
- Settings (web build):
  - `VITE_MAP_TILE_URL=https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=YOUR_KEY`
  - `VITE_MAP_TILE_ATTRIBUTION` with the HTML the provider requires.
  - `VITE_MAP_TILES_OFFLINE=true` **only if** the provider's terms allow offline caching.
- Settings (Tour API): `MAP_TILE_ORIGINS` = the tile host(s), comma-separated, e.g. `https://api.maptiler.com`. The browser refuses tiles from any host not listed (Content-Security-Policy).
- **Verify:**
  - The Map shows tiles with the provider's attribution at the top right.
  - On the Offline packs screen, download "Old Pune peths". With offline tiles enabled the pack no longer says "no map tiles".
  - Then switch on aeroplane mode: the old-Pune map still draws.

### ☐ 8. Routing (OSRM)
**Needed by:** Directions (walk and auto), Optimise, and My route on the Map.
- The defaults are **public demo servers**: `router.project-osrm.org` for car and `routing.openstreetmap.de` for foot. They're for testing only.
- For production, either self-host OSRM with the western-India (`india-latest` or Maharashtra) extract, or use an OSRM-compatible provider.
- Settings (Tour API): `OSRM_URL` (car), `OSRM_FOOT_URL` (walking).
- **Verify:**
  - Directions from Shaniwar Wada to Dagdusheth show a sensible route and ETA in both Walk and Auto.
  - Optimise on a day with a far fort says "saves about N min".
  - If routing is down, Optimise still works and shows "(estimate)".

### ☐ 9. SMS provider
**Needed by:** SOS alerts to contacts, "I'm safe", Share live trip, and the contacts test alert (and OTP in Phase 7). **Without it, SOS alerts are only printed to the server log.**
- **India (MSG91):** DLT registration is required by law and takes several days. Register your entity and a sender ID, then get one template approved per message type:
  - Login code / OTP (variable: otp). Keep the last line `@your-domain #code` so Android can fill the code in automatically
  - SOS alert (variables: name, link, map, hospital, medical)
  - I'm safe (name, time)
  - Trip link (name, link)
  - Test alert (name)

  The exact message texts are in `services/tour-api/src/v1/notify/messages.ts`.
  - Settings: `SMS_PROVIDER=msg91`, `SMS_API_KEY=<authkey>`, `MSG91_TEMPLATE_OTP`, `MSG91_TEMPLATE_SOS`, `MSG91_TEMPLATE_SAFE`, `MSG91_TEMPLATE_TRIP`, `MSG91_TEMPLATE_TEST`.
- **“Call me” (voice code)** works with Twilio only. With MSG91 the app sends the SMS again and says so.
- **International or testing (Twilio):** `SMS_PROVIDER=twilio`, `SMS_API_KEY=AccountSid:AuthToken`, `SMS_SENDER_ID=+1…`.
- **Verify:**
  - Log in → Mobile with your own number: the code arrives within seconds and Android offers to fill it in.
  - Settings → Emergency contacts → Send a test alert: your contact's phone receives the TEST message, and the `SmsMessage` table shows `sent`.
  - Then do one real SOS drill with a friend who knows it is a drill (you can hang up the 112 call before it connects): they receive the alert with the live link and the hospital line; tap "I'm safe" and they receive the follow-up.

### ☐ 10. Background worker (when you scale)
**Needed by:** SMS delivery. By default each API server also runs the worker.
- At scale, run `npm run worker -w services/tour-api` (build: `node dist/worker.js`) as its own service and set `RUN_WORKERS=false` on the API servers.
- **Verify:** stop the API worker, send a test alert, and confirm it arrives through the dedicated worker.

### ☐ 11. Weather (Open-Meteo)
**Needed by:** the Home header temperature.
- No key is needed, but Open-Meteo's free API is for **non-commercial use**. If the app earns money, buy their commercial plan (or switch provider in `services/tour-api/src/clients/weather.ts`).
- **Verify:** Home shows today's Pune temperature, matching a weather site to within about 2°.

### ☐ 12. Address search (Nominatim)
**Needed by:** Explore and Map search when the text is not a known place.
- The public Nominatim server allows at most 1 request a second for the whole app (enforced through Redis) and requires a real User-Agent, which is set in `clients/nominatim.ts`; update the contact URL there. For heavy use, switch to a provider such as LocationIQ or MapTiler geocoding.
- **Verify:** search "FC Road" on the Map: it moves to FC Road.

### ☐ 13. Verify the place data
**Needed by:** Explore, Place, Plan and routes. The 26 curated places in `services/tour-api/src/seed/catalogue.ts` are real, but their **opening hours, entry fees, visit times and coordinates were typed in and must be checked** before launch: visit, phone, or use official sites.
- Hospitals no longer come from this file (step 6 replaces them).
- **Verify:** for each place, the hours and fee shown on the Place screen match the official source, and its pin sits on the real entrance.

### ☐ 14. Translations
**Needed by:** the language setting. The SOS screen is translated into Marathi, Hindi and Gujarati in `apps/web/src/i18n/locales/*.json`. **Have a native speaker review each one**, since these are emergency instructions. The rest of the app is English for now.
- **Verify:** Settings → Language → मराठी, then open SOS: a Marathi speaker confirms every line reads naturally and correctly.

### ☐ 15. App install (PWA)
**Needed by:** "Add to Home screen" and opening offline.
- Icons are generated from `apps/web/art/icon-source.png` by `npm run icons` (normal, maskable, Apple and Android sizes). Replace that file and rerun it if the logo changes.
- **Verify:**
  - On Android Chrome, use "Install app": the home-screen icon is the fort tile with no grey corners.
  - Long-press the icon: an **SOS** shortcut appears and opens the SOS screen.
  - Open it in aeroplane mode: Home and SOS open, and SOS still offers to call 112.

---

### ☐ 16. Email provider (password reset)
**Needed by:** Forgot password. Without it, reset emails are only noted in the server log (recipient and subject, never the link).
- Create a [Resend](https://resend.com) account, verify your sending domain (it gives you SPF and DKIM DNS records to add), and create an API key.
- Settings (Tour API): `EMAIL_API_KEY`, `EMAIL_FROM="Pune Explorer <no-reply@your-domain>"`.
- **Verify:** Log in → Forgot? → your email → the email arrives (check that it isn't in spam). The link opens `/reset`, you set a new password, other phones are signed out, and the old link no longer works.

### ☐ 17. Sign in with Google
**Needed by:** the "Continue with Google" buttons on Log in and Sign up. Without it, the button explains that Google sign-in isn't set up.
- In Google Cloud Console → APIs & Services → Credentials, create an **OAuth client ID** of type *Web application*. Add `https://your-domain` (and `http://localhost:5050` for development) to **Authorised JavaScript origins**. Fill in the OAuth consent screen (app name, privacy policy URL).
- Settings: `GOOGLE_CLIENT_ID` (Tour API) and `VITE_GOOGLE_CLIENT_ID` (web build), both set to the same client ID.
- **Verify:**
  - Tap Continue with Google: Google's account chooser opens, and a new account lands on "Add your first contact".
  - Doing it again logs straight in.
  - If you already had an email account with the same Gmail address, it is linked rather than duplicated.

### ☐ 18. Terms and privacy policy pages
**Needed by:** sign-up consent. Accounts store when the terms were accepted (`termsAcceptedAt`). Publish real Terms and Privacy Policy pages (India's DPDP Act: say what you collect, especially location, contacts and medical info, and why) and point the "Terms" links in the sign-up views at them.
- **Verify:** every "Terms" link on Sign up, Almost there and Google sign-in opens the published pages.

### ☐ 19. Error reporting (Sentry)
**Needed by:** finding out about crashes before users tell you. Optional, and free for a small app.
- Create a [Sentry](https://sentry.io) organisation with two projects: one *Node* (Tour API and worker), one *Browser JavaScript* (web app). The safety service can share the Node one or have a *Python* project.
- Settings: `SENTRY_DSN` (Tour API, worker, safety service), `VITE_SENTRY_DSN` (web build), optionally `SENTRY_ENVIRONMENT`. `RELEASE` (compose) or Render's commit id tags each report with the version.
- What is sent: the error, stack and screen or route. Bodies, headers, cookies, query strings, IP addresses, user details and breadcrumbs are stripped before sending, so tokens, codes, phone numbers and medical data never reach Sentry.
- **Verify:** stop the database for a moment and load Explore.
  - One "unhandled error" event appears in Sentry, showing the route but no request data.
  - The user sees "Something went wrong", and the response's `X-Request-Id` matches the log line.

### ☐ 20. Deploy
Pick **one** of these. Both serve the app and API from one domain and keep SOS working if the API is down.

**A. One server with Docker (VPS, e.g. DigitalOcean, Hetzner, AWS Lightsail; 2 GB RAM or more)**
1. Point your domain's DNS `A` record at the server and install Docker.
2. `cp deploy/.env.production.example deploy/.env.production` and fill it in. Every line names its step here.
3. `docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build`
4. Caddy fetches the HTTPS certificate by itself. The app, a separate SMS worker, the safety service (under `/safety`), Redis (password-protected, persistent) and Postgres + PostGIS all start. Migrations run automatically.
5. Nightly help import (step 6): add a cron line on the server:
   `30 21 * * * cd /path/to/repo && docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production run --rm refresh-help`
6. More traffic: `... up -d --scale app=3`. Caddy spreads requests, and Redis keeps rate limits and live tracking shared.
7. Backups: use a managed Postgres, or schedule `pg_dump` off the server. Keep `MEDICAL_ENC_KEY` separately (step 4).

**B. Render (managed; what TECH_DESIGN suggests)**
1. Render → New → Blueprint → this repository. `render.yaml` creates the app, the safety service, Redis, Postgres and the nightly import job.
2. Fill in the values it asks for. The safety service gets its own address, so set:
   - `VITE_SAFETY_URL` and `SAFETY_PUBLIC_URL` to `https://<safety>.onrender.com`,
   - `ALLOWED_ORIGINS` on the safety service to the app's URL.
3. Add your domain in the app service's settings and set `APP_URL` / `CORS_ORIGINS` to it.
4. Use paid instances: free ones sleep, and an SOS alert must never wait for a cold start.

- **Verify (either way):**
  - `https://your-domain/api/v1/health/ready` returns `{"status":"ready","db":true,"redis":true}`.
  - `curl -I https://your-domain/` shows `Strict-Transport-Security`, `Content-Security-Policy` and `X-Request-Id`.
  - Open the site on a phone, sign up, reload: still signed in.
  - The browser console shows no "Content Security Policy" errors on Home, Map and Log in.

### ☐ 21. Logs and uptime
- Logs are JSON on standard output: your host's log viewer (Render Logs, `docker compose logs app`) is enough to start. Search by `reqId` to follow one request. Set `LOG_LEVEL=info` (or `warn` to reduce volume).
- Add a free uptime monitor (UptimeRobot, Better Stack) on `https://your-domain/api/v1/health/ready` and `https://your-domain/safety/health`, alerting your phone.
- Lines to set alerts on: `"No SMS provider configured"`, `"sms queue unavailable"`, `"Redis unavailable"`, and any `"level":50` (error) spike.
- **Verify:** stop the safety service for two minutes: the uptime monitor alerts you, and SOS in the app still dials 112.

### ☐ 22. Load test before launch
- Run against **staging**, never production: production limits each IP to 600 API calls a minute, so a single test machine mostly measures the limiter.
  `BASE=https://staging.your-domain CONNECTIONS=100 DURATION=60 npm run load-test`
- It hits Explore near me, place detail, Help nearby and the health check, with locations spread around Pune, and fails if p97.5 latency goes over 500 ms or any request errors.
- Reference: one API instance on a laptop handled about 600 Explore requests a second at p97.5 = 176 ms (50 connections), and about 2,300 a second for Help nearby. Use your staging numbers to choose the instance size and count.
- **Verify:** the script prints `PASS` and the server logs show no errors during the run.

### ☐ 23. Android app (Google Play)
**Needed by:** people who prefer an installed app. It is the same web build inside Capacitor (`apps/web/android`), with the login token in the Android Keystore.
1. Install Android Studio (it brings the SDK and Java), then `cp apps/web/.env.android.example apps/web/.env.android` and set your HTTPS domain in it.
2. Allow the app's origin: add `https://localhost` to `CORS_ORIGINS` (Tour API) and to `ALLOWED_ORIGINS` (safety service).
3. Test build: `npm run android:apk -w apps/web` → `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`. Install it on a phone.
4. Release:
   - Create an upload key once (command in `apps/web/android/keystore.properties.example`) and back up the `.jks` file and its passwords: every Play update needs them.
   - Then run `npm run android:release -w apps/web` to produce `app-release.aab`.
   - Upload it in the Play Console. That requires a developer account (one-time fee) and a privacy policy URL (step 18).
   - Declare location use in the Data safety form.
5. Before the first upload, decide the package name in `apps/web/capacitor.config.ts` and `android/app/build.gradle` (now `com.puneexplorer.app`). **It can never change afterwards.**
6. Not in the app yet: Google sign-in. Google blocks its web sign-in inside apps, so the app offers email and mobile, and `VITE_GOOGLE_CLIENT_ID` stays empty in `.env.android`. Adding it needs a native Google sign-in plugin.
- **Verify** (all were checked on an Android 14 emulator against a local production build):
  - Log in, close the app completely, reopen: still signed in.
  - Profile → Sign out → reopen: signed out.
  - Hardware back walks back through screens.
  - SOS → after the countdown the dialer opens with 112.
  - Allow location: Home and Help nearby use the phone's position.

---

## 4. Settings not used yet
`CLOUDINARY_URL` (avatars are stored in Postgres instead), `WEATHER_API_KEY` and `GEMINI_API_KEY` (left over from the old app) can stay empty.

## 5. Notes for your proxy and security headers
- If the safety service runs on a **different domain** from the app, set `SAFETY_PUBLIC_URL` (Tour API, for the Content-Security-Policy) and `VITE_SAFETY_URL` (web build) to its address. It must support WebSockets.
- The Content-Security-Policy allows Google sign-in (`accounts.google.com/gsi`), Sentry, and the tile hosts in `MAP_TILE_ORIGINS` (step 7). The one inline script (theme before first paint) is allowed by its hash, computed from the build at start-up, so no `unsafe-inline` is needed for scripts.
- Caching: files under `/assets/` are cached for a year (their names change every build); `index.html`, `sw.js` and `manifest.json` are re-checked on every visit, so a deploy reaches phones on their next open. A CDN in front must keep these headers.
- Your proxy must pass `X-Forwarded-For` (exactly one proxy hop is trusted) and may pass `X-Request-Id`; the API reuses it in its logs.
- Cookies are `SameSite=Lax`. Only if the web app and API end up on **different sites** set `COOKIE_SAMESITE=none` and list the web origin in `CORS_ORIGINS`.
- Fonts are served by the app itself (no Google Fonts), so nothing extra is needed for them.
