# 🏰 Pune Explorer

A travel guide for Pune where help is always one tap or one shake away, even offline. Pune Explorer merges PuneTourGuide (places, day plans, XP) with RoadSoS (SOS, live location, nearby hospitals), with two themes: Classic and Deccan.

---

### **[Technical Design](./design-reference/TECH_DESIGN.md)** · **[Feature Spec](./design-reference/FEATURES.md)** · **[Backend Architecture](./BACKEND.md)** · **[Contribution Guidelines](./CONTRIBUTING.md)** · **[Changelog](./CHANGELOG.md)**

---

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg?style=flat-square)](./CHANGELOG.md)
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

Pune Explorer is an npm-workspaces monorepo:

```
apps/web/            React PWA (Vite)
services/tour-api/   Express + Prisma + PostGIS API (places, plans, accounts)
services/safety/     FastAPI safety service from RoadSoS (emergency services, live tracking)
design-reference/    Approved UI mockups + TECH_DESIGN.md / FEATURES.md (source of truth)
```

### Prerequisites
Install these once:
- **Node.js 20+** (with npm): https://nodejs.org
- **Python 3.12+**: https://www.python.org/downloads/ (on Windows, tick "Add python.exe to PATH")
- **Docker Desktop**, running: https://www.docker.com/products/docker-desktop/

### First run (one command)

```bash
npm run setup
```

It checks the tools, then:
- **Settings:** creates the `.env` files, with random development secrets.
- **Database:** starts this project's own **PostgreSQL + PostGIS (port 5440)** and **Redis (port 6390)** in Docker, applies the migrations and loads the 26 curated places.
- **Safety service:** builds its Python environment.
- **Help points:** imports Pune's real hospitals, clinics, police and fire stations from OpenStreetMap, which takes a few minutes.

It's safe to run again. Add `--skip-help` to skip the OpenStreetMap import, or `--no-docker` to use your own PostgreSQL and Redis from `services/tour-api/.env`.

### Every day

```bash
npm run dev          # starts the web app, Tour API and safety service together
```

Open **http://localhost:5050**. On a phone on the same Wi-Fi, open `http://<your computer's IP>:5050`. Location, the camera and installing the app need HTTPS on a phone, so test those on `localhost` or a deployed site.

- **Stop:** press `Ctrl+C` to stop the apps. `npm run db:down` stops the database and Redis; `npm run db:up` starts them again (no setup needed).
- **No SMS is sent locally:** login codes, SOS alerts and reset links are printed in the terminal (phone numbers masked). On Log in → Mobile, the code also shows on screen.

### Something not working?

| Problem | Fix |
| :--- | :--- |
| `Docker is not running` | Start Docker Desktop, wait for it to say "running", run `npm run setup` again |
| `Port 5050 / 3001 / 8010 is already in use` | Another copy is still running: close the other terminal, or restart the computer |
| Explore is empty | `npm run seed -w services/tour-api` |
| Help nearby is empty | `npm run refresh:help` (needs internet; the public servers are sometimes busy, so try again later) |
| Map has no streets | Your internet connection: map tiles come from OpenStreetMap |
| After pulling new code | `npm install` then `npm run prisma:deploy` |

### Scripts

| Command | What it does |
| :--- | :--- |
| `npm run setup` | One-time local setup (see above); safe to re-run |
| `npm run dev` | Web, Tour API and Safety service together |
| `npm run db:up` / `db:down` | Start / stop this project's PostgreSQL and Redis containers |
| `npm run dev:web` / `dev:api` / `dev:safety` | One of them |
| `npm run lint` · `npm run typecheck` · `npm test` | Checks for web + tour-api |
| `npm run build` · `npm run build:api` | Production builds |
| `npm run prisma:deploy` | Apply database migrations |
| `npm run worker -w services/tour-api` | Dedicated SMS worker process (optional; the API runs one by default) |
| `npm run refresh:help` | Import Pune's help points from OpenStreetMap and refresh each place's nearest hospital. Run nightly in production; a failed or partial download keeps the existing data |
| `npm run load-test` | Load test the read paths (Explore, place, help, health) |
| `npm run icons` | Regenerate app icons from `apps/web/art/icon-source.png` |
| `npm run android:apk -w apps/web` | Android test APK (see docs/LAUNCH_SETUP.md step 23) |
| `docker compose up` | PostGIS, Redis, Tour API and Safety service all in containers |

