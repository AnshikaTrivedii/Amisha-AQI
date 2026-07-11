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

## Production hosting (EC2 Mumbai)

The CPCB API only works from **Indian IP addresses**, so production must run on
**AWS EC2 in Mumbai (`ap-south-1`)** using the included Express server.

```bash
npm install
npm run build
npm start          # serves app + /api/aqi on port 3000
```

Full setup (PM2, Nginx, health checks): see **[DEPLOY_EC2.md](DEPLOY_EC2.md)**.

> **Do not use Render, Netlify, or other non-India hosts** for the backend — CPCB
> requests will time out and the app will show stale fallback data.

## Tech stack

- React + Vite
- React Router
- Leaflet (OpenStreetMap tiles)

## Navigation

- Back arrow on the city page → stations list
- Tap any station → city detail page
