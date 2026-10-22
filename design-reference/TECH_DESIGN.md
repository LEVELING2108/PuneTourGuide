# Pune Explorer — End-to-End Technical Design

Oct 10, 2026 · @Sourav suman

## 1. Overview

Pune Explorer is one mobile-first app that combines **PuneTourGuide** (discover places, plan days, earn XP) with **RoadSoS** (emergency help, live location, nearby hospitals). The idea in one line: *a travel guide for Pune where help is always one tap or one shake away, even offline.*

This document is the build blueprint for a **solo developer**. It covers the full stack, how every feature works end to end, and the order to build it in. The approved UI lives in `design-reference/` (Classic and Deccan themes); the per-button behaviour lives in `design-reference/FEATURES.md`.

### What ships in the MVP

| Area | Features |
| --- | --- |
| Discover | Home, Explore with search, categories, filters, curated routes; Place detail with save, nearest hospital |
| Plan | Day plans, add/remove stops, tick visited, Optimise order, XP and stamps |
| Map | Places layer, My route layer, Help nearby layer, turn-by-turn directions |
| Safety | SOS (button + shake, 5-second countdown, call 112), alerts to emergency contacts, live trip sharing, offline packs |
| Account | Email, mobile OTP and Google sign-in; forgot password; emergency contacts; medical info; language; theme |
| First launch | Splash, intro slides, safety permissions, first emergency contact |
| Look | Two themes (Classic, Deccan), shared components, motion with reduced-motion support |

### Ground rules

- **SOS never depends on the server.** The phone dials 112 itself; everything else is best-effort on top.
- **One codebase, two themes.** Themes change colours and fonts only, never behaviour.
- **Reuse before rewrite.** Keep PuneTourGuide's Express API and RoadSoS's FastAPI service; extend them.
- **Free tiers first.** Every hosted service below has a free or student tier good enough for the MVP and a demo.

### Out of scope for now

Payments, reviews and ratings, social features, admin dashboard UI (use Prisma Studio), native iOS build.

## 2. Tech stack

Everything below is chosen so one person can build, run and demo it on free tiers. Items marked **(have)** already exist in your two repos.

### Frontend (the app)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | React 19 + Vite **(have, upgrade from 18)** | Fast dev server; RoadSoS is already on 19 |
| Language | JavaScript now, new files in TypeScript | Gradual migration; Vite handles both |
| Styling | Tailwind CSS **(have)** + CSS variables for themes | Theme switch = swap variables |
| Routing | React Router 7 | Real URLs for screens, back button, deep links |
| Server data | TanStack Query (React Query) | Caching, retries, loading states, offline-friendly |
| UI state | Zustand | Tiny store for theme, auth, SOS state, permissions |
| Forms | React Hook Form + Zod | Same Zod schemas as the backend |
| i18n | i18next + react-i18next (RoadSoS has 22 locales) | Replace the custom `translations.js` |
| Maps | Leaflet + react-leaflet **(have)** | See section 3 |
| PWA | vite-plugin-pwa + Workbox | Offline packs, cached SOS data |
| Android | Capacitor **(RoadSoS has it)** | Store build, contacts picker, haptics, background-friendly |
| Motion | CSS keyframes from the designs; Framer Motion only where needed | Lightweight |

### Backend — Tour API

| Layer | Choice | Why |
| --- | --- | --- |
| Runtime | Node.js 20 + Express 5 + TypeScript **(have)** | Existing code |
| ORM | Prisma **(have)** + raw SQL for PostGIS | Type-safe models, migrations |
| Validation | Zod | One schema per endpoint, shared with frontend |
| Auth | jsonwebtoken + bcryptjs **(have)**, google-auth-library | Access + refresh tokens, Google sign-in |
| Jobs | BullMQ on Redis | SOS SMS retries, OTP sending off the request path |
| Security | helmet, cors, express-rate-limit **(have)** + rate-limit-redis | Shared limits across instances |
| Logs | pino | Structured, fast |
| Docs | zod-to-openapi + Swagger UI | API reference for free |

### Backend — Safety service

| Layer | Choice | Why |
| --- | --- | --- |
| Runtime | Python 3.12 + FastAPI + Uvicorn **(have)** | RoadSoS code: emergency services, tracking |
| Realtime | WebSockets + Redis pub/sub **(have)** | Live location streams |
| Data | Overpass API with mirror failover **(have)** | Hospitals, police, pharmacies |
| Limits | SlowAPI **(have)** | Abuse protection without login |

### Data and infrastructure

| Need | Choice | Notes |
| --- | --- | --- |
| Database | PostgreSQL 16 + PostGIS **(have)** | In Docker on the server (`COMPOSE_PROFILES=db`); a managed PostGIS works too |
| Cache, queues, pub/sub | Redis **(have)** | In Docker on the server |
| Hosting | Google Cloud VM (Mumbai, e2-medium) + Docker Compose | Caddy (HTTPS) serves the web app and API from one domain; `deploy/` |
| Local dev | Docker Compose **(have)** | Postgres+PostGIS, Redis, both APIs |
| CI/CD | GitHub Actions + GitHub Container Registry | Lint, test, build images, deploy to the server |
| Errors | Sentry (free tier) | Frontend + both backends |

### Third-party services

| Purpose | Choice | Fallback |
| --- | --- | --- |
| SMS (OTP, SOS alerts) | MSG91 or Twilio | Firebase Phone Auth for OTP only |
| Google sign-in | Google Identity Services | — |
| Email (password reset) | Resend | Nodemailer + Gmail SMTP for dev |
| Avatars | Cloudinary | Store in Postgres as small URL only |
| Weather | OpenWeather (or keep your current source) | Cached 15 min |

Check each provider's current pricing before you rely on it; SMS is the only part likely to cost money, so keep a dev mode that logs OTPs to the console instead of sending them.

