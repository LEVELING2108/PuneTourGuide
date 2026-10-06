# 🤝 Contributing to Pune Explorer

Thank you for your interest in contributing to **Pune Explorer**! We welcome contributions from developers, designers, local Pune guides, and open-source enthusiasts of all experience levels.

This document provides guidelines and workflows for contributing to the project in a clean, consistent, and collaborative manner.

---

## 📑 Table of Contents
1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
3. [Development Setup](#-development-setup)
4. [Git & Branching Workflow](#-git--branching-workflow)
5. [Commit Conventions](#-commit-conventions)
6. [Submitting a Pull Request](#-submitting-a-pull-request)
7. [Coding Guidelines](#-coding-guidelines)

---

## 📜 Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and open to feedback in all discussions, issues, and code reviews.

---

## 💡 How Can I Contribute?

* **🐛 Report Bugs**: Found something broken? Open an issue describing the bug, steps to reproduce, and your environment.
* **✨ Propose Features**: Have an idea for Pune tour features (e.g. Pune Metro routing, audio guides, offline caching)? Submit a feature proposal issue.
* **📝 Improve Documentation**: Fix typos, clarify setup steps, or expand architecture docs.
* **🌐 Translations & Content**: Add or refine Marathi (मराठी), Hindi, or other regional language translations, or add authentic Pune tourist spots to the database seed.
* **💻 Code Contributions**: Pick an open issue or work on high-impact features (PWA offline caching, automated tests, UI improvements).

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js** (v18.0 or higher) & **npm**
- **Git**
- **Docker & Docker Compose** (Recommended for zero-configuration Postgres + Redis setup), OR:
  - Local **PostgreSQL 14+** (with PostGIS extension enabled)
  - Local **Redis** (optional, caching fallback will degrade gracefully to PostgreSQL)

### 1. Fork & Clone
```bash
# Clone your fork
git clone https://github.com/<your-username>/PuneTourGuide.git
cd PuneTourGuide
```

### 2. Environment Variables
Create `.env` files for both frontend and backend using the provided templates:

```bash
# 1. Frontend Environment (Root)
cp .env.example .env

# 2. Backend Environment
cp backend/.env.example backend/.env
```

Review both `.env` files and update database credentials or API keys if necessary.

### 3. Start Database & Cache Services (Docker)
If you have Docker installed, start PostgreSQL with PostGIS and Redis with a single command:
```bash
docker compose up -d
```

### 4. Install Dependencies & Migrate Database
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Generate Prisma Client & apply existing database migrations
npx prisma generate
npx prisma migrate deploy

# Seed initial tourist places, events, and sample itineraries
npx ts-node src/seed.ts
cd ..
```

### 5. Start Development Servers
Open two terminal windows:

* **Terminal 1: Backend Server** (runs on `http://localhost:3001`):
  ```bash
  cd backend
  npm run dev
  ```

* **Terminal 2: Frontend Server** (runs on `http://localhost:5173`):
  ```bash
  npm run dev
  ```

---

## 🌿 Git & Branching Workflow

Always create a new branch from `main` before starting any work.

### Branch Naming Conventions
Use descriptive branch names with appropriate prefixes:
- `feat/feature-name` (e.g. `feat/pune-metro-overlay`)
- `fix/issue-description` (e.g. `fix/guest-bookmark-handling`)
- `docs/doc-update` (e.g. `docs/update-backend-architecture`)
- `refactor/scope` (e.g. `refactor/overpass-cache-layer`)
- `test/test-scope` (e.g. `test/auth-routes-supertest`)

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create and checkout your feature branch
git checkout -b feat/your-feature-name
```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary in imperative mood>

[optional body explaining rationale]
```

### Types
- `feat`: A new feature for users
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Formatting, missing semicolons, whitespace (no functional code changes)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating test cases
- `chore`: Tooling, build scripts, package updates

### Examples
- `feat(map): add Pune Metro station markers and route toggles`
- `fix(itinerary): prevent duplicate stops during weather adaptation`
- `docs(readme): fix broken contribution guidelines link and setup steps`
- `chore: add docker-compose configuration for Postgres and Redis`

---

## 🚀 Submitting a Pull Request

1. **Test Your Changes**: Verify that both the backend builds (`cd backend && npm run build`) and the frontend runs cleanly without errors.
2. **Push to Your Fork**:
   ```bash
   git push origin feat/your-feature-name
   ```
3. **Open a PR**: Go to the GitHub repository and click **Compare & pull request**.
4. **Fill Out the PR Description**:
   - Provide a clear summary of what changed and why.
   - Mention any related issues (`Closes #12`).
   - Include screenshots or screen recordings for UI changes.
5. **Code Review**: Be responsive to reviewer feedback and push updates to the same branch.

---

## 📐 Coding Guidelines

* **Frontend**:
  - Keep components modular inside `src/components/` and full views in `src/screens/`.
  - Use semantic color tokens defined in `src/data/tokens.js`.
  - Ensure any new user-facing strings are localized in `src/data/translations.js`.
* **Backend**:
  - Write type-safe TypeScript code.
  - Follow the layered controller-service pattern (`src/controllers/`, `src/services/`, `src/routes/`).
  - Cache heavy external API calls with Redis and handle graceful fallbacks when Redis or third-party APIs are down.
  - Keep database schema changes managed via Prisma migrations (`npx prisma migrate dev`).

---

Thank you for helping make **Pune Explorer** better for everyone! 🏰
