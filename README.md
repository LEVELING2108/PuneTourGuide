# 🏰 Pune Tour Guide — End-to-End Application

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A modern, full-stack tour guide application for Pune, featuring heritage trails, popular spots, upcoming events, and personalized itineraries. Transitioned from a static prototype to a dynamic, database-driven application.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Inline Styles (for precise design control)
- **Icons/Emoji:** Native Unicode Emojis
- **Data Fetching:** Fetch API with custom wrappers

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma (v5)
- **Security:** Helmet, CORS, Dotenv

### Database
- **Database:** PostgreSQL
- **Local Dev:** Prisma Migrate & Studio

---

## 📂 Project Structure

```
PuneTourGuide/
├── backend/                # Express + TypeScript API
│   ├── prisma/             # DB Schema & Migrations
│   ├── src/
│   │   ├── controllers/    # Business Logic
│   │   ├── routes/         # API Endpoints
│   │   ├── app.ts          # Server Entry Point
│   │   └── seed.ts         # DB Seeding Script
│   └── tsconfig.json
├── src/                    # React Frontend
│   ├── components/         # Reusable UI Components
│   ├── screens/            # Main View Screens
│   ├── data/
│   │   ├── api.js          # API Client Wrappers
│   │   └── puneData.js     # Legacy static data (reference)
│   └── App.jsx             # Main Routing/Navigation
├── index.html
├── package.json
└── tailwind.config.js
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally)

### 1. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/Pune_Tour_Guide?schema=public"
PORT=3000
```
Run migrations and seed data:
```bash
npx prisma migrate dev --name init
npx ts-node src/seed.ts
```

### 2. Setup Frontend
```bash
# In the root directory
npm install
```

### 3. Run Development Servers
**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
npm run dev
```

---

## 🗺️ Key Features
- **Automatic Place Discovery:** Uses the **OpenStreetMap (Overpass API)** to automatically find and ingest new places in Pune. If you search for a cafe or monument not in the database, the app finds it and saves it for everyone!
- **Dynamic Explore:** Search and filter Pune's top spots by category (Heritage, Food, Nature, etc.) fetched directly from the DB.
- **Interactive Itineraries:** Multi-day travel plans with specific timings and location details.
- **Schematic Map:** A custom-designed SVG heritage trail map showing live route stops.
- **Real-time Events:** Stay updated with classical music festivals and food walks.

## 🤝 Contribution
This project was built to showcase a clean transition from static design to a functional full-stack system. Feel free to fork and extend!
