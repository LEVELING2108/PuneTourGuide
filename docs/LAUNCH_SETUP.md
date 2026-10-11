# Launch setup checklist

Everything Pune Explorer needs from the outside world, in the order to set it up, with a way to
check each piece really works. Updated at the end of every build phase.

**How to use it:** work top to bottom. Each step lists the features that depend on it, the
settings to fill in, and a **Verify** check you can run for real. Tick the box when it passes.
Development defaults (console SMS, public demo servers) keep everything working locally, but
none of them are allowed in production.

_Last updated: after Phase 8. Every build phase is done. Section 0 is the free student route through this list; sections 1–5 are the full reference._

---

## 0. Free student setup, step by step

The ₹0 route for a student without a credit card. Do the parts in order; each one ends with a check. Where it says **send me**, paste the value in our chat. Secret keys (passwords, API keys, tokens) go only into the server file in Part 5, never into the chat.

| Piece | Service | Cost |
| --- | --- | --- |
| Domain | Name.com `.app` / `.dev` (GitHub Student Pack) | free, 1 year |
| Server (app, safety service, Redis, HTTPS) | Azure for Students, B1s Linux server | free 12 months |
| Database (PostgreSQL + PostGIS) | Azure Database for PostgreSQL, B1ms | free 12 months |
| Building and deploying | GitHub Actions + GitHub Container Registry | free (public repository) |
| Crash reports | Sentry (Student Pack) | free |
| Map tiles | MapTiler free plan | free (non-commercial) |
| Email | Resend free plan | free (3,000 / month) |
| Google sign-in | Google Cloud | free |
| SMS | Twilio trial | free credit |

**Part 1: accounts that take time to approve (do these first)**
1. **GitHub Student Developer Pack:** <https://education.github.com/pack> → *Get student benefits*. Sign in with GitHub, add your college email, and upload your college ID card. Approval takes from a few hours to a few days.
2. **Azure for Students:** <https://azure.microsoft.com/free/students> → *Start free*. Sign in with your **college email**. No card is needed. You get $100 of credit and the free services for 12 months.
3. **Twilio:** <https://www.twilio.com/try-twilio>. Sign up, verify your own mobile number, then:
   - Under *Phone Numbers → Verified Caller IDs*, also verify the phone of each person you'll test SOS with. A trial account can only text verified numbers.
   - Get a trial number from the console.
