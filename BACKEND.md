# Pune Tour Guide — Backend Tech Stack & API Design

## Recommended Stack

### Runtime & Framework
| Layer | Technology | Why |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Fast I/O, huge ecosystem, JS everywhere |
| Framework | **Express.js** or **Fastify** | Lightweight REST APIs; Fastify is ~2x faster |
| Language | **TypeScript** | Type safety, better IDE support |

### Database
| Purpose | Technology | Why |
|---|---|---|
| Primary DB | **PostgreSQL** (Supabase or self-hosted) | Relational data, PostGIS for geolocation |
| Geospatial queries | **PostGIS extension** | `ST_Distance`, `ST_Within` — find nearby places |
| Caching | **Redis** | Cache hot place data, rate limiting, sessions |
| Search | **PostgreSQL Full-text Search** or **Meilisearch** | Fast place name/description search |

### Authentication
- **Supabase Auth** (recommended for quick start) — supports Google, OTP/phone (common in India)
- Or **JWT + bcrypt** custom auth with refresh token rotation

### File Storage (for place images)
- **Cloudinary** — image upload, resize, CDN delivery
- Or **AWS S3 + CloudFront**

### Maps & Location
- **Google Maps Platform** — Directions API, Places API, Geocoding
- Or **OpenStreetMap + OSRM** (free, self-hosted routing)

---

## Project Structure

```
pune-tour-backend/
├── src/
│   ├── routes/
│   │   ├── places.ts       # GET /places, GET /places/:id
│   │   ├── itinerary.ts    # CRUD /itinerary
│   │   ├── search.ts       # GET /search?q=shaniwar
│   │   ├── events.ts       # GET /events
│   │   └── auth.ts         # POST /auth/login, /auth/register
│   ├── controllers/        # Business logic
│   ├── models/             # DB schema / ORM models
│   ├── middleware/
│   │   ├── auth.ts         # JWT verify middleware
│   │   └── rateLimiter.ts  # Redis rate limiter
│   ├── services/
│   │   ├── mapsService.ts  # Google Maps API calls
│   │   └── cacheService.ts # Redis helpers
│   └── app.ts              # Express app setup
├── prisma/
│   └── schema.prisma       # Database schema (ORM)
├── .env
└── package.json
```

---

## Core API Endpoints

### Places
```
GET    /api/places                  # All places (paginated)
GET    /api/places?category=Heritage&lat=18.5&lng=73.8  # Filtered + nearby
GET    /api/places/:id              # Single place detail
POST   /api/places                  # Admin: add place
PUT    /api/places/:id              # Admin: update place
DELETE /api/places/:id              # Admin: delete place
```

### Search
```
GET    /api/search?q=shaniwar&limit=10
```

### Itinerary
```
GET    /api/itinerary               # Get user's saved itineraries
POST   /api/itinerary               # Create new itinerary
PUT    /api/itinerary/:id           # Update itinerary
DELETE /api/itinerary/:id           # Delete itinerary
POST   /api/itinerary/:id/stops     # Add a stop
DELETE /api/itinerary/:id/stops/:stopId
```

### Events
```
GET    /api/events                  # Upcoming events in Pune
GET    /api/events?date=2026-06-14
```

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me                 # Get current user profile
```

### Route Planning
```
POST   /api/route/plan
       Body: { stops: [placeId1, placeId2, ...], mode: "walking" }
       Returns: { distance, duration, polyline, steps[] }
```

---

## Prisma Database Schema

```prisma
model Place {
  id          String   @id @default(cuid())
  name        String
  description String
  category    String
  emoji       String
  lat         Float
  lng         Float
  address     String
  rating      Float    @default(0)
  entryFee    String
  hours       String
  phone       String?
  imageUrl    String?
  accessible  Boolean  @default(false)
  guidedTours Boolean  @default(false)
  estYear     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  stops       ItineraryStop[]
}

model User {
  id          String      @id @default(cuid())
  name        String
  email       String      @unique
  password    String?
  provider    String?     @default("email")
  createdAt   DateTime    @default(now())
  itineraries Itinerary[]
}

model Itinerary {
  id        String   @id @default(cuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  startDate DateTime?
  endDate   DateTime?
  createdAt DateTime @default(now())
  stops     ItineraryStop[]
}

model ItineraryStop {
  id           String    @id @default(cuid())
  itineraryId  String
  itinerary    Itinerary @relation(fields: [itineraryId], references: [id])
  placeId      String
  place        Place     @relation(fields: [placeId], references: [id])
  visitTime    String?
  dayNumber    Int       @default(1)
  order        Int       @default(0)
  done         Boolean   @default(false)
}

model Event {
  id          String   @id @default(cuid())
  name        String
  description String
  date        DateTime
  venue       String
  category    String
  imageUrl    String?
  createdAt   DateTime @default(now())
}
```

---

## Environment Variables (.env)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pune_tour"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret_key"
JWT_EXPIRES_IN="7d"
GOOGLE_MAPS_API_KEY="your_google_maps_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=3000
```

---

## Quick Start Commands

```bash
# 1. Init project
mkdir pune-tour-backend && cd pune-tour-backend
npm init -y
npm install express cors helmet dotenv jsonwebtoken bcryptjs prisma @prisma/client redis ioredis
npm install -D typescript ts-node @types/express @types/node nodemon

# 2. Setup Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# 3. Run dev server
npm run dev
```

---

## Full Tech Stack Summary

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + TypeScript + Express/Fastify |
| ORM | Prisma |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| Auth | JWT + Supabase Auth |
| Storage | Cloudinary |
| Maps | Google Maps Platform |
| Search | PostgreSQL FTS or Meilisearch |
| Deployment | Railway / Render / AWS EC2 |
| CI/CD | GitHub Actions |