### Tooling

ESLint + Prettier, Vitest (frontend + Node unit tests), Supertest (API tests), pytest (safety service), Playwright (end-to-end), k6 or RoadSoS's `load_test.py` (load), Prisma Studio (admin).

## 3. Map stack

The map is the heart of both apps, so it gets its own section. The rule: **free open data (OpenStreetMap) everywhere, but never hammer the public demo servers in production.**

| Job | Tool | How it is used | Production note |
| --- | --- | --- | --- |
| Draw the map | Leaflet + react-leaflet | One `<MapView>` component; layers are child components | Lightweight, works offline with cached tiles |
| Map tiles (the images) | OSM-based raster tiles from a provider (MapTiler, Stadia Maps or Carto) | Tile URL + API key in env; theme-tinted style per app theme | The public `tile.openstreetmap.org` server has a usage policy that forbids heavy app use and bulk downloading; use a provider key |
| Routing (Plan, Directions) | OSRM | `table` service for the distance matrix (Optimise), `route` service with `steps=true` for turn-by-turn | The public OSRM demo server is for testing only; for production use OpenRouteService / GraphHopper free tiers or self-host OSRM with the western-India extract |
| Places and hospitals data | Overpass API **(both repos use it)** | Seed script imports tourist places; safety service queries hospitals/police/pharmacies live with mirror failover | Cache results (24 h) in Redis; respect rate limits |
| Search an address | Nominatim (or provider geocoding) | Explore search fallback when a query is not a known place | 1 request/second policy on the public server; debounce + cache |
| Distance queries | PostGIS | `ST_DWithin` for “within X km”, `<->` for nearest-first, GIST index | Precompute nearest hospital per place nightly |
| Live location | Browser Geolocation `watchPosition` | High accuracy only during Directions and SOS; low accuracy elsewhere to save battery | On Android via Capacitor for better background behaviour |

### Map layers in the app

- **Places:** markers from `GET /places?near=lat,lng&radiusKm=`; tap a marker → preview card → Place screen.
- **My route:** today's stops in order, polyline from OSRM `route` (decoded geometry), leg durations as labels, weak-signal legs drawn amber-dashed (flag comes from `Place.weakSignal`).
- **Help nearby:** markers from the safety service `GET /api/emergency-services`; sorted trauma care first.

### Turn-by-turn directions

1. Request OSRM `route` with `steps=true&overview=full&geometries=polyline6` for `foot` or `car`.
2. Show the current step (`maneuver.type`, `modifier`, `name`, `distance`).
3. On each `watchPosition` update, find the closest point on the route; advance the step when within \~20 m of the next manoeuvre; re-route if more than \~50 m off the line for 10 seconds.
4. ETA = remaining step durations.

### Offline maps

An offline pack = a bounding box + zoom range (for example 12–16) + JSON bundle (places, hospitals, emergency numbers). The service worker pre-fetches the tiles into a named cache and stores the bundle in IndexedDB. Keep packs small (city area or one fort trail) and only cache tiles from a provider whose terms allow offline caching.

## 4. High-level architecture

Two backends, one database, one Redis. The **Tour API** owns accounts and everything about places and plans. The **Safety service** owns emergencies and works without login, so SOS keeps working even if the Tour API is down.

```
                 ┌────────────── Clients ────────────────┐
                 │ React PWA (web)  ·  Android (Capacitor)       │
                 └──────┬──────────────────────┬──────────┘
                        │ HTTPS REST (JWT)       │ HTTPS + WSS (no login)
          ┌─────────────▼─────────┐   ┌────────▼───────────────┐
          │ Tour API (Express)     │   │ Safety service (FastAPI) │
          │ auth, users, places,   │──▶│ emergency services,      │
          │ itinerary, contacts,   │   │ tracking sessions, SOS   │
          │ medical, stamps, packs │   │ live location            │
          └───┬──────────┬─────────┘   └───────┬─────────────────┘
              │          │                     │
     ┌────────▼───┐  ┌───▼─────────────────────▼─────┐
     │ PostgreSQL │  │ Redis: cache, rate limits,    │
     │ + PostGIS  │  │ BullMQ jobs, pub/sub          │
     └────────────┘  └─────────────────────────────┘
  External: map tiles · OSRM · Overpass · Nominatim · SMS · Google OAuth · Email · Cloudinary · Weather
```

### Who owns what

| Component | Owns | Talks to |
| --- | --- | --- |
| PWA / Android app | All screens, theme, offline cache, device APIs (location, motion, camera, contacts, haptics), dialling 112 | Tour API, Safety service, tile provider, OSRM |
| Tour API | Users and auth, places, itinerary, routes, contacts, medical, stamps/XP, offline pack bundles, SOS alert fan-out | Postgres, Redis, SMS, email, Google, Cloudinary, OSRM, Safety service |
| Safety service | Nearby emergency services, tracking sessions, live-location WebSocket | Redis, Overpass |
| PostgreSQL + PostGIS | All durable data | — |
| Redis | Cache (`tour:*`), SOS sessions (`sos:*`), rate limits, BullMQ queues, pub/sub | — |

### Three flows to know by heart

1. **Explore:** app → `GET /places?near…` → Redis cache hit? return : PostGIS query → cache 10 min → app.
2. **Plan → Optimise:** app → `POST /itinerary/optimize` → OSRM `table` (time matrix) → nearest-neighbour + 2-opt ordering → save new `order` values in one transaction → return new order and minutes saved.
3. **SOS:** countdown ends → **phone dials 112 locally** → in parallel: Safety service `create-session` (live location starts streaming) and Tour API `POST /sos/alert` (queues SMS to contacts with the tracking link) → if offline, the app opens a pre-filled `sms:` message instead.

## 5. Repository and folder structure

