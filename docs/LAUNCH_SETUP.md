# Launch setup checklist

Everything Pune Explorer needs from the outside world, in the order to set it up, with a way to
check each piece really works. Updated at the end of every build phase.

**How to use it:** work top to bottom. Each step lists the features that depend on it, the
settings to fill in, and a **Verify** check you can run for real. Tick the box when it passes.
Development defaults (console SMS, public demo servers) keep everything working locally, but
none of them are allowed in production.

_Last updated: Phase 7 (accounts: mobile OTP, Google, password reset)._

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

## 2. What is stored where

| Where | What | Notes |
| --- | --- | --- |
| Postgres | Users, places, plans, stamps, contacts, SOS events, trip shares, help points, avatars, SMS delivery log (masked numbers only), medical profile | Medical free text is AES-256-GCM encrypted. Back up the database **and** `MEDICAL_ENC_KEY` separately |
| Redis | Rate-limit counters (hashed keys), caches, SMS job queue (job contents encrypted), live-tracking sessions and last location (24 h) | Can be wiped safely; it rebuilds. Without it, limits and caches fall back to one server's memory |
| Phone (browser) | Theme, language, settings, last position, a copy of emergency contacts (for SOS with no network), offline packs (IndexedDB), cached app shell and map tiles | No login tokens are stored in browser storage. The refresh token is an httpOnly cookie |

---

## 3. Setup steps

### ☐ 1. Domain and HTTPS
**Needed by:** everything. Browsers only allow location, the camera, the service worker (offline) and secure cookies on HTTPS.
- Get a domain and serve the web app and the Tour API from the **same origin** (the API under `/api`), which is how the refresh cookie works.
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
- If the tile host is not `api.maptiler.com`, add it to `imgSrc` in `services/tour-api/src/app.ts` (Content-Security-Policy).
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
- Check that `apps/web/public/manifest.json` (name, colours, icons 192 and 512) matches your branding.
- **Verify:** on Android Chrome, use "Install app". Open it in aeroplane mode: Home and SOS open, and SOS still offers to call 112.

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

---

## 4. Settings not used yet
`CLOUDINARY_URL` (avatars are stored in Postgres instead), `WEATHER_API_KEY` and `GEMINI_API_KEY` (left over from the old app) can stay empty.

## 5. Notes for your proxy and security headers
- If the safety service runs on a **different domain** from the app, add it to `connectSrc` in `services/tour-api/src/app.ts` (both `https://` and `wss://`) and set `VITE_SAFETY_URL`.
- The Content-Security-Policy already allows Google sign-in (`accounts.google.com/gsi`) and the tile hosts listed in step 7.
