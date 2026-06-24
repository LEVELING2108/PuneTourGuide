# 🏰 Pune Explorer — A Modern Tour Guide for Pune

---

### **[Backend Architecture](./BACKEND.md)** · **[Contribution Guidelines](./GEMINI.md)**

---

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?&style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

**Pune Explorer** is a dynamic, full-stack tour guide application built to showcase a seamless, high-performance user experience. It features a React/Vite frontend and a powerful Node.js/Express/Prisma backend, all communicating to bring the best of Pune's heritage, food, and events to your fingertips.

This project has evolved from a static prototype into a database-driven, cache-accelerated system with intelligent, real-time data discovery.

## ✨ Core Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **OSRM Street Routing** | Replaces straight lines with real-road street routing paths mapped on Leaflet using the free OSRM engine. | ✅ Done |
| **Interactive Map Popups** | Custom Leaflet popup actions on map pins for quick itinerary additions and removals. | ✅ Done |
| **Floating Navigation Card** | Real-time distance and duration calculations for Walking, Auto, and Driving with direct Google Maps multi-point route shortcuts. | ✅ Done |
| **Check-Off Animations** | Gamified stops checklist on the Map screen triggering score feedback highlights and `+50 Pts!` bounce-up effects. | ✅ Done |
| **Itinerary Stop Deletion** | Direct stop removal options (trash icon) from both the Map list and the Itinerary timeline screen, with real-time UI updates. | ✅ Done |
| **Interactive Leaflet Map** | Live, interactive map with custom-styled markers for all tourist spots. Filterable by category. | ✅ Done |
| **Auto-Discovery System** | If a category has too few places, the app **automatically queries OpenStreetMap** in the background to find and save new locations. | ✅ Done |
| **High-Performance Caching** | Uses a **Redis** cache to deliver popular API requests in **under 20ms**, eliminating database bottlenecks. | ✅ Done |
| **Dynamic Itineraries** | Add places to a multi-day itinerary. Your plan is saved to the database and is accessible on the Plan & Map screens. | ✅ Done |
| **Dual-Language Support** | Full UI and data translation for **English** and **Marathi** (मराठी), configurable in the Profile tab. | ✅ Done |
| **Geolocation & Distance** | Uses the browser's Geolocation API to find your location and calculate distances to nearby spots. | ✅ Done |
| **Strict Tourist Filtering** | Programmatically filters out irrelevant locations like housing societies, banks, and clinics to ensure high-quality results. | ✅ Done |

## 🚀 Tech Stack & Architecture

A high-level overview of the technologies used:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 18 (Vite)**, **Tailwind CSS** | Modern, fast, and scalable UI development. |
| **Backend** | **Node.js**, **Express**, **TypeScript** | Robust, type-safe, and efficient server-side logic. |
| **Database** | **PostgreSQL** with **PostGIS** | Reliable relational data storage with powerful geospatial querying. |
| **ORM** | **Prisma** | Next-generation ORM for type-safe database access. |
| **Caching** | **Redis** | High-speed in-memory cache for API query acceleration. |
| **Geospatial API** | **OpenStreetMap (Overpass API)** | For automatic discovery and hydration of new tourist locations. |
| **Mapping** | **React-Leaflet** | For rendering beautiful and interactive maps. |
| **Local Dev** | **Docker Compose**, **Vite**, **Nodemon** | For a consistent and fast local development environment. |

For a more detailed breakdown, see [**BACKEND.md**](./BACKEND.md).

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose (to run PostgreSQL and Redis)

### 1. Setup Backend & Database
```bash
# Start the database and cache server
# From the root directory:
docker-compose up -d

# Navigate to the backend folder
cd backend
npm install
```
Create a `.env` file in the `backend/` folder and populate it. A `DATABASE_URL` is provided for the Docker setup.
```env
# Connects to the PostgreSQL container from docker-compose.yml
DATABASE_URL="postgresql://user:password@localhost:5432/pune_tour_db?schema=public"

# Connects to the Redis container
REDIS_URL="redis://127.0.0.1:6379"

# Server port
PORT=3000
```
Run migrations to set up the schema and seed the database with initial data:
```bash
npx prisma migrate dev --name init
npx ts-node src/seed.ts
```

### 2. Setup Frontend
```bash
# In the root directory (one level above backend)
npm install
```

### 3. Run Development Servers
You need two terminals open.

**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
```
*Backend will be available at `http://localhost:3000`.*

**Terminal 2: Start Frontend**
```bash
# From the root directory
npm run dev
```
*Frontend will be available at `http://localhost:5173`.*

## 🤝 Contribution
This project is architected to be clean, maintainable, and scalable. For detailed workflow and branching strategy, please see the **[Contribution Guidelines](./GEMINI.md)**.