Keep **one repo** (your PuneTourGuide repo) and turn it into a small monorepo with npm workspaces. Copy RoadSoS's `backend/` in as the safety service and its useful frontend pieces (SOS logic, i18n locales, utils) into the web app.

```
pune-explorer/
├─ apps/
│  └─ web/                      # React PWA (today's src/ moves here)
│     ├─ src/
│     │  ├─ app/                 # router, providers (Query, Theme, Auth, i18n)
│     │  ├─ screens/
│     │  │  ├─ home/ explore/ map/ plan/ place/ sos/
│     │  │  ├─ settings/          # profile, contacts, medical, offline, language, theme
│     │  │  └─ onboarding/        # splash, intro, permissions, auth screens
│     │  ├─ components/          # Button, Card, Sheet, Toggle, Chip, BottomNav, MapView
│     │  │  └─ deccan/            # ZariBorder, FortSkyline, MarathiKicker, Postmark, TicketCard
│     │  ├─ features/            # hooks + logic per feature: useSos, useShake, useNavigation, useOfflinePack
│     │  ├─ api/                 # typed fetch client + React Query hooks per module
│     │  ├─ stores/              # Zustand: auth, theme, sos, permissions
│     │  ├─ i18n/locales/        # en, mr, hi, gu + RoadSoS locales
│     │  ├─ styles/              # themes.css, animations.css, tailwind base
│     │  └─ sw/                  # service worker extras (offline packs)
│     └─ capacitor.config.ts
├─ services/
│  ├─ tour-api/                 # Express + Prisma (today's backend/ moves here)
│  │  ├─ prisma/schema.prisma, migrations/, seed.ts
│  │  └─ src/
│  │     ├─ routes/ middleware/ controllers/ services/
│  │     ├─ repositories/        # Prisma + raw PostGIS queries
│  │     ├─ clients/             # osrm, safety, sms, email, google, cloudinary
│  │     ├─ jobs/                # BullMQ workers: sos-alerts, otp-sms
│  │     ├─ config/env.ts        # Zod-validated env
│  │     └─ app.ts, server.ts
│  └─ safety/                   # RoadSoS FastAPI (main.py, dsa_engine.py)
├─ packages/
│  └─ shared/                   # Zod schemas + TS types used by web and tour-api
├─ design-reference/            # the .dc.html mockups, README, FEATURES.md
├─ docker-compose.yml           # postgis, redis, tour-api, safety
└─ .github/workflows/ci.yml
```

### Layering rule inside the Tour API

`route → rateLimit → auth → validate(zod) → controller → service → repository / client → response`, with one `errorHandler` at the end. Controllers only translate HTTP; services hold all business rules; repositories are the only place that touches Prisma.

## 6. Data model

One PostgreSQL database with PostGIS. Prisma manages tables and migrations; geometry columns are declared as `Unsupported` and queried with raw SQL.

```prisma
model User {
  id             Int       @id @default(autoincrement())
  name           String
  email          String?   @unique
  password       String?             // null for phone / Google users
  phone          String?   @unique   // E.164, e.g. +9198XXXXXXXX
  phoneVerified  Boolean   @default(false)
  googleId       String?   @unique
  avatarUrl      String?
  language       String    @default("en")
  theme          String    @default("classic")   // classic | deccan
  interests      String[]
  shakeToSos     Boolean   @default(true)
  smsWhenOffline Boolean   @default(true)
  tripReminders  Boolean   @default(false)
  xp             Int       @default(0)
  createdAt      DateTime  @default(now())
  contacts       EmergencyContact[]
  medical        MedicalProfile?
  stamps         Stamp[]
  savedPlaces    UserSavedPlace[]
  itineraryDays  ItineraryDay[]
  refreshTokens  RefreshToken[]
}

model Place {
  id                  Int      @id @default(autoincrement())
  osmId               String?  @unique
  name                String
  nameMr              String?
  category            String   // fort | temple | heritage | food | museum | nature
  description         String
  descriptionMr       String?
  area                String
  openHours           String?
  entryFee            String?
  visitMinutes        Int?
  accessible          Boolean  @default(false)
  free                Boolean  @default(false)
  weakSignal          Boolean  @default(false)
  xp                  Int      @default(30)
  nearestHospitalName String?
  nearestHospitalKm   Float?
  latitude            Float
  longitude           Float
  location            Unsupported("geometry(Point, 4326)")?
  @@index([category])
}

model Route        { id Int @id @default(autoincrement()); title String; mode String; stops RouteStop[] }
model RouteStop    { id Int @id @default(autoincrement()); routeId Int; placeId Int; order Int }
model ItineraryDay { id Int @id @default(autoincrement()); userId Int; date DateTime; label String; stops ItineraryStop[] }
model ItineraryStop{ id Int @id @default(autoincrement()); dayId Int; placeId Int; time String?; order Int; done Boolean @default(false)
                     @@index([dayId, order]) }
model UserSavedPlace { userId Int; placeId Int; createdAt DateTime @default(now()); @@id([userId, placeId]) }
model Stamp        { id Int @id @default(autoincrement()); userId Int; placeId Int; collectedAt DateTime @default(now())
                     @@unique([userId, placeId]) }
model EmergencyContact { id Int @id @default(autoincrement()); userId Int; name String; relation String; phone String; isPrimary Boolean @default(false) }
model MedicalProfile { userId Int @id; bloodGroup String?; allergiesEnc String?; medicinesEnc String?; notesEnc String?; showOnLockScreen Boolean @default(true) }
model RefreshToken { id String @id; userId Int; tokenHash String @unique; expiresAt DateTime; revokedAt DateTime? }
model OtpCode      { id Int @id @default(autoincrement()); phone String; codeHash String; expiresAt DateTime; attempts Int @default(0); @@index([phone]) }
model PasswordReset{ id Int @id @default(autoincrement()); userId Int; tokenHash String @unique; expiresAt DateTime; usedAt DateTime? }
model SosEvent     { id Int @id @default(autoincrement()); userId Int?; sessionId String; lat Float; lng Float; startedAt DateTime @default(now()); cancelledAt DateTime? }
```

