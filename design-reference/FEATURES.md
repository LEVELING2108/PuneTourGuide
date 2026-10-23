# Pune Explorer — feature spec (what every button must actually do)

Companion to `README.md`. The `.dc.html` files show *how it looks*; this file says *what happens* when each control is used,
and what backend/API work that needs. Status: **EXISTS** = already in PuneTourGuide or RoadSoS, **EXTEND** = exists but needs
changes, **NEW** = to build.

> **Progress:** ✅ in the Control column = works end to end on real data, verified by automated tests (updated after each build phase).

## 0. Architecture (agreed)

- **Frontend:** this repo's React + Vite PWA. One component set, two themes (CSS variables, `data-theme`).
- **Tour API:** this repo's Express + Prisma + PostgreSQL/PostGIS + Redis (`backend/`).
- **Safety service:** RoadSoS FastAPI backend, deployed separately (`/safety/*`, `/ws/track/*`), shares Redis (key prefixes `tour:*`, `sos:*`).
- **Auth:** JWT from the Tour API. SOS, emergency numbers and nearby help must work **without login and offline**.

## 1. Existing backend (keep)

| Endpoint | Used by |
|---|---|
| `GET /api/places`, `GET /api/places/:id`, `PATCH /api/places/:id/save` (auth) | Explore, Place, Map, Save button |
| `GET /api/itinerary`, `POST /api/itinerary/stops`, `PATCH /api/itinerary/stops/:id`, `DELETE /api/itinerary/stops/:id` | Plan, “+” add to plan, tick visited |
| `POST /api/itinerary/optimize` | Plan → Optimise |
| `POST /api/users/register`, `POST /api/users/login`, `GET /api/users/me`, `GET /api/users/stats` | Auth, Profile, XP card |
| `GET /api/weather`, `GET /api/events` | Home header |
| RoadSoS `GET /api/emergency-services?lat&lng` | Map “Help nearby”, nearest hospital lines, SOS |
| RoadSoS `POST /api/create-session`, `WS /ws/track/{id}` | Share live trip, SOS live location |

## 2. Data model changes (Prisma) — NEW

```prisma
model User {            // EXTEND existing
  phone          String?  @unique
  phoneVerified  Boolean  @default(false)
  googleId       String?  @unique
  password       String?  // nullable: phone/Google users have none
  avatarUrl      String?
  language       String   @default("en")
  theme          String   @default("classic")   // "classic" | "deccan"
  interests      String[] // EditProfile "I like" chips
  shakeToSos     Boolean  @default(true)
  tripReminders  Boolean  @default(false)
  contacts       EmergencyContact[]
  medical        MedicalProfile?
  stamps         Stamp[]
}
model EmergencyContact { id Int @id @default(autoincrement()); userId Int; name String; relation String; phone String; isPrimary Boolean @default(false); user User @relation(fields:[userId], references:[id], onDelete: Cascade) }
model MedicalProfile  { userId Int @id; bloodGroup String?; allergies String?; medicines String?; notes String?; showOnLockScreen Boolean @default(true); user User @relation(fields:[userId], references:[id], onDelete: Cascade) }
model Stamp           { id Int @id @default(autoincrement()); userId Int; placeId Int; collectedAt DateTime @default(now()); @@unique([userId, placeId]) }
model OtpCode         { id Int @id @default(autoincrement()); phone String; codeHash String; expiresAt DateTime; attempts Int @default(0) }
model PasswordReset   { id Int @id @default(autoincrement()); userId Int; tokenHash String; expiresAt DateTime }
model Place           { /* EXTEND */ category String; openHours String?; entryFee String?; visitMinutes Int?; weakSignal Boolean @default(false); nearestHospitalName String?; nearestHospitalKm Float?; nameMr String? }
```

Medical info is sensitive: store encrypted at rest, only return it to the owner, and only share it with responders inside an active SOS session.

## 3. Screen-by-screen behaviour

