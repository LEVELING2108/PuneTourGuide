# Pune Tour Guide — Backend Tech Stack & API Design

## Implemented Stack

### Runtime & Framework
- Runtime: **Node.js 20**
- Framework: **Express.js**
- Language: **TypeScript**

### Database & Caching
- Relational DB: **PostgreSQL**
- ORM: **Prisma**
- Geolocation: **PostGIS** extension for nearby calculations
- Cache Store: **Redis** (used for endpoint output caching and OSM discovery throttling)

### Authentication & Routing
- Security: **JWT + bcryptjs** password hashing
- Maps/Routing: **OpenStreetMap (Overpass API) + OSRM (Open Source Routing Machine)**

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Active database schema
│   └── migrations/         # PostgreSQL schema migration scripts
├── src/
│   ├── middleware/
│   │   └── auth.ts         # JWT bearer token verification
│   ├── routes/
│   │   ├── userRoutes.ts   # /api/user routes
│   │   ├── placeRoutes.ts  # /api/places routes
│   │   └── itineraryRoutes.ts # /api/itinerary routes
│   ├── controllers/
│   │   ├── userController.ts  # Registration, login, profile stats
│   │   ├── placeController.ts # Nearby places, bookmark saves
│   │   └── itineraryController.ts # Stops, completions, OSRM TSP optimizer
│   ├── services/
│   │   ├── cacheService.ts    # Redis client connection and cache utility
│   │   └── overpassService.ts # OSM Overpass API caller + Redis cooldown throttling
│   └── app.ts              # Express initialization
├── .env
├── package.json
└── tsconfig.json
```

---

## Active API Endpoints

All protected endpoints require an `Authorization` header containing `Bearer <JWT_TOKEN>`.

### 🔑 Authentication (`/api/user`)
- `POST   /api/user/register`  
  Registers a new user and pre-seeds standard Day 1 & Day 2 travel itineraries.
- `POST   /api/user/login`  
  Verifies credentials, returning user profile details and JWT token.
- `GET    /api/user/me` (Protected)  
  Fetches the authenticated user profile.
- `GET    /api/user/stats` (Protected)  
  Computes user progress: counts of saved spots, completed stops, levels, and persistent XP.

### 🏰 Places (`/api/places`)
- `GET    /api/places`  
  Fetches all spots (supports `?category=Heritage|Temple|Nature|Food|Wellness` & search query `?q=`).
- `GET    /api/places/:id`  
  Fetches individual tourist details.
- `PATCH  /api/places/:id/save` (Protected)  
  Toggles saved/bookmarked state. Increments profile XP by `+10 XP` on a new save.

### 📅 Itineraries & Stops (`/api/itinerary`)
- `GET    /api/itinerary` (Protected)  
  Fetches the authenticated user's itinerary days and stops.
- `POST   /api/itinerary/stops` (Protected)  
  Adds a new custom stop to the active day.
- `PATCH  /api/itinerary/stops/:id` (Protected)  
  Toggles stop checkbox status. Checking off a stop increments profile XP by `+50 XP`.
- `DELETE /api/itinerary/stops/:id` (Protected)  
  Deletes the specified itinerary stop.
- `POST   /api/itinerary/optimize` (Protected)  
  Solves the Traveling Salesperson Problem (TSP) for active day stops using the OSRM Trip API (starting at the first stop). Updates stop `order` fields in the database.

---

## Active Prisma Database Schema

```prisma
model User {
  id        Int            @id @default(autoincrement())
  email     String         @unique
  password  String
  name      String
  xp        Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  days      ItineraryDay[]
}

model ItineraryDay {
  id        Int             @id @default(autoincrement())
  day       Int
  label     String
  userId    Int?
  user      User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  stops     ItineraryStop[]
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

model Place {
  id             Int      @id @default(autoincrement())
  name           String   @unique
  name_mr        String?
  description    String
  description_mr String?
  category       String
  emoji          String
  latitude       Float
  longitude      Float
  rating         Float
  address        String
  hours          String
  entryFee       String
  accessible     Boolean  @default(false)
  guidedTours    Boolean  @default(false)
  isSaved        Boolean  @default(false)
  isDiscovered   Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Redis Caching & Throttling
- **Cache Invalidation**: On place updates, the backend invalidates cached JSON listings using standard wildcards (`places:*`).
- **Discovery Throttling**: Background OSM fetches for queries/categories are throttled using a Redis cooldown key (e.g. `places:discovery:cooldown:cat:<category>`) set for **300 seconds (5 minutes)**. Subsequent requests during cooldown return cache hits, avoiding Overpass rate limits.