- **Check:** you can log in to the Azure portal (<https://portal.azure.com>) and see "Azure for Students" under Subscriptions.

**Part 2: once the Student Pack is approved**
1. **Domain:** on the Student Pack page, open **Name.com** → claim the free domain, and pick a `.app` or `.dev` name (e.g. `puneexplorer.app`). **Send me** the name.
2. **Sentry:** on the Student Pack page, open **Sentry** and activate the student plan. Create two projects: *Node.js* (call it `pune-explorer-api`) and *Browser JavaScript* (`pune-explorer-web`). **Send me** the two DSN links. They aren't secret: one ends up in the website's code anyway.

**Part 3: the server and the database (Azure portal)**
1. **Create the server:** *Virtual machines → Create → Azure virtual machine*.
   - Subscription *Azure for Students*, region **Central India**, image **Ubuntu Server 24.04 LTS**.
   - Size **Standard_B1s**. It's marked "free services eligible".
   - Authentication: *SSH public key*, username `azureuser`. Download the `.pem` key when asked and keep it safe.
   - Inbound ports: allow **SSH (22), HTTP (80), HTTPS (443)**.
   - Disk: *Standard SSD*. Then Create.
2. **Fix the public IP:** open the server → *Networking / IP configuration* → set the public IP to **Static**, so it never changes. **Send me** the public IP address.
3. **Create the database:** *Azure Database for PostgreSQL flexible server → Create*.
   - Region Central India, PostgreSQL **16**, workload **Development**, compute **Burstable B1ms**, storage **32 GB**. That's the free tier.
   - Admin username `pune`, and a strong password that you save in your password manager.
   - Networking: *Public access*. Add the server's public IP as a firewall rule.
   - Then Create; it takes about 10 minutes.
4. **Prepare the database:**
   - Open it → *Server parameters* → search `azure.extensions` → tick **POSTGIS** → Save. The app needs the PostGIS map extension.
   - Then *Databases → Add* → name it `pune_explorer`.
- **Check:** both resources show "Running" / "Available" in the portal.

**Part 4: DNS and the first build (me, with you)**
1. At Name.com → your domain → *Manage DNS records*, add two `A` records pointing at the server's IP: `@` and `www`.
2. The work happens on the **`research`** branch: every change goes in through a pull request into `research`, and `research` is merged into `main` when the work is complete. Each push to `research` makes GitHub Actions build the app images tagged `research`, and `main` builds `latest`. Watch them under the repository's *Actions* tab.
3. Make the images downloadable: GitHub → your profile → *Packages* → `pune-explorer-app` → *Package settings* → *Change visibility* → **Public**. Do the same for `pune-explorer-safety`.
- **Check:** <https://dnschecker.org> shows your domain pointing at the server IP.

**Part 5: set up the server (about 10 minutes)**
1. Connect from this computer, in PowerShell: `ssh -i C:\path\to\your-key.pem azureuser@SERVER_IP`
2. On the server, run the commands below, using your own domain and email. The script installs Docker, adds swap memory, turns on the firewall and automatic security updates, and creates `/opt/pune-explorer/.env.production` with new random secrets.
   ```
   curl -fsSL https://raw.githubusercontent.com/LEVELING2108/PuneTourGuide/research/deploy/server-setup.sh -o setup.sh
   BRANCH=research bash setup.sh puneexplorer.app you@example.com
   ```
3. **Back up the medical-data key:** run `grep MEDICAL_ENC_KEY /opt/pune-explorer/.env.production` and copy the value into your password manager. Without it, saved medical info can never be read again.
4. **Connect the database:** `nano /opt/pune-explorer/.env.production`, set the line below, then save with Ctrl+O, Enter, Ctrl+X. If your password has symbols like `@ # % /`, write them as `%40 %23 %25 %2F`.
   `DATABASE_URL=postgresql://pune:YOUR_DB_PASSWORD@YOUR-DB-NAME.postgres.database.azure.com:5432/pune_explorer?schema=public&sslmode=require&connection_limit=5`
5. Log out (`exit`), log back in, then start everything and load the real data:
   ```
   cd /opt/pune-explorer
   docker compose --env-file .env.production pull
   docker compose --env-file .env.production up -d
   docker compose --env-file .env.production run --rm app node dist/seed.js --force
   docker compose --env-file .env.production --profile jobs run --rm refresh-help
   ```
- **Check:** `https://your-domain/api/v1/health/ready` shows `"ready"`, and `https://your-domain` opens the app on your phone with a padlock.

**Part 6: switch on each service.** Edit `/opt/pune-explorer/.env.production` for the secret ones, then run `docker compose --env-file .env.production up -d` to apply. The **GitHub Variables** (repository *Settings → Secrets and variables → Actions → Variables*) are public values that get baked into the website. After changing any of them, re-run the *Release* workflow (*Actions → Release → Run workflow*).

| Service | What to do | Server file (.env.production) | GitHub Variable |
| --- | --- | --- | --- |
| Map tiles (MapTiler) | Sign up at <https://cloud.maptiler.com> → *API keys* → *New key*. Under allowed HTTP origins, use bare names without `https://` or a port: `puneexplorer.dev` and `localhost` | `MAP_TILE_ORIGINS=https://api.maptiler.com` | `VITE_MAP_TILE_URL=https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}{r}.png?key=YOUR_KEY` (`{r}` gives sharp tiles on phone screens) and `VITE_MAP_TILE_ATTRIBUTION=<a href="https://www.maptiler.com/copyright/">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>` |
| Crash reports (Sentry) | the DSNs from Part 2 | `SENTRY_DSN=` (the Node one) | `VITE_SENTRY_DSN=` (the Browser one) |
| SMS (Twilio) | Console → *Account info* | `SMS_PROVIDER=twilio`, `SMS_API_KEY=ACxxxx:your_auth_token`, `SMS_SENDER_ID=+1your_twilio_number` | — |
| Email (Resend) | Sign up at <https://resend.com> → *Domains → Add* your domain → add the DNS records it shows at Name.com → *API Keys → Create* | `EMAIL_API_KEY=re_...`, `EMAIL_FROM=Pune Explorer <no-reply@your-domain>` | — |
| Google sign-in | <https://console.cloud.google.com> → new project → *OAuth consent screen* (External; app name, your email, privacy URL `https://your-domain/privacy`) → *Credentials → Create OAuth client ID → Web application* → Authorised JavaScript origins `https://your-domain` | `GOOGLE_CLIENT_ID=...apps.googleusercontent.com` | `VITE_GOOGLE_CLIENT_ID=` (same value) |
| Privacy contact | an email you read, for data requests (DPDP Act) | — | `VITE_CONTACT_EMAIL=you@...` |

- **Twilio and India:** a trial texts only the numbers you verified, which is fine for a demo. For the public, Indian carriers require DLT registration (step 9). Plan to move to MSG91 then; only the settings change.
- **Check each one** using the **Verify** line of its step below: 7 (map), 19 (Sentry), 9 (SMS), 16 (email), 17 (Google), 18 (Terms and Privacy).

**Part 7: automatic deploys and monitoring**
1. **Automatic deploys:** in GitHub → *Settings → Secrets and variables → Actions*:
   - **Secrets:** `DEPLOY_HOST` (server IP), `DEPLOY_USER` (`azureuser`), `DEPLOY_SSH_KEY` (the whole text of your `.pem` file).
   - **Variable:** `DEPLOY_ENABLED=true`.
   - From then on, every merge into `research` (and later `main`) updates the server by itself.
2. **Uptime alerts:** a free [UptimeRobot](https://uptimerobot.com) monitor on `https://your-domain/api/v1/health/ready`, alerting your email or phone (step 21).
- **Check:** push any small change; within about 10 minutes the *Release* run is green and the site shows it.

**After the free year:** Azure for Students renews each year while you're a student. Otherwise, move the same setup to any server with Docker (step 20 A). The domain renewal costs about ₹1,000–1,500 a year.

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
**Needed by:** Explore, Place, Plan and routes. The 26 curated places live in `services/tour-api/src/seed/catalogue.ts`. In production, load them with `node dist/seed.js --force` (Part 5).
- **Pins:** checked on 2026-10-11 against OpenStreetMap with `npm run check:places -w services/tour-api`. 25 of 26 are confirmed, and 7 were corrected (Empress Garden, Goodluck Cafe, Mahatma Phule Museum, Vetal Tekdi, Pashan Lake, Vishrambaug Wada, Vaishali). **Bedekar Misal** is not in OpenStreetMap: confirm its pin on the spot.
- **Hours:** filled in from current public listings where they were blank. Where sources disagree, or a place has a weekly closed day or a lunch break, only the text is shown, and the app doesn't claim "open now".
- **Still to confirm at the counter or by phone** (public sources disagree):
  - Shaniwar Wada fee: ₹25 in the app; some sources say ₹5 for Indians.
  - Aga Khan Palace fee: ₹25 in the app; it may now be ₹20 online.
  - Lal Mahal: fee and its 1–4 PM break.
  - Bedekar Misal: hours and closed day.
  - Lohagad: entry fee.
- **Verify:** for each place, the hours and fee on the Place screen match the official source, and its pin sits on the real entrance.

### ☐ 14. Translations
**Needed by:** the language setting. The SOS screen and the crash screen are translated into Marathi, Hindi and Gujarati in `apps/web/src/i18n/locales/*.json`. They were reviewed on 2026-10-11, and "emergency" was changed from आणीबाणी / आपातकाल, which mean the political Emergency, to आपत्कालीन स्थिती / आपात स्थिति. **A native speaker should still read each one**, since these are emergency instructions. The rest of the app is English for now.
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

### ☐ 18. Terms, privacy policy and account deletion
**Needed by:** sign-up consent (accounts store `termsAcceptedAt`), India's DPDP Act, Google sign-in's consent screen and the Play Store.
- **Pages:** the app has `/terms` and `/privacy`, linked from Sign up and Almost there. The text in `apps/web/src/content/legal.ts` describes exactly what the app collects, who it is shared with and how long it's kept. Have it reviewed by someone qualified before a public launch, and update `LAST_UPDATED` whenever it changes.
- **Contact:** set `VITE_CONTACT_EMAIL` (GitHub Variable) to the address that handles data requests.
- **Account deletion:** in Settings → Sign out → *Delete my account*, typing DELETE erases the account, contacts, medical info, plans, photo, sessions and SOS records (`DELETE /api/v1/users/me`). Use `https://your-domain/settings/delete-account` as the deletion link in the Play Console.
- **Verify:**
  - `https://your-domain/privacy` shows your contact email.
  - Delete a test account: you can't log in with it again, and its contacts are gone from the phone.

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
2. `deploy/server-setup.sh` prepares the server, as in section 0 Part 5. Or copy `deploy/.env.production.example` to `.env.production` and fill it in; every line names its step here.
3. Ready-made images: `docker compose --env-file .env.production pull && docker compose --env-file .env.production up -d`. To build on the server instead (2 GB+ RAM, whole repository): `docker compose -f deploy/docker-compose.prod.yml -f deploy/docker-compose.build.yml --env-file deploy/.env.production up -d --build`.
4. Caddy fetches the HTTPS certificate by itself. The app, the safety service (under `/safety`) and Redis (password-protected, persistent) start, and migrations run automatically. `COMPOSE_PROFILES=db` adds Postgres + PostGIS on the server; `worker` adds a separate SMS worker (then set `RUN_WORKERS=false`).
5. Nightly help import (step 6): add a cron line on the server:
   `30 21 * * * cd /opt/pune-explorer && docker compose --env-file .env.production --profile jobs run --rm refresh-help` (`server-setup.sh` adds it for you)
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