### First launch
| Control | Behaviour | Backend |
|---|---|---|
| ✅ Splash (tap / auto 2 s) | → Intro on first launch, → Home after that (`localStorage.pe_onboarded`) | — |
| ✅ Intro: swipe / Next / Skip / Get started / Log in | Carousel; Skip & Get started → Permissions; Log in → Login | — |
| ✅ Permissions: Allow location | `navigator.geolocation.getCurrentPosition` (triggers OS prompt) | — |
| ✅ Permissions: Allow motion | `DeviceMotionEvent.requestPermission()` on iOS (must be in the tap handler), otherwise just enable | — |
| ✅ Continue / Not now | Save `pe_perm_*` flags → SignUp | — |
| ✅ Home amber “Safety not set up” card | Shown when location or motion not granted; Set up → Permissions | — |

### Account
| Control | Behaviour | Backend |
|---|---|---|
| ✅ Continue / Sign up with Google | Google Identity Services → ID token → server verifies → JWT. New user → Onboard | **NEW** `POST /api/auth/google` |
| ✅ Email / Mobile number tabs | Switch form; the Mobile number tab shows only when `VITE_SERVER_SMS=true` (login codes need server texts that reach every number) | — |
| ✅ Log in (email) | | EXISTS `/users/login` |
| ✅ Create account (email) + password strength | Strength computed client-side; disabled until Terms ticked | EXISTS `/users/register` (EXTEND for interests/theme defaults) |
| ✅ Send code (mobile) | Rate-limited; send 6-digit SMS | **NEW** `POST /api/auth/otp/send` (SMS provider e.g. MSG91/Twilio/Firebase Phone Auth) |
| ✅ OTP boxes, auto-fill | `autocomplete="one-time-code"`; Web OTP API on Android | — |
| ✅ Verify | Returns `{token, isNewUser}` → new → PhoneName, existing → Home | **NEW** `POST /api/auth/otp/verify` |
| ✅ Resend SMS / Call me (after 30 s) | Resend / voice OTP | same endpoint with `channel` |
| ✅ Almost there → Continue | Save name, optional email, accept terms | **NEW** `PATCH /api/users/me` |
| ✅ Onboard: Pick from my contacts | Contact Picker API (Android Chrome) or Capacitor Contacts; fallback to manual | — |
| ✅ Onboard: Save & start exploring / Skip | Save first contact | **NEW** `POST /api/contacts` |
| ✅ Forgot? → Send reset link / Send again | Always show “check inbox” (no account enumeration); link valid 30 min | **NEW** `POST /api/auth/password/forgot`, `POST /api/auth/password/reset` (email via Resend/Nodemailer) |
| ✅ Skip for now | Guest mode: Explore/Map/SOS work, save/plan prompt login | — |

