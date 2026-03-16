export function formatAltitude(meters: number): string {
  const feet = meters * 3.28084;
  return `${Math.round(feet).toLocaleString()} ft`;
}

export function formatSpeed(ms: number): string {
  const knots = ms * 1.94384;
  return `${Math.round(knots)} kt`;
}

export function formatVerticalRate(ms: number): string {
  const fpm = ms * 196.8504;
  return `${Math.round(fpm).toLocaleString()} fpm`;
}

export function formatCoords(lat: number, lon: number): string {
  return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

export function formatTimestamp(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString();
}
