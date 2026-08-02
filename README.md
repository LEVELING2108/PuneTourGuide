# 🏰 Pune Explorer

A modern, high-performance tour guide web application for Pune, featuring interactive maps, dynamic itinerary planning, OpenStreetMap auto-discovery, weather-adaptive routing, and gamification.

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
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-FF6F00?style=flat-square&logo=progressive-web-apps&logoColor=white)](#)

---

## ✨ Core Features

* **📱 Immediate Dashboard Access:** Direct entry to the main dashboard without mandatory authentication barriers.
* **⚡ Route Sequence Optimization (OSRM Trip API):** Solves the Traveling Salesperson Problem (TSP) on the fly for active itinerary stops, ordering them by the shortest physical distance.
* **⛶ Interactive Map UI/UX:** Full-screen Leaflet integration with customizable pin badges (`①`, `②`, `③`), category filtering, and turn-by-turn routing polylines.
* **📋 Turn-by-Turn Routing & Directions:** Step-by-step navigation instructions from OSRM displayed directly inside the app, localized in 15+ languages.
* **🏆 Persistent Gamification & Punekar Levels:** Tracks XP (`+50 XP` per stop, `+10 XP` per saved spot) and ranks users with titles such as *Navin Punekar*, *Shiledar*, and *Puneri Legend*.
* **🌲 OpenStreetMap (OSRM & Overpass) Sourcing:** Queries live tourist destinations (Heritage, Nature, Temple, Food, Wellness) with strict negative filtering against non-tourist locations.
* **📱 Progressive Web App (PWA) Support:** Service worker caching, offline capability, standalone mobile app layout, and brand icons.
* **🌐 Multilingual Localization:** Full translation support for English, Marathi (मराठी), Hindi, Gujarati, Tamil, Telugu, and 9+ regional languages.

---

## 🛠️ Local Setup Guide

Follow these steps to run Pune Explorer locally on your development machine.

### 📋 Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18.0 or higher) & **npm**
- **PostgreSQL** database (v14+ recommended, with PostGIS extension for spatial queries)
- **Redis** server (optional, used for Overpass API rate-limit caching)
- **Git**

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/LEVELING2108/PuneTourGuide.git
cd "Pune Tour Guide"
```

---

### 2️⃣ Environment Variables Setup

#### **Backend (`backend/.env`)**
Create a `.env` file inside the `backend/` directory:

```env
# Database connection string (PostgreSQL with PostGIS)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pune_tour_guide?schema=public"

# Server Port
PORT=3001

# Secret key for JWT signing
JWT_SECRET="pune_explorer_super_secret_key"

# Redis connection URL (optional for caching)
REDIS_URL="redis://127.0.0.1:6379"
```

#### **Frontend (`.env`)**
Create a `.env` file in the root project directory:

```env
# API URL pointing to the local Node/Express server
VITE_API_BASE_URL=http://localhost:3001/api
```

---

### 3️⃣ Backend Setup & Database Migration

Navigate to the backend directory, install dependencies, run Prisma migrations, and seed initial data:

```bash
# Navigate to backend
cd backend

# Install node dependencies
npm install

# Generate Prisma Client & Run Database Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed database with initial tourist places, events, and default itineraries
npx ts-node src/seed.ts

# Start backend server in development mode (with nodemon)
npm run dev
```

*The backend server will run on `http://localhost:3001`.*

---

### 4️⃣ Frontend Setup & Execution

Open a new terminal window in the project root directory and start the Vite dev server:

```bash
# From project root directory
npm install

# Start Vite dev server
npm run dev
```

*The frontend application will open on `http://localhost:5173`.*

---

### 5️⃣ Quick Verification & Scripts

You can also run all-in-one scripts from the root directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite frontend dev server |
| `npm run build` | Builds production frontend bundle (`dist/`) |
| `npm run build:backend` | Compiles backend TypeScript to JavaScript (`backend/dist/`) |
| `npm run build:all` | Installs, generates Prisma client, and builds both backend & frontend |
| `npm run prisma:generate` | Generates Prisma client inside `backend/` |
| `npm run prisma:deploy` | Deploys Prisma migrations to database |

---

## 🌐 API Ports & Services Summary

| Component | URL / Address | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React 18 + Vite local UI |
| **Backend Express API** | `http://localhost:3001/api` | REST API Endpoints |
| **PostgreSQL Database** | `localhost:5432` | Main database (`pune_tour_guide`) |
| **Redis Cache** | `localhost:6379` | Key-value store (prefix `places:v5:`) |

---

## 📜 License & Sourcing

- **Map & Geocoding Data:** [OpenStreetMap](https://www.openstreetmap.org/) via Overpass API & OSRM.
- **Project License:** Open-source under ISC License.