### Before going to production

The full step-by-step list, with a real-world check for each service, is in **[docs/LAUNCH_SETUP.md](./docs/LAUNCH_SETUP.md)**. In short:

- **Map tiles:** set `VITE_MAP_TILE_URL` (and `VITE_MAP_TILE_ATTRIBUTION`) to a tile provider with your key. The default OSM tile server is for development only.
- **Routing:** set `OSRM_URL` / `OSRM_FOOT_URL` to a provider or self-hosted OSRM. The defaults are public demo servers.
- **Overpass:** set `OVERPASS_ENDPOINTS` for the safety service and the import, ideally a self-hosted instance.
- **Redis** is required with more than one API instance (shared rate limits, cooldowns, caches, the SMS queue, live-location fan-out).
- **SMS:** set `SMS_PROVIDER` + `SMS_API_KEY` (Twilio, or MSG91 with DLT templates). Without them SOS alerts are only printed to the log.
- **Safety service:** set `ALLOWED_ORIGINS` to the app's origin(s).
- **Offline map tiles:** offline packs always save places, hospitals, police and emergency numbers. They save map tiles only with `VITE_MAP_TILES_OFFLINE=true` and a tile provider whose terms allow offline caching.
- **Translations:** the SOS screen is translated into Marathi, Hindi and Gujarati (`apps/web/src/i18n/locales`). Have a native speaker review them before launch; the rest of the UI is English for now.
- **Workers:** at scale run `npm run worker -w services/tour-api` separately and set `RUN_WORKERS=false` on API instances.

---

## 🌐 Ports

| Component | URL |
| :--- | :--- |
| Web app | `http://localhost:5050` |
| Tour API | `http://localhost:3001/api` |
| Safety service | `http://localhost:8010` (`/health`, `/api/emergency-services`, `/ws/track/{id}`); the web app reaches it at `/safety` |
| PostgreSQL + PostGIS | `localhost:5440` (user `postgres`, password `password`, database `Pune_Tour_Guide`; development only) |
| Redis | `localhost:6390` |

These ports avoid the usual ones (5432, 6379, 8000), so a PostgreSQL installed on your computer or other projects' containers never clash with this one.

---

## 🤝 Contributors & Special Thanks

A huge **thank you** to all contributors who have dedicated their time, knowledge, and code to making **Pune Explorer** an open-source, tourist-first platform!

### 🌟 Project Contributors

* **[Sourav Suman (@LEVELING2108)](https://github.com/LEVELING2108)** — Project creator & maintainer: core architecture, live OpenStreetMap viewport discovery engine, dual node/way spatial centroid processing, strict negative keyword filtering, itinerary TSP optimization, and security hardening.
* **[Sanika Darekar (@sanikadarekar)](https://github.com/sanikadarekar)** — Key contributor: Multi-container Docker Compose setup (`PostgreSQL + PostGIS` & `Redis`), developer-first [`CONTRIBUTING.md`](./CONTRIBUTING.md) guidelines, synchronized backend schemas & API endpoint specifications, and root environment configurations.

We warmly welcome all contributions! Whether reporting bugs, refining Marathi/Hindi translations, adding hidden gems of Pune, or writing code, check out our **[Contribution Guidelines](./CONTRIBUTING.md)** and **[Changelog](./CHANGELOG.md)**.

---

## 📜 License & Sourcing

- **Map & Geocoding Data:** [OpenStreetMap](https://www.openstreetmap.org/) via Overpass API & OSRM.
- **Project License:** Open-source under ISC License.