(Relations and `onDelete: Cascade` are omitted on the one-line models for space; add them in the real schema.)

### Indexes and constraints that matter

- `CREATE INDEX place_location_gist ON "Place" USING GIST (location);` in a manual migration.
- Unique: `User.email`, `User.phone`, `User.googleId`, `Stamp(userId, placeId)`, `UserSavedPlace(userId, placeId)`.
- `ItineraryStop(dayId, order)` for ordered reads.
- Max 5 emergency contacts per user, enforced in the service, exactly one `isPrimary`.

### Sensitive data

- Medical text fields are encrypted with **AES-256-GCM** before saving (`*Enc` columns); key in `MEDICAL_ENC_KEY`. Blood group stays plain because responders need it fast.
- OTP codes, refresh tokens and reset tokens are stored only as **SHA-256 hashes**.
- Phone numbers are masked in logs and API responses to other users.

### Typical PostGIS query (places near me)

```sql
SELECT id, name, category,
       ST_Distance(location::geography, ST_MakePoint($lng, $lat)::geography) / 1000 AS km
FROM "Place"
WHERE ST_DWithin(location::geography, ST_MakePoint($lng, $lat)::geography, $radiusKm * 1000)
  AND ($category IS NULL OR category = $category)
ORDER BY location <-> ST_SetSRID(ST_MakePoint($lng, $lat), 4326)
LIMIT $limit;
```

Run it through Prisma's tagged `$queryRaw` so parameters are escaped.

## 7. API reference

All Tour API routes live under `/api/v1`. Success responses are `{ "data": …, "meta": … }`; errors are `{ "error": { "code": "OTP_EXPIRED", "message": … } }` with the right HTTP status (400, 401, 403, 404, 409, 429). **Auth** column: *public* = no token, *user* = valid access token, *optional* = works either way.

### Auth

| Method & path | Auth | Purpose |
| --- | --- | --- |
| POST `/auth/register` | public | Email sign-up |
| POST `/auth/login` | public | Email log-in → access token + refresh cookie |
| POST `/auth/google` | public | Exchange Google ID token → tokens, `isNewUser` |
| POST `/auth/otp/send` | public | Send 6-digit code (`channel`: sms or voice) |
| POST `/auth/otp/verify` | public | Verify code → tokens, `isNewUser` |
| POST `/auth/refresh` | cookie | Rotate refresh token, new access token |
| POST `/auth/logout` | user | Revoke refresh token |
| POST `/auth/password/forgot` | public | Email a reset link (always 200) |
| POST `/auth/password/reset` | public | Set new password with reset token |

### Users and settings

| Method & path | Auth | Purpose |
| --- | --- | --- |
| GET `/users/me` | user | Profile, settings, XP, level |
| PATCH `/users/me` | user | Name, email, interests, language, theme, toggles |
| POST `/users/me/avatar` | user | Upload avatar (image only, 5 MB) |
| GET `/users/me/stats` | user | XP, level, places visited, stamps count |
| GET `/stamps` | user | Collected stamps for the passport |
| GET/POST `/contacts`, PATCH/DELETE `/contacts/:id` | user | Emergency contacts (max 5, one primary) |
| POST `/contacts/test-alert` | user | Send a TEST SMS to all contacts (rate-limited) |
| GET/PUT `/medical` | user | Encrypted medical profile |

### Places, routes, plans

| Method & path | Auth | Purpose |
| --- | --- | --- |
| GET `/places` | optional | `q, category, near, radiusKm, openNow, free, accessible, helpWithinKm, cursor, limit` |
| GET `/places/count` | optional | Same filters, returns a number (Filters sheet) |
| GET `/places/:id` | optional | Detail incl. nearest hospital, `isSaved` if logged in |
| GET `/places/:id/nearby` | optional | “Also nearby” + “Food nearby” for a place: ≤6 each, within 3 km (10 km if fewer than 3), nearest first, closed-now last; km from that place; cached per place |
| POST `/places/:id/visit` | user | “Mark as visited”: stamp + place XP once per place, ticks it in the plan; rate-limited per account |
| GET `/google/places/:id`, `/google/places/:id/nearby` | optional | Live Google rating/open now/photo, side quests + food (§9.13) |
| GET `/google/spots/:googleId`, POST `/google/spots/:googleId/visit` | optional / user | Side quest page; +10 XP once |
| GET `/google/photo?name&w` | optional | Redirect to a Google photo |
| PUT/DELETE `/places/:id/save` | user | Save / unsave |
| GET `/routes` | public | Curated routes (peth walk, fort trip…) |
| GET `/itinerary?date=` | user | Days with ordered stops |
| POST `/itinerary/stops` | user | Add a place to a day |
| PATCH `/itinerary/stops/:id` | user | Mark done (→ XP + stamp), change time, or move to another day (`dayId`) |
| DELETE `/itinerary/stops/:id` | user | Remove a stop |
| POST `/itinerary/optimize` | user | Reorder a day, returns `minutesSaved` |
| POST `/itinerary/from-route/:routeId` | user | Copy a curated route into a day |
| GET `/directions?from=&to=&mode=` | optional | Proxy to OSRM with caching (hides the routing provider key) |

### Safety and offline

| Method & path | Auth | Purpose |
| --- | --- | --- |
| POST `/sos/alert` | optional | Start alert fan-out; needs `Idempotency-Key`; guest mode sends nothing but logs the event |
| POST `/sos/cancel` | optional | Cancel and send “I'm safe” |
| POST `/share-trip` | user | Create a tracking session and text the link to contacts |
| GET `/offline-packs` | public | Available packs with size |
| GET `/offline-packs/:id` | public | JSON bundle (places, hospitals, numbers, tile bbox) |
| GET `/weather`, GET `/events` | public | Home header data (existing) |