### Main tabs
| Control | Behaviour | Backend |
|---|---|---|
| ✅ Home: अ button | → Language | — |
| ✅ Home: Next stop card | First not-done stop of today | EXISTS itinerary |
| ✅ Home: Collections / stamps | → Explore with category preset | EXISTS places (filter) |
| ✅ Explore: search | Debounced query | **EXTEND** `GET /api/places?q=` |
| ✅ Explore: category chips | Filter list | **EXTEND** `?category=` |
| ✅ Explore: filter button → Filters sheet (distance, open now, free, wheelchair, hospital ≤2 km) | “Show N places” uses count from API | **EXTEND** `GET /api/places?near=lat,lng&radiusKm&openNow&free&accessible&helpWithinKm` (PostGIS `ST_DWithin`) + `GET /api/places/count?...` |
| ✅ Explore: route tickets | Load a curated route into the plan | **NEW** `GET /api/routes`, `POST /api/itinerary/from-route/:id` |
| ✅ Explore: “+” on a place | Add/remove from plan, toast | EXISTS stops POST/DELETE |
| ✅ Map: Places / My route / Help nearby | Layers; Help works logged-out | EXISTS places, itinerary + OSRM, RoadSoS emergency-services |
| ✅ Map: call buttons | `tel:` with real numbers from emergency-services | EXISTS |
| ✅ Map / Place: Start directions | → Navigation | OSRM route (EXISTS in itinerary service) |
| ✅ Navigation: Walk / Auto | Re-route with profile `foot`/`car` | OSRM |
| ✅ Navigation: End directions / SOS | → Plan / → SOS | — |
| ✅ Plan: Day tabs, tick visited | Tick → +XP and **collect a stamp** | EXISTS PATCH stop; **NEW** `POST /api/stamps` (or do it inside the PATCH) |
| ✅ Plan: Move to Day N | Moves a stop to the end of the other day, re-timed | EXISTS PATCH stop (EXTEND with `dayId`) |
| ✅ Add to plan / route ticket: day picker | Sheet asks Day 1 or Day 2; starts on the Plan tab last viewed or added to | EXISTS `POST /itinerary/stops`, `from-route` (`dayId`) |
| ✅ Plan: Optimise | Calls optimise, shows “saves N min” from response | EXISTS `/itinerary/optimize` (EXTEND to return time saved) |
| ✅ Plan: Start Day N / Continue Day N | Starts the day (asks to share the live trip with contacts) → Trip mode | **NEW** `POST /itinerary/days/:id/start`, `GET /itinerary/run` |
| ✅ Trip: next stop | Stop N of M, distance, "usually closed now", weak-signal note; Directions (back → Trip), Google Maps | current plan order; `googleDirectionsUrl` |
| ✅ Trip: arrival / I'm here / Skip / Undo | Asks "You've arrived?" near the next stop (good GPS, 30 s, not driving past); tick → stamp + XP; skip and undo | EXISTS PATCH stop; **NEW** `POST /itinerary/runs/:id/skip` |
| ✅ Trip: live share status | Each contact: Sent / Couldn't text / Sending; Send the link yourself (share sheet) | **NEW** `GET /share-trip/:sessionId/delivery` |
| ✅ Trip: open the whole day in Google Maps | Remaining stops in order (next 10 on a long day) | — (URL hand-off) |
| ✅ Trip: End day / Day summary | Places, XP, km, time; Start the next day; ends itself after the day; works offline (syncs later) | **NEW** `POST /itinerary/runs/:id/end` |
| ✅ Plan: Share live trip toggle | Creates tracking session; the phone's share menu sends the link (server texts to contacts only when `VITE_SERVER_SMS=true`) | RoadSoS `create-session` + **NEW** `POST /api/share-trip {sessionId, text}` |
| ✅ Place: Save | Toggle save, toast | EXISTS |
| ✅ Place: Add to plan / Directions / nearest hospital | | EXISTS / OSRM / emergency-services |
| ✅ Place: Also nearby / Food nearby | Cards open the place, “+” adds to a chosen day, “See on map” opens Map at the place | **NEW** `GET /api/places/:id/nearby`; Map `?at=lat,lng` |
| ✅ Place: Been here? / Mark as visited | Confirm sheet → stamp + XP once, ticked in the plan; shows “Visited · date” after | **NEW** `POST /api/places/:id/visit` |
| ✅ Profile: Places visited | Every stamp by month with date, area, XP; summary (n of N stamps, XP, categories); Classic row + Deccan “See all” | EXISTS `GET /api/users/me/stamps` (EXTEND with area, xp) |
| ✅ Place: Google photo, rating, open now | Real photo with credit; “★ 4.6 · 71,181 reviews · Open now”; Google Maps link | **NEW** `GET /api/google/places/:id` |
| ✅ Place: Side quests + Food nearby (Google) | Photo cards with rating, distance, open now; tap → side quest page | **NEW** `GET /api/google/places/:id/nearby` |
| ✅ Side quest page | Photos, rating, hours, address, Directions / Open in Google Maps, Been here? +10 XP once | **NEW** `GET /api/google/spots/:id`, `POST …/visit`, `GET /api/google/photo` |

