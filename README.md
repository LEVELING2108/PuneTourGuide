# 🏛️ Pune Tour Guide — Mobile UI

A React mobile app UI for exploring Pune — built with Vite, React, and Tailwind CSS.

## Screens

| Screen | File | Description |
|---|---|---|
| Home | `src/screens/HomeScreen.jsx` | Hero, category pills, place cards, events |
| Explore | `src/screens/ExploreScreen.jsx` | Searchable, filterable place list |
| Place Detail | `src/screens/PlaceDetailScreen.jsx` | Full info, stats, CTA |
| Map & Route | `src/screens/MapScreen.jsx` | SVG route map, stop checklist |
| Itinerary | `src/screens/PlanScreen.jsx` | Day-by-day timeline planner |

## Data

All mock data lives in `src/data/puneData.js`. Replace with API calls to your backend.

## Design Tokens

Colors and tag styles are in `src/data/tokens.js`.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx                  # Root app, screen routing
├── main.jsx                 # ReactDOM entry
├── index.css                # Tailwind + global styles
├── components/
│   ├── BottomNav.jsx        # Tab navigation bar
│   ├── StatusBar.jsx        # Mobile status bar
│   ├── PlaceCard.jsx        # Home screen card
│   └── PlaceListItem.jsx    # Explore list row
├── screens/
│   ├── HomeScreen.jsx
│   ├── ExploreScreen.jsx
│   ├── PlaceDetailScreen.jsx
│   ├── MapScreen.jsx
│   └── PlanScreen.jsx
└── data/
    ├── puneData.js          # Mock places, events, itinerary
    └── tokens.js            # Design tokens / color map
```

## Backend

See `BACKEND.md` for the full backend tech stack, API endpoints, and Prisma schema.
