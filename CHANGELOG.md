# 📜 Changelog

All notable changes to **Pune Explorer** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-06

### 🙏 Special Thanks & Contributor Acknowledgements

A heartfelt thank you to all the contributors whose dedication, creativity, and code made **Release v1.1.0** possible!

- **Sanika Darekar ([@sanikadarekar](https://github.com/sanikadarekar))**:
  - **PR #62**: Established robust open-source foundations by creating [`CONTRIBUTING.md`](./CONTRIBUTING.md) with comprehensive development workflows, PR review checklists, and commit standards.
  - Added multi-container `docker-compose.yml` for zero-configuration local PostgreSQL (with PostGIS) and Redis orchestration.
  - Synchronized and updated [`BACKEND.md`](./BACKEND.md) documentation to perfectly align with Prisma schema models and live REST API endpoints.
  - Provided root-level `.env.example` templates and streamlined the local setup instructions.

- **Sourav Suman ([@LEVELING2108](https://github.com/LEVELING2108))**:
  - Implemented live OpenStreetMap (Overpass API) viewport discovery with strict category categorization and word-boundary negative keyword filtering.
  - Added dual node and way spatial centroid processing for accurate heritage structures, parks, and forts.
  - Security hardening: isolated user bookmarks, sanitized Overpass query strings, and added rate limiting.
  - Performance optimizations: code-splitting, backend Gzip compression, and graceful Redis degradation.

- **OpenStreetMap & Overpass Community**:
  - For open geospatial data powering authentic Pune heritage, nature, temple, food, and wellness discovery.

---

### 🚀 What's New & Changed in v1.1.0

#### 🐳 DevOps & Contributor Experience
- **Docker Compose Orchestration**: Spin up PostgreSQL 14 (PostGIS) and Redis with a single command: `docker compose up -d`.
- **Contribution Guidelines**: Added [`CONTRIBUTING.md`](./CONTRIBUTING.md) detailing PR workflows, Git conventions, code styles, and local testing instructions.
- **Environment Templates**: Added root `.env.example` and synchronized `backend/.env.example`.
- **Documentation Overhaul**: Updated `README.md` and `BACKEND.md` with complete architecture maps, service port tables, and API endpoint specs.

#### 🗺️ Map & OpenStreetMap Data Engine
- **Live Viewport Sourcing**: Dynamic Overpass API querying when panning/zooming across Pune.
- **Dual Node & Way Centroids**: Accurately computes geographic centers for large areas such as Shaniwar Wada, Saras Baug, and Sinhagad Fort.
- **Strict Tourist Filtering**: Rejects non-tourist locations (banks, clinics, schools, apartments, generic offices) using word-boundary matching.

#### 🔒 Security & Reliability
- **Isolated User Bookmarks**: Enforced user-specific data isolation for saved spots with authenticated and guest handling.
- **Query Sanitization**: Prevented Overpass query injection with regex escaping.
- **Graceful Redis Degradation**: In-memory fallback and safe operation when Redis is offline.

#### ⚡ Performance & Polish
- **Frontend Code Splitting**: Vite chunk optimization with lazy loading for all primary screens.
- **Gzip & Compression**: Express backend compression and layered in-memory cache.
- **In-App Contributor Recognition**: Interactive Contributor Acknowledgements & Release Notes modal in the Profile screen.

---

## [1.0.0] - 2026-06-30

### Initial Release
- Interactive Leaflet map with Pune tourist spots.
- Dynamic itinerary builder with OSRM TSP route sequence optimization.
- Punekar gamification (levels, badges, and XP tracking).
- Multilingual localization support (English, Marathi, Hindi, Gujarati).
- PWA support with service worker caching.