### Safety service (FastAPI, existing, no login)

| Method & path | Purpose |
| --- | --- |
| GET `/api/emergency-services?lat&lng` | Nearby hospitals, police, pharmacies, trauma-first |
| POST `/api/create-session` | New tracking session id |
| WS `/ws/track/{sessionId}` | Publish / watch live location |
| GET `/health` | Health check |

Generate an OpenAPI spec from the Zod schemas and serve Swagger UI at `/api/docs` in development.

## 8. Authentication and security

### Tokens

- **Access token:** JWT, 15 minutes, signed with `JWT_SECRET`, payload `{ sub: userId }`. Sent as `Authorization: Bearer …`, kept **in memory** only.
- **Refresh token:** 32 random bytes, 30 days, stored **hashed** in `RefreshToken`. Web: `httpOnly; Secure; SameSite=Lax` cookie on `/api/v1/auth`. Android (Capacitor): secure storage plugin.
- **Rotation:** every `/auth/refresh` revokes the old token and issues a new one. If a revoked token is reused, revoke all of that user's tokens (stolen-token detection).
- Today the app keeps a JWT in `localStorage`; migrate away from it, because any injected script can read it.

### Sign-in methods

| Method | Steps | Protections |
| --- | --- | --- |
| Email + password | bcrypt (cost 12) compare → tokens | Rate limit 5/min per IP + email; same error for wrong email or password |
| Mobile OTP | `otp/send`: random 6 digits → store hash, expires 5 min → SMS job. `otp/verify`: latest unexpired code, `attempts++`, compare hash → upsert user → tokens | 30-s resend cooldown, max 5 sends/hour per phone, max 5 attempts per code, dev mode logs code instead of sending |
| Google | Frontend gets an ID token → server verifies with `google-auth-library` (signature, `aud` = your client ID, `email_verified`) → link by `googleId`, else by verified email → tokens | Never trust profile data sent by the client |
| Forgot password | Random token → hash stored, 30 min, single use → email link → `password/reset` sets new bcrypt hash and revokes all refresh tokens | Always reply 200 so attackers can't discover emails |

### Authorisation

- Every query for user-owned data filters by `userId` taken from the token, never from the request body or URL.
- Guest mode: places, map, emergency services and SOS work without a token. Saving, planning and contacts require login; the app shows a log-in prompt instead of an error.

### Security checklist

- `helmet`, CORS allowlist (your domain + Capacitor origin), HTTPS only, `compression`.
- Zod validation on every body, query and param; reject unknown fields.
- Rate limits stored in Redis: login, OTP, SOS alert, test alert, password reset.
- Raw SQL only through Prisma's tagged `$queryRaw`.
- Secrets only in environment variables, validated at startup by `config/env.ts`; the server refuses to start if one is missing.
- Never log tokens, OTPs or medical data; mask phone numbers.
- Uploads: image MIME types only, 5 MB limit, uploaded to Cloudinary, never served from your API.
- Medical data: AES-256-GCM, returned only to its owner, shared with responders only through an active SOS session.
- Dependency checks: `npm audit` and GitHub Dependabot.

## 9. How each feature works, end to end

Each feature below follows the same path: **what the user does → what the app does → which API → what the server does → what is stored → edge cases.**

### 9.1 Explore, search and filters

1. App gets a location (cached last fix, or Pune centre if denied) and calls `GET /places?near=lat,lng&radiusKm=10&category=&q=&cursor=`.
2. Server builds a cache key from the filters (location rounded to \~500 m); on a Redis miss it runs the PostGIS query, adds `isSaved` and `isInPlan` for logged-in users, caches 10 minutes.
3. Search is debounced 300 ms; if no place matches, fall back to Nominatim geocoding and show “Places near \<address>”.
4. Filters sheet calls `GET /places/count` on every change to show **Show N places**.
5. **Edge cases:** no location → sort by popularity; offline → show places from the downloaded pack.

### 9.2 Place detail and save

- `GET /places/:id` returns details plus `nearestHospitalName/Km` (precomputed by a nightly job that asks the safety service for each place).
- Save toggles `PUT/DELETE /places/:id/save` with an **optimistic update** in React Query (UI changes instantly, rolls back on error) and a toast.
- Guests tapping Save get the log-in sheet.

### 9.3 Day plans, Optimise, XP and stamps

