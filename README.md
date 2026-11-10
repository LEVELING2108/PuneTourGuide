# 🏰 Pune Explorer

A travel guide for Pune where help is always one tap or one shake away, even offline. Pune Explorer merges PuneTourGuide (places, day plans, XP) with RoadSoS (SOS, live location, nearby hospitals), in two themes: Classic and Deccan.

**🌐 Website: [puneexplorer.dev](https://puneexplorer.dev)** · **📱 App: [app.puneexplorer.dev](https://app.puneexplorer.dev)** (installs on your phone from the browser; Android app coming, join the waitlist on the website)

---

**[Technical Design](./design-reference/TECH_DESIGN.md)** · **[Feature Spec](./design-reference/FEATURES.md)** · **[Launch & Server Setup](./docs/LAUNCH_SETUP.md)** · **[Backend Architecture](./BACKEND.md)** · **[Contribution Guidelines](./CONTRIBUTING.md)** · **[Changelog](./CHANGELOG.md)**

---

[![Version](https://img.shields.io/badge/version-2.0_alpha-blue.svg?style=flat-square)](./CHANGELOG.md)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_PostGIS-316192?style=flat-square&logo=postgresql&logoColor=white)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-installable_&_offline-FF6F00?style=flat-square&logo=progressive-web-apps&logoColor=white)](https://web.dev/explore/progressive-web-apps)

---

## ✨ What it does

### Discover Pune

* **52 hand-picked places** (forts, wadas, temples, gardens, food lanes), each with its nearest hospital, opening hours and the walk time to what's around it.
* **Places and food nearby**: every place lists up to six places and six food spots within 3 km, nearest first.
* **Real photos, ratings and "open now"** from Google Maps, with credit, and **side quests** (viewpoints, trails) you can tick off for +10 XP.
* **Search and filters**: category, distance, open now, free entry, wheelchair access, a hospital within 2 km.

### Plan and walk the day

* **Two-day plan**: add places to Day 1 or Day 2, or load a ready-made route.
* **Optimise** reorders the stops by real travel time and tells you how many minutes it saved.
* **Trip mode (Start Day)**: next stop, directions (in the app or Google Maps), and an "You've arrived?" prompt only after you've stayed near the stop for 30 seconds. Works with no signal and syncs later.
* **Share your live trip** with your emergency contacts through a private link that stops when the day ends.

### Help, even offline

* **SOS from any screen**, or by shaking the phone: a 5-second countdown to cancel, then the phone dials **112** itself. It works **logged out and offline**.
* **Your phone texts your emergency contacts** a live-location link, a map pin and the nearest hospital, even without mobile data.
* **Help nearby**: about 2,600 hospitals, clinics, police and fire stations across Pune district from OpenStreetMap, refreshed every night, with one-tap calling (112, 108, 100, 1091).
* **Medical info** (blood group, allergies, medicines) is encrypted on the server and only shared in an SOS, if you allow it.
* **Offline packs** keep places, hospitals, police and emergency numbers on the phone for forts with one bar of signal.

### Collect the city

* **Stamps and XP** for every place you visit (each place has its own XP), a **travel passport**, and levels from *Newcomer* to *Puneri Legend*.

### Your way

* **Two themes**: *Classic* (plain emerald) and *Deccan* (Paithani plum, haldi gold, Marathi labels).
* **Languages**: the SOS screens are in English, मराठी, हिंदी and ગુજરાતી; the rest of the app is in English for now.
* **Accounts**: email and password or Sign in with Google; phone login when a server SMS provider is set up. You can delete your account and data from Settings.

---

## 🧱 How it's built

| Part | What it is |
| :--- | :--- |
| `apps/web/` | The app: React + Vite PWA (installable, works offline with a service worker), Leaflet maps. The same code builds the Android app with Capacitor |
| `apps/landing/` | The website at puneexplorer.dev: static HTML/CSS, served by the API on the main domain |
| `services/tour-api/` | Express + TypeScript API: places, plans, trip mode, accounts, SOS alerts, waitlist. Prisma on PostgreSQL + PostGIS, Redis for shared rate limits and caches, BullMQ for the SMS queue |
| `services/safety/` | FastAPI service from RoadSoS: emergency-service lookup and live-location tracking over WebSockets |
| `deploy/` | Production: Docker Compose, Caddy (HTTPS), server setup, nightly backup and restore drill |
| `design-reference/` | Approved UI mockups for every screen in both themes, plus TECH_DESIGN.md and FEATURES.md (the source of truth) |

**Data sources:** OpenStreetMap (help points, routing, address search), Google Maps Platform (place photos, ratings, opening hours, side quests), a map-tile provider such as MapTiler.

---

## 🛠️ Run it on your computer

### Prerequisites

Install these once:

* **Node.js 20+** (with npm): <https://nodejs.org>
* **Python 3.12+**: <https://www.python.org/downloads/> (on Windows, tick "Add python.exe to PATH")
* **Docker Desktop**, running: <https://www.docker.com/products/docker-desktop/>

### First run (one command)

```bash
npm run setup
```

It checks the tools, then:

* **Settings:** creates the `.env` files, with random development secrets.
* **Database:** starts this project's own **PostgreSQL + PostGIS (port 5440)** and **Redis (port 6390)** in Docker, applies the migrations and loads the 52 curated places.
* **Safety service:** builds its Python environment.
* **Help points:** imports Pune's real hospitals, clinics, police and fire stations from OpenStreetMap, which takes a few minutes.

It's safe to run again. Add `--skip-help` to skip the OpenStreetMap import, or `--no-docker` to use your own PostgreSQL and Redis from `services/tour-api/.env`.

### Every day

```bash
npm run dev          # starts the web app, Tour API and safety service together
```

Open **<http://localhost:5050>**. On a phone on the same Wi-Fi, open `http://<your computer's IP>:5050`. Location, the camera and installing the app need HTTPS on a phone, so test those on `localhost` or a deployed site.

* **Stop:** press `Ctrl+C` to stop the apps. `npm run db:down` stops the database and Redis; `npm run db:up` starts them again (no setup needed).
* **No real texts are sent locally:** login codes, SOS alerts and reset links are printed in the terminal (phone numbers masked), even if your `.env` has live SMS keys. Set `SMS_DEV_SEND=true` only to test one real text.
* **The landing page** is plain files: `python -m http.server 5180` inside `apps/landing`, then open <http://localhost:5180>.

### Something not working?

| Problem | Fix |
| :--- | :--- |
| `Docker is not running` | Start Docker Desktop, wait for it to say "running", run `npm run setup` again |
| `Port 5050 / 3001 / 8010 is already in use` | Another copy is still running: close the other terminal, or restart the computer |
| Explore is empty | `npm run seed -w services/tour-api` |
| Help nearby is empty | `npm run refresh:help` (needs internet; the public servers are sometimes busy, so try again later) |
| Map has no streets | Your internet connection: map tiles are loaded from the tile provider |
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
| `npm run refresh:help` | Import Pune's help points from OpenStreetMap and refresh each place's nearest hospital (a failed or partial download keeps the existing data) |
| `npm run cleanup -w services/tour-api` | Delete data past its retention period (add `-- --dry-run` to only count) |
| `npm run waitlist:export -w services/tour-api` | Print the Android waitlist emails not yet notified (launch day) |
| `npm run worker -w services/tour-api` | Dedicated SMS worker process (optional; the API runs one by default) |
| `npm run load-test` | Load test the read paths (Explore, place, help, health) |
| `npm run icons` | Regenerate every app icon (web, landing, Android) from `apps/web/art/icon.svg` |
| `npm run android:apk -w apps/web` | Android test APK (see docs/LAUNCH_SETUP.md step 23) |

---

## 🚀 How it runs in production

* **One server** (Google Cloud, Mumbai) running Docker Compose: the API (which also serves the app and the website), the safety service, PostgreSQL + PostGIS, Redis and Caddy for HTTPS.
* **Two addresses**: `puneexplorer.dev` shows the website; `app.puneexplorer.dev` is the app. Old app links on the main address forward to the app, and phones that installed the app from the old address keep an offline emergency page.
* **Automatic deploys** from GitHub Actions on every merge into `research` or `main`.
* **Every night**: database backup to Cloud Storage (02:00), help-point refresh (03:00), and deletion of data past its retention period (03:30).
* **Monitoring**: uptime checks, error reports (Sentry), and an alert when a nightly backup or cleanup fails.

The full step-by-step setup, with a real-world check for each service, is in **[docs/LAUNCH_SETUP.md](./docs/LAUNCH_SETUP.md)**.

---

## 🌿 Branches

* Every change goes on its own branch and in through a **pull request into `research`**. Merging into `research` deploys to the live server.
* **`main` only takes `research`**, through a pull request merged with *Create a merge commit*. Nobody commits to `main` directly.
* Both branches deploy to the same server, so CI checks and GitHub rules keep them in step (details in [docs/LAUNCH_SETUP.md](./docs/LAUNCH_SETUP.md), Part 7).

---

## 🌐 Local ports

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

A huge **thank you** to everyone who has given their time, knowledge and code to **Pune Explorer**.

* **[Sourav Suman (@LEVELING2108)](https://github.com/LEVELING2108)**: project creator and maintainer. Architecture, the Tour API and safety integration, SOS and trip mode, deployment and security.
* **Aman Kumar**: team member on Pune Explorer.
* **[Sanika Darekar (@sanikadarekar)](https://github.com/sanikadarekar)**: the multi-container Docker Compose setup (PostgreSQL + PostGIS and Redis), the developer-first [`CONTRIBUTING.md`](./CONTRIBUTING.md), backend schema and API specifications, and the root environment configuration.

Contributions are welcome: bug reports, Marathi, Hindi or Gujarati reviews of the translations, hidden gems of Pune, or code. Start with the **[Contribution Guidelines](./CONTRIBUTING.md)**.

---

## 📜 License & data

* **Project license:** ISC.
* **Map data:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (help points, routing via OSRM, address search via Nominatim).
* **Place photos, ratings and opening hours:** Google Maps Platform, shown with Google's attribution.
* **Map tiles:** from the configured tile provider (for example MapTiler), with its attribution on the map.
