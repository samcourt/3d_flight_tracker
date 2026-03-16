# 3D Flight Tracker

A production-oriented React + Vite + Three.js app that renders live OpenSky aircraft positions on an interactive 3D Earth with smooth interpolation, altitude-aware placement, cinematic lighting, and post-processing.

## Stack

- React + Vite + TypeScript
- Three.js via `@react-three/fiber`
- `@react-three/drei` helpers
- `@react-three/postprocessing` for bloom, vignette, and SMAA
- OpenSky live aircraft data

## Features

- Rotatable 3D Earth with atmosphere glow and star field
- Live OpenSky polling with snapshot merging
- Smooth motion interpolation between snapshots for less jumpy aircraft motion
- Altitude-aware positioning above the globe surface
- Track-based aircraft orientation tangent to the globe
- Click-to-inspect details panel
- Adaptive DPR and lightweight instancing for better performance
- Vite dev proxy plus optional Cloudflare Worker proxy for production

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Then open the local Vite URL.

## Production notes

This app defaults to `VITE_OPENSKY_BASE_URL=/api/openskies`, which is handled by the Vite dev proxy during local development.

For production deployment, point `VITE_OPENSKY_BASE_URL` at your own proxy endpoint, for example a Cloudflare Worker or serverless function. A sample worker is included under `deploy/cloudflare-worker.js`.

That setup gives you a better place to:

- add OpenSky OAuth bearer tokens
- handle CORS consistently
- add short caching
- shield the client from upstream availability spikes

## Environment variables

- `VITE_OPENSKY_BASE_URL` – API base URL
- `VITE_OPENSKY_POLL_MS` – polling interval in milliseconds
- `VITE_USE_EXTENDED_STATES` – request the `extended=1` payload when available
- `VITE_GLOBE_RADIUS` – Earth radius in scene units
- `VITE_MAX_AIRCRAFT` – cap rendered aircraft for performance
- `VITE_ALTITUDE_SCALE` – conversion from meters to scene units

## Build

```bash
npm run build
npm run preview
```

## OpenSky caveats

OpenSky rate limits anonymous requests and has moved authenticated API usage to OAuth2 client credentials. If you need heavier production traffic, do not call authenticated endpoints directly from the browser. Put credentials in your proxy layer instead.