- Add to plan: `POST /itinerary/stops {placeId, dayId?}` appends to the chosen day with the next `order` (no `dayId` → today's day, else Day 1). The app asks which day in a bottom sheet (Explore “+”, Place “Add to plan”, route tickets) and starts on the Plan tab last viewed or added to.
- Move a stop: `PATCH /itinerary/stops/:id {dayId}` appends it to the end of that day, re-timed after the last stop (409 `ALREADY_IN_PLAN` if the place is already on that day).
- Tick visited: `PATCH /itinerary/stops/:id {done:true}` runs **one transaction**: set `done`, add the place's XP to the user, create a `Stamp` (unique per user+place, so re-ticking never double-awards). Response includes new XP and whether a stamp was collected, so the app can play the stamp animation.
- Optimise: server fetches an OSRM `table` (travel times between all stops of the day), keeps the first stop fixed, runs nearest-neighbour then **2-opt** improvement (fast for under 15 stops), saves the new `order` values in one transaction, returns `minutesSaved`. If already optimal, `minutesSaved = 0` and the app shows “Already the best order”.
- Curated route tickets: `POST /itinerary/from-route/:id {dayId?}` copies the route's stops into the chosen day.

### 9.4 Map layers and directions

- Places layer = the Explore query for the current map bounds; Help layer = safety service `emergency-services` for the map centre; My route = today's stops + OSRM geometry from `GET /directions` (server caches per stop pair for 24 h).
- Directions: see section 3. The SOS button stays on screen; End returns to Plan.

### 9.5 SOS (most important flow)

1. **Trigger:** SOS button, or shake when `shakeToSos` is on (accelerometer magnitude above the RoadSoS threshold, debounced 1 s; iOS needs `DeviceMotionEvent.requestPermission()` from a tap, which the Permissions screen does).
2. **Countdown:** 5 seconds with haptics; “I'm safe, cancel” stops it and nothing is sent.
3. **At zero, in this order:**
   - `window.location.href = 'tel:112'` — dialled by the phone itself, works offline.
   - Safety service `POST /api/create-session` → start publishing location every 3 s over `WS /ws/track/{id}`.
   - Tour API `POST /sos/alert {sessionId, lat, lng}` with an `Idempotency-Key`. Server records an `SosEvent`, then queues one BullMQ job per contact: SMS with name, tracking link, nearest hospital, and medical summary if the user allowed it. Jobs retry 3 times with backoff.
   - **Offline or API failed:** app opens `sms:` with the primary contact's number and a pre-filled message containing the raw coordinates.
4. **Cancel after sending:** `POST /sos/cancel` sends “I'm safe” to the same contacts and closes the session.
5. **Guest users:** 112 call and live session work; alerts need saved contacts, so guests get the `sms:` fallback only if they typed a number.

### 9.6 Live trip sharing

Toggle on in Plan → `POST /share-trip` creates a safety-service session and texts the link to contacts → app publishes location while the toggle is on (and only while the app is open on the web; Capacitor can keep it going longer) → toggle off closes the session.

### 9.7 Emergency contacts and test alert

CRUD on `/contacts` with max 5 and exactly one primary (setting a new primary clears the old one in the same transaction). “Pick from phone contacts” uses the Contact Picker API on Android Chrome or the Capacitor Contacts plugin, then fills the form. Test alert queues SMS marked “TEST — no action needed”, limited to 3 per day.

### 9.8 Medical info

`PUT /medical` encrypts free-text fields before saving; `GET /medical` decrypts for the owner. During SOS the server attaches blood group and (if `showOnLockScreen`) a short summary to the alert. Nothing medical is cached in plain text on the server.

### 9.9 Offline packs

`GET /offline-packs` lists packs with sizes. Download: app fetches the JSON bundle, stores it in IndexedDB, then the service worker fetches the tile list for the pack's bounding box and zoom range into a cache named `pack-<id>`, reporting progress. Delete removes both; Undo re-adds within 5 seconds (soft delete in the client). Auto-download fetches packs for places in upcoming plans on Wi-Fi only (`navigator.connection` where available).

### 9.10 Language and themes

- i18next with `en`, `mr`, `hi`, `gu` loaded first and the other RoadSoS locales lazy-loaded. “Match the state I'm in” suggests a language from the state detected by reverse geocoding.
- Theme: Zustand store → sets `<html data-theme>` and saves to `localStorage` + `PATCH /users/me {theme}`. On log-in the server value wins.

### 9.11 First launch and permissions

Splash → Intro (shown once: `localStorage.pe_onboarded`) → Turn on safety (Location + Motion permission prompts) → Sign up / Log in / Skip. Home shows the amber “Safety not set up” card while either permission is missing.

### 9.12 Account flows

- Email sign-up → first emergency contact → Home. Mobile: Send code → Enter code → (new) Almost there → first contact → Home; (existing) → Home. Google: popup → `POST /auth/google` → new users → first contact.
- Forgot password → email link opens `/reset?token=` in the app → new password → log in.
- Sign out clears tokens but keeps contacts, medical summary and offline packs on the device so SOS still works.

### 9.13 Google Maps: photos, ratings and side quests

Since 2026-10-21 everything except SOS moves to Google Maps Platform (this step: Places; the map and directions follow). SOS, nearby help and offline help stay on OpenStreetMap so they work offline and logged out.
- Our catalogue keeps XP, stamps, Marathi names and plans; each place stores only its Google `googlePlaceId` (filled by `npm run google:link`, Text Search IDs only, no charge).
- Place screen: `GET /google/places/:id` (Place Details, Enterprise fields: rating, open now, hours, photo) and `GET /google/places/:id/nearby` (two Nearby Searches: side quests = attractions, trails, parks, viewpoints, landmarks; food = restaurants, cafés, tea, bakeries with food as the main type). 1.5 km in the city, 5 km beyond 10 km from the centre; our own catalogue places are filtered out. Google's food row replaces ours when available.
- Side quest page `/spot/:googleId`: `GET /google/spots/:googleId` (details + 3 photos); "Been here?" `POST /google/spots/:googleId/visit` gives +10 XP once (`SpotVisit`, only the Google id is stored; only spots the server has shown can be claimed).
- Photos: `GET /google/photo?name&w` redirects to Google's short-lived image URL (the key stays on the server; photo authors are credited).
- Rules from Google's terms: no Google content is stored or cached (responses are `no-store`; `/api/v1/google` is outside the offline cache; the query cache is memory only); Google data never appears on our non-Google map; "Google Maps" attribution on every Google row.
- Cost: the server key is restricted to Places + Routes and sent in a header. Daily caps per call kind (`GOOGLE_DAILY_CAPS`, Redis, Pune day) are the hard limit because the console quotas can't be lowered; when reached, or when Google fails, endpoints return `{ available: false, reason }` and the app shows its own data. Plus a ₹1,000/month budget alert.

### 9.14 Trip mode: Start Day N

After planning, the Plan tab's **Start Day N** button (Continue Day N while it runs) opens `/trip`, which walks the traveller through the day.
- **Run:** `DayRun` (user, day, `startedAt` / `endedAt`, `endReason`, `skipped` stop ids, frozen summary). One running per user (partial unique index), so two taps or two devices share one run; starting another day ends the old one (`replaced`).
- **Endpoints (auth):** `POST /itinerary/days/:id/start` (start or carry on; 400 `DAY_EMPTY`), `GET /itinerary/run`, `POST /itinerary/runs/:id/skip {stopId, skipped}`, `POST /itinerary/runs/:id/end {reason}`. Visiting reuses the tick (`PATCH /itinerary/stops/:id`), which now also stores `doneAt` and the `xpAwarded` it earned, so the summary counts only what this run did (places, XP, km between visited places, time).
- **Next stop:** the first stop in the *current* plan order that is neither done nor skipped, so reordering, Optimise, moving or deleting stops mid-trip is safe.
- **Arrival:** while trip mode or its directions are on screen (paused in the background), the phone's GPS is watched. "You've arrived?" is asked only for the next stop, only with readings better than 50 m, after 30 s nearby, not above ~15 km/h, within 100 m (400 m for forts, hills, lakes, gardens), and once per stop. It never ticks by itself; "I'm here · mark visited" always works.
- **No signal:** the run, a copy of the day's stops and a queue of ticks / skips / end live on the phone (`pe_trip`); actions apply at once and are sent in order when back online (repeats are harmless; refused ones are dropped). Ending offline shows a phone-side summary.
- **Forgotten trips:** a run ends itself (`auto`) after 14 hours or once the trip day rolls over at 4 AM Pune time; the live share that Start Day turned on ends with the day.
- **Live share, honestly:** starting the day offers to share the live trip with the emergency contacts. `GET /share-trip/:sessionId/delivery` reports each text as sent / failed / sending (`TripShare.smsLogIds`), and **Send the link yourself** opens the phone's share sheet with the follow link, so nobody is told "shared" when a text did not go.
- **Google Maps hand-off:** per stop, and "Open the whole day" (remaining stops in order; Google's link takes 10, so a longer day opens the next 10).

## 10. Frontend architecture

### Routing

React Router with a tab layout and stacked screens:

| Route | Screen |
| --- | --- |
| `/` | Home (tab) |
| `/explore`, `/explore/filters` | Explore + Filters sheet |
| `/map`, `/directions/:stopId` | Map, Directions |
| `/plan` | Plan (tab) |
| `/place/:id` | Place detail |
| `/sos` | SOS (also opened by shake from anywhere) |
| `/profile`, `/settings/*` | Passport / settings list and sub-screens |
| `/welcome`, `/intro`, `/permissions` | First launch |
| `/login`, `/signup`, `/otp`, `/almost-there`, `/first-contact`, `/forgot`, `/reset` | Account |

Page transitions use the `rise` animation from the designs on mount; respect `prefers-reduced-motion`.

### State

- **Server data:** React Query hooks per module (`usePlaces`, `useItinerary`, `useContacts`…). Mutations use optimistic updates for save, add-to-plan and tick.
- **App state (Zustand):** `authStore` (access token in memory, user), `themeStore`, `sosStore` (countdown, session id, status), `permissionStore`.
- **Persisted on device:** theme, language, onboarding flag, permissions flags, offline packs (IndexedDB), and a copy of emergency contacts + blood group for offline SOS.

### API client

One `fetch` wrapper that adds the access token, retries once on 401 by calling `/auth/refresh`, and turns error responses into typed errors. Shared Zod schemas from `packages/shared` validate responses in development.

### Theming

`themes.css` defines variables for Classic and Deccan; Tailwind colours point at the variables; `<DeccanOnly>` renders the zari border, fort skyline, Marathi kicker, stamps and tickets. Fonts: Instrument Serif + Hanken Grotesk (Classic), DM Serif Display + Mukta + Yatra One (Deccan).

### PWA and offline

vite-plugin-pwa with Workbox:

| Content | Strategy |
| --- | --- |
| App shell (JS, CSS, fonts) | Precache |
| Map tiles | Cache-first, capped size |
| API reads (places, plan) | Network-first, fall back to cache |
| Emergency numbers, contacts copy, last nearby hospitals | Always cached (never expire) |
| Offline packs | Named caches per pack |

### Android build (Capacitor)

Same web build wrapped with Capacitor (RoadSoS already has the setup). Plugins: Geolocation, Haptics, Contacts, Preferences (secure storage), Share. Build a debug APK for demos; Play Store later.

## 11. Implementation phases (solo build)

Build in this order so something demo-able exists after every phase. Durations assume part-time work alongside college; adjust freely. Commit and deploy a preview at the end of each phase.

| # | Phase | What you build | Done when |
| --- | --- | --- | --- |
| 0 | Setup (2–3 days) | Monorepo layout, move `src/` and `backend/`, copy RoadSoS backend into `services/safety`, Docker Compose (PostGIS, Redis, both APIs), env validation, CI that lints and builds, `design-reference/` | `docker compose up` runs everything locally; CI is green |
| 1 | Foundation UI (1 week) | Theme system, fonts, animations, Router, floating nav, base components (Button, Card, Sheet, Toggle, Chip), i18next | Empty screens reachable from the nav in both themes |
| 2 | Data + auth core (1 week) | New Prisma schema + migrations + seed (places with categories, coordinates, Marathi names), refactor to routes/services/repositories, email auth with access + refresh tokens, `GET/PATCH /users/me` | Log in, refresh and log out work; tests pass |
| 3 | Discover (1–1.5 weeks) | Home, Explore (search, chips, filters, counts, route tickets), Place (save, add to plan), PostGIS queries + Redis cache | You can find, filter, save and add places |
| 4 | Plan + Map (1.5 weeks) | Plan (days, tick → XP + stamp, Optimise with OSRM), Map (3 layers), `/directions` proxy, Directions screen | A full day can be planned, optimised and navigated |
| 5 | SOS + safety (1.5 weeks) | Port countdown + shake + haptics from RoadSoS, `tel:112`, tracking session + WebSocket, contacts CRUD, `/sos/alert` with BullMQ + SMS (dev mode first), `sms:` fallback, share trip | SOS works logged-in, logged-out and in airplane mode (call + sms fallback) |
| 6 | Settings (1 week) | Edit profile + avatar, medical (encrypted), offline packs + service worker, language, theme persistence, toggles, passport | Every settings row in FEATURES.md works |
| 7 | Account + first launch (1 week) | Mobile OTP, Google sign-in, forgot/reset password, Splash, Intro, Permissions, first contact, HomeSetup state | A brand-new user can go from install to Home in both themes |
| 8 | Hardening + launch (1 week) | Rate limits, Sentry, logs, accessibility pass, Lighthouse PWA, load test, Playwright end-to-end suite, production deploy, Android APK | Production URLs live; demo script rehearsed |

### Order of risk

The riskiest pieces are SMS delivery, shake detection across phones and offline tiles. Do a 1-day spike on each at the start of its phase before building screens around it.

## 12. Testing, CI/CD, deployment and operations

### Testing

| Level | Tool | What to cover |
| --- | --- | --- |
| Unit | Vitest (web + tour-api), pytest (safety) | Optimise algorithm, XP/stamp rules, OTP expiry/attempts, encryption helpers, shake detector, countdown store |
| API integration | Supertest + a test Postgres in Docker | Every endpoint: happy path, 401/403, validation 400, rate limit 429 |
| End to end | Playwright (mobile viewport) | Sign up → first contact → plan a day → tick a stop; SOS countdown and cancel; theme switch |
| Load | k6 or RoadSoS `load_test.py` | `/places?near`, `/api/emergency-services`; note p95 latency for your report |

### CI/CD (GitHub Actions)

1. On every push: install, lint, type-check, unit tests, API tests (Postgres + Redis service containers), build.
2. On `research` and `main` (`.github/workflows/release.yml`): build the app image (web + Tour API) and the safety image, push them to GitHub Container Registry (`:research` / `:latest`), then, when `DEPLOY_ENABLED`, update the server over SSH. Migrations run when the app container starts (`prisma migrate deploy`).
3. Work goes into `research` through pull requests, so each merge can be checked on a phone at the live domain before `research` is merged into `main`.

### Environments

| Env | Frontend | APIs | Data |
| --- | --- | --- | --- |
| Local | Vite dev server | Docker Compose | Local PostGIS + Redis, seed data, SMS/email in console mode |
| Live (`research`, then `main`) | Built into the app image, served by Caddy | Docker Compose on the Google Cloud VM | Postgres + PostGIS and Redis in Docker on the same VM; daily disk snapshots |

### Environment variables

`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `REFRESH_TOKEN_TTL_DAYS`, `CORS_ORIGINS`, `SAFETY_SERVICE_URL`, `OSRM_URL` (or routing provider key), `MAP_TILES_URL` + `MAP_TILES_KEY`, `GOOGLE_CLIENT_ID`, `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER_ID`, `EMAIL_API_KEY`, `EMAIL_FROM`, `CLOUDINARY_URL`, `MEDICAL_ENC_KEY`, `WEATHER_API_KEY`, `SENTRY_DSN`, `APP_URL`. Frontend (`VITE_*`): API URLs, tile URL/key, Google client ID, Sentry DSN.

### Operations

- **Logs:** pino JSON logs with a request id; mask phones, never log secrets.
- **Errors:** Sentry on web and both APIs, with release tags from CI.
- **Health:** `/health` on both services; Render health checks restart a stuck instance.
- **Backups:** daily snapshots of the server disk (Google Cloud snapshot schedule); the seed data lives in the repo.
- **Cold starts:** free Render instances sleep; the app should show cached data and keep SOS working (112 is always local), and a small cron can ping `/health` during your demo.

## 13. Risks, decisions and open questions

### Key decisions

| Decision | Chosen | Why |
| --- | --- | --- |
| One backend or two | Two (Tour API + Safety service) | SOS keeps working if the Tour API fails; reuses both codebases |
| Theme approach | CSS variables + `data-theme` | One component set; switching is instant |
| Session storage | Access token in memory + httpOnly refresh cookie | Safer than `localStorage` against injected scripts |
| SOS calling | Phone dials 112 directly | Works with no internet and no server |
| Map data | OpenStreetMap ecosystem | Free, already used in both repos |
| Optimise algorithm | Nearest-neighbour + 2-opt on an OSRM time matrix | Fast and near-optimal for small day plans |

### Risks and fallbacks

| Risk | Fallback |
| --- | --- |
| SMS costs or delivery delays | Dev mode logs codes; Firebase Phone Auth for OTP; `sms:` intent for SOS |
| Public OSRM / tile servers rate-limit you | Use provider free tiers with keys; cache routes 24 h; self-host OSRM later |
| Free hosting sleeps during a demo | Ping `/health` before the demo; cached data in the app |
| Shake detection false alarms | 5-second countdown + cancel; let users turn shake off |
| Offline packs too large | Cap zoom 12–16, small areas, show size before download |
| Medical data leak | Encryption, owner-only access, no logging, shared only during SOS |
| Solo bandwidth | Ship phases 0–5 first; 6–8 can slip without breaking the core |

### Open questions

- [ ] Which SMS provider and sender ID (needs DLT registration in India for production SMS)?
- [ ] Map tile provider: MapTiler, Stadia or Carto?
- [ ] Routing: OpenRouteService free tier or self-hosted OSRM?
- [ ] Should guests be able to add one emergency contact stored only on the device?
- [ ] Deadline for the semester submission, to fit the phase durations.
