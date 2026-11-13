# Pune Tour Guide — Backend Tech Stack & API Design

## Implemented Stack

### Runtime & Framework
- Runtime: **Node.js 22**
- Framework: **Express.js**
- Language: **TypeScript**

### Database & Caching
- Relational DB: **PostgreSQL**
- ORM: **Prisma**
- Geolocation: **PostGIS** extension for nearby calculations
- Cache Store: **Redis** (shared rate limits, caches, cooldowns and the SMS queue across every API instance)

### Authentication & Routing
- Security: **JWT + bcryptjs** password hashing
- Maps/Routing: **OpenStreetMap (Overpass API) + OSRM (Open Source Routing Machine)**

---

## Project Structure

```
services/tour-api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # One migration per schema change
├── src/
│   ├── v1/                 # The API, one folder per area: *.routes.ts → *.service.ts → *.repository.ts
│   ├── middleware/         # requireAuth, validate (Zod), limits (rate limits on Redis), errorHandler
│   ├── clients/            # Outside services: SMS, email, Google Places, OSRM, Nominatim, Overpass, weather
│   ├── lib/                # Tokens, logger, errors, landing-page host, Sentry
│   ├── scripts/            # Nightly jobs and one-off tools (refresh-help, cleanup, waitlist-export)
│   ├── app.ts              # Express app: security headers, CORS, landing host, /api/v1
│   ├── server.ts           # HTTP server (graceful shutdown)
│   └── worker.ts           # SMS queue worker
└── test/                   # Vitest + supertest against a real PostGIS test database
```

---

## API (`/api/v1`)

Every response is `{ data, meta? }` or `{ error: { code, message } }`. Protected endpoints take
`Authorization: Bearer <access token>` (15 minutes; renewed through the httpOnly refresh cookie at
`/auth/refresh`). Full behaviour per screen: [design-reference/FEATURES.md](./design-reference/FEATURES.md).

| Area | Endpoints |
| :--- | :--- |
| Health | `GET /health/live`, `GET /health/ready` (database + Redis) |
| Accounts | `POST /auth/register`, `/auth/login`, `/auth/otp/send`, `/auth/otp/verify`, `/auth/google`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/refresh`, `/auth/logout` |
| Profile | `GET/PATCH/DELETE /users/me`, `POST/DELETE /users/me/avatar`, `GET /users/me/stamps`, `GET /users/me/stats` |
| Places | `GET /places` (search, category and filters), `/places/count`, `/places/categories`, `/places/:id`, `/places/:id/nearby`; `POST /places/:id/visit`; `PUT/DELETE /places/:id/save` |
| Google data | `GET /google/places/:id`, `/google/places/:id/nearby`, `/google/spots/:googleId`, `/google/photo`; `POST /google/spots/:googleId/visit` |
| Routes | `GET /routes` (curated routes) |
| Plan & trip mode | `GET /itinerary`; `POST/PATCH/DELETE /itinerary/stops…`; `POST /itinerary/optimize`, `/itinerary/from-route/:id`, `/itinerary/days/:id/start`; `GET /itinerary/run`; `POST /itinerary/runs/:id/skip`, `/itinerary/runs/:id/end` |
| Help | `GET /help` (hospitals, police, fire near a point) |
| SOS & live trips | `POST /sos/alert`, `/sos/cancel`; `GET/POST /share-trip`, `GET /share-trip/:sessionId/delivery`, `DELETE /share-trip/:sessionId` |
| Contacts & medical | `/contacts` (list, add, edit, delete, test alert), `/medical` (get, save, delete) |
| Maps | `GET /directions`, `GET /geocode`, `GET /weather`, `/offline-packs` |
| Waitlist | `POST /waitlist` (landing page) |

The pre-2.0 routes (`/api/places`, `/api/events`, `/api/itinerary`, `/api/user`, `/api/weather`) were
removed in November 2026: nothing used them, and their login issued 7-day tokens that bypassed
session revocation. `GET /api/health` remains.

---

## Active Prisma Database Schema

```prisma
model Place {
  id             Int              @id @default(autoincrement())
  name           String
  name_mr        String?
  emoji          String
  category       String
  rating         Float
  distance       String
  entryFee       String
  estYear        String
  visitTime      String
  hours          String
  phone          String
  address        String
  accessible     Boolean
  guidedTours    Boolean
  tag            String
  tagColor       String
  bgColor        String
  description    String
  description_mr String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  isSaved        Boolean          @default(false)
  osmId          String?          @unique
  latitude       Float?
  longitude      Float?
  location       Unsupported("geometry(Point, 4326)")?
  savedBy        UserSavedPlace[]
}

model Event {
  id        Int      @id @default(autoincrement())
  date      String
  name      String
  desc      String
  color     String
  createdAt DateTime @default(now())
}

model User {
  id            Int              @id @default(autoincrement())
  name          String
  email         String           @unique
  password      String
  xp            Int              @default(0)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  itineraryDays ItineraryDay[]
  savedPlaces   UserSavedPlace[]
}

model UserSavedPlace {
  id        Int      @id @default(autoincrement())
  userId    Int
  placeId   Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)

  @@unique([userId, placeId])
}

model ItineraryDay {
  id      Int             @id @default(autoincrement())
  day     Int
  label   String
  userId  Int?
  user    User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  stops   ItineraryStop[]
}

model ItineraryStop {
  id             Int          @id @default(autoincrement())
  time           String
  name           String
  name_mr        String?
  desc           String
  desc_mr        String?
  dotColor       String
  itineraryDayId Int
  tags           Json
  done           Boolean      @default(false)
  order          Int          @default(0)
  itineraryDay   ItineraryDay @relation(fields: [itineraryDayId], references: [id], onDelete: Cascade)
}
```

---

## Redis

Redis is shared by every API instance, so limits and caches hold however many instances run:
- **Rate limits** (`middleware/limits.ts`): login, OTP, password reset, SOS, test alerts, sign-ups,
  the waitlist and expensive reads; keys are hashed, so no email or phone number is stored in clear.
- **Caches**: place lists and details, Google data (with daily call caps), weather.
- **Cooldowns and counters**: e.g. test alerts per day.
- **SMS queue** (BullMQ) and live-location fan-out.

If Redis is down, limits fall back to per-instance memory (looser, never blocking SOS).