### SOS (works logged-out and offline)
| Control | Behaviour | Backend |
|---|---|---|
| ✅ SOS button / shake (15 g, if enabled) | 5-s countdown; haptics | port from RoadSoS frontend |
| ✅ At 0 | `tel:112`; in parallel start tracking session, alert contacts with live link, share medical profile with session | RoadSoS `create-session` + **NEW** `POST /api/sos/alert` (SMS to contacts as a backup); back from the call, `sms:` opens with every contact and the alert prefilled, sent from the phone (works with no data); “Text my contacts” button |
| ✅ 108 / 100 / 1091 / Call 112 now | `tel:` links | — |
| ✅ I'm safe, cancel | Cancels countdown; if already sent, sends “I'm safe” to contacts | **NEW** `POST /api/sos/cancel` |

### Settings
| Control | Behaviour | Backend |
|---|---|---|
| ✅ Edit profile: photo sheet (camera / gallery / remove) | `<input type="file" accept="image/*" capture>`; upload | **NEW** `POST /api/users/me/avatar` (S3/Cloudinary) |
| ✅ Edit profile: fields, interests, Save | | **NEW** `PATCH /api/users/me` |
| ✅ Contacts: list, call, edit, add (max 5), primary | | **NEW** `GET/POST/PATCH/DELETE /api/contacts` |
| ✅ Contacts: Text contacts from my phone toggle | user setting (`smsWhenOffline`) | `PATCH /api/users/me` |
| ✅ Contacts: Send test alert | Text marked TEST, from the phone's messaging app (server SMS when `VITE_SERVER_SMS=true`) | **NEW** `POST /api/contacts/test-alert` (rate-limited) |
| ✅ Medical: blood group, fields, lock-screen toggle, Save | | **NEW** `GET/PUT /api/medical` |
| ✅ Offline packs: download / delete / undo / auto-download | Service worker caches map tiles for a bbox + places + hospitals + numbers; store size in IndexedDB | **NEW** `GET /api/offline-pack/:areaId` (JSON bundle) |
| ✅ Language | i18next (move existing translations.js to i18next; reuse RoadSoS 22 locales) | `PATCH /api/users/me {language}` |
| ✅ App theme | `setTheme()`, persist locally + to profile | `PATCH /api/users/me {theme}` |
| ✅ Shake to SOS / Trip reminders toggles | | `PATCH /api/users/me` (reminders → web push later) |
| ✅ Sign out | Clear JWT; keep contacts/medical/offline packs cached on device | — |
| ✅ Delete my account (link in the sign-out sheet; no mockup) | Type DELETE → erase account, contacts, medical, plans, photo, sessions, SOS records; clear the device contact copy (DPDP Act, Play Store) | `DELETE /users/me` |
| ✅ Terms / Privacy links (Sign up, Almost there) | Open `/terms` and `/privacy` (no mockup; theme tokens only) | — |
| ✅ Reviews and photos on Google Maps (Place) · Open in Google Maps (Directions) | Hand-off by Google Maps URL (no API key): place listing by name; turn-by-turn in walking / driving mode | — |
| ✅ Passport (Deccan): stamps grid, XP bar | | EXISTS `/users/stats` (EXTEND with stamps) |

## 4. Non-functional

- Rate-limit OTP, test alerts and SOS alerts (express-rate-limit / Redis).
- All new endpoints validated (zod), JWT-protected except auth, places, emergency-services, SOS.
- PWA: cache emergency numbers + last known nearby hospitals so SOS works with no network.
- Reduced motion respected; tap targets ≥ 44 px; every icon-only button has `aria-label` (already in the designs).
- Env vars to add: `GOOGLE_CLIENT_ID`, `SMS_PROVIDER_KEY`, `EMAIL_API_KEY`, `SAFETY_SERVICE_URL`, `UPLOADS_BUCKET`, `MEDICAL_ENC_KEY`.
