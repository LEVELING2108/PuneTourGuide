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
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

---

## ✨ Core Features

* **Interactive Leaflet Map & Popups:** Live map with custom marker categories, emojis, and quick "Add to Itinerary" / "Remove stop" CTA buttons.
* **OSRM Street Routing:** Dynamic road-routing paths along real Pune streets instead of straight lines.
* **Floating Navigation Card:** Real-time distance and duration calculations for Walking, Auto, and Driving with direct Google Maps direction shortcuts.
* **Auto-Discovery System:** Automatically queries OpenStreetMap (Overpass API) in the background to hydrate database categories when counts are low.
* **Redis Performance Caching:** Accelerated API responses served under 20ms using Redis (`places:v5:`).
* **Strict Geolocation & Distance:** Uses browser Geolocation and PostGIS to sort tourist spots by proximity.
* **Check-Off Animations:** Gamified checklist on the Map screen triggering score feedback highlights and `+50 Pts!` bounce-up effects.
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
PORT=3000
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
Install dependencies and run the Vite dev server:
```bash
npm install
npm run dev
```

* **Frontend Port:** `http://localhost:5173/`
* **Backend API Port:** `http://localhost:3000/`
