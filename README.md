# The Sustainable Island 2026 🌊

An interactive map to find water fountains and refill stations, promoting the reuse of water bottles and reducing single-use plastic waste.

## Project Structure

- **Frontend** - React + TypeScript + Vite
- **Backend** - Node.js + Express + TypeScript

## Features

- 📍 Interactive map with water fountain locations
- 🔍 Search functionality to find nearby stations
- 📱 Mobile-responsive design
- ✅ Real-time operational status of fountains

## Getting Started

### Frontend
```bash
cd Frontend
npm install   # installs React, Mapbox, Leaflet etc.
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
