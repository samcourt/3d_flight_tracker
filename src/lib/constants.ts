export const GLOBE_RADIUS = Number(import.meta.env.VITE_GLOBE_RADIUS ?? 5);
export const ALTITUDE_SCALE = Number(import.meta.env.VITE_ALTITUDE_SCALE ?? 0.00003);
export const OPEN_SKY_POLL_MS = Number(import.meta.env.VITE_OPENSKY_POLL_MS ?? 10000);
export const OPEN_SKY_BASE_URL = String(import.meta.env.VITE_OPENSKY_BASE_URL ?? '/api/openskies');
export const USE_EXTENDED_STATES = String(import.meta.env.VITE_USE_EXTENDED_STATES ?? '0') === '1';
export const MAX_AIRCRAFT = Number(import.meta.env.VITE_MAX_AIRCRAFT ?? 450);
export const FLIGHT_TTL_MS = OPEN_SKY_POLL_MS * 3;
export const EARTH_ROTATION_SPEED = 0.015;
