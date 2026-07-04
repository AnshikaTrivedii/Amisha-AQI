# AQI Monitor – Lucknow

A mobile-first Air Quality Index dashboard matching the CPCB/SAFAR-style UI.

## Pages

- **City AQI** (`/`) – Map view with city-level AQI summary, 3-day history, and health impact
- **Stations** (`/stations`) – List of active monitoring stations with AQI badges

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Tech stack

- React + Vite
- React Router
- Leaflet (OpenStreetMap tiles)

## Navigation

- Back arrow on the city page → stations list
- Tap any station → city detail page
