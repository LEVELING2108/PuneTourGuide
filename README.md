# 🏰 Pune Explorer

A modern, high-performance tour guide application for Pune, featuring an interactive map, dynamic itineraries, auto-discovery caching, and gamification.

---

### **[Backend Architecture](./BACKEND.md)** · **[Contribution Guidelines](./GEMINI.md)**

---

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

---

## ✨ Core Features

* **🔑 User Authentication (JWT & Hashed Passwords):** Full registration and login screen (localized in English/Marathi). JWT bearer tokens protect user data, and new registrations are pre-seeded with custom Day 1 & Day 2 tourist itineraries.
* **⚡ Route Sequence Optimization (OSRM Trip API):** Solves the Traveling Salesperson Problem (TSP) on the fly for your active stops. Clicking **Optimize Route ⚡** sorts stops in the database by their physically shortest route (keeping the first stop fixed).
* **⛶ Immersive Map UI/UX:** Features a floating expand/collapse button to scale the map to full layout height, numbered pin badges (`①`, `②`, `③`) for stops, and flowing polyline animation showing travel direction.
* **📋 Collapsible Turn-by-Turn Directions:** Displays turn-by-turn routing steps from OSRM directly in a scrollable list inside the app, complete with English/Marathi translations.
* **🏆 Persistent Gamification:** User profiles save and track XP (completed stops award `+50 XP`, bookmarking a place awards `+10 XP`) persisting in the PostgreSQL database.
* **🌲 OSM Discovery & Caching:** Queries OpenStreetMap (Overpass API) to automatically populate new coordinates, throttled by a 5-minute Redis cooldown cache per query to protect API rate limits.
* **Dual-Language Support:** Fully localized English and Marathi (मराठी) translation support.

---

## 🚀 Setup & Execution

### 1. Database & Cache Services
Spin up PostgreSQL (with PostGIS) and Redis in Docker:
```bash
docker-compose up -d
```

### 2. Run Backend API
Create `backend/.env` file:
```env
DATABASE_URL="postgresql://postgres:Pune%400804@localhost:5432/Pune_Tour_Guide?schema=public"
PORT=3001
JWT_SECRET="pune_explorer_super_secret_key"
REDIS_URL="redis://127.0.0.1:6379"
```
Install dependencies, run migrations, and start the development server:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node src/seed.ts
npm run dev
```

### 3. Run Frontend Web App
Configure root `.env` environment variables:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```
Install dependencies and run the Vite dev server:
```bash
npm install
npm run dev
```

* **Frontend Port:** `http://localhost:5173/`
* **Backend API Port:** `http://localhost:3001/`
