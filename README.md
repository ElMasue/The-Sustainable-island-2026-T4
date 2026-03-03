# The Sustainable Island 2026 🌊

An interactive map to find water fountains and refill stations, promoting the reuse of water bottles and reducing single-use plastic waste.

## Project Structure

- **Frontend** - React + TypeScript + Vite
- **Backend** - Node.js + Express + TypeScript

## Features

- 📍 Interactive map with water fountain locations
- 🔐 User menu adjusts items depending on login state (favorites/saved hidden when signed out)
- ⚙️ Settings screen lets you toggle language (EN/ES) and switch between bright/dark mode
- 🔍 Search functionality to find nearby stations
- 📱 Mobile-responsive design
- ✅ Real-time operational status of fountains

## Getting Started

### Frontend
```bash
cd Frontend
npm install   # installs React, Mapbox, Leaflet etc.
```

> If the backend runs on a different origin (for example `http://localhost:3000`)
> you can set an environment variable so the frontend knows where to fetch
> data:
>
> ```ini
> # Frontend/.env.local
> VITE_API_BASE=http://localhost:3000
> ```
>
> When the variable is omitted or empty the app will send requests to the same
> origin (`/api/...`).

```bash
npm run dev
```

> ⚠️ If you plan to run without a Mapbox access token, the app will automatically
> fall back to an OpenStreetMap map (Leaflet). The required `leaflet` package
> is already added to `package.json` and will be pulled in by `npm install`.

### Backend
```bash
cd Backend
npm install
npm run dev
```

## Technologies

- React 18 + TypeScript
- Leaflet & React-Leaflet for maps (used as a fallback when a Mapbox token
    isn’t available; OpenStreetMap tiles are shown)
- Express.js for REST API
- CORS enabled for cross-origin requests
