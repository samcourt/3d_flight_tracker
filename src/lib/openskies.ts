import { FLIGHT_TTL_MS, MAX_AIRCRAFT, OPEN_SKY_BASE_URL, USE_EXTENDED_STATES } from './constants';
import type { FlightPoint, OpenSkyResponse, OpenSkyStateRow } from '../types/flights';

function rowToFlight(row: OpenSkyStateRow): FlightPoint | null {
  const [icao24, callsign, originCountry, timePosition, lastContact, longitude, latitude, baroAltitude, onGround, velocity, trueTrack, verticalRate, , geoAltitude, , , positionSource, category] = row;

  if (latitude == null || longitude == null) return null;

  const altitude = geoAltitude ?? baroAltitude ?? 0;
  const trimmedCallsign = callsign?.trim() || icao24.toUpperCase();

  return {
    id: icao24,
    icao24,
    callsign: trimmedCallsign,
    originCountry,
    longitude,
    latitude,
    baroAltitude: baroAltitude ?? 0,
    geoAltitude: geoAltitude ?? 0,
    altitude,
    onGround,
    velocity: velocity ?? 0,
    trueTrack: trueTrack ?? 0,
    verticalRate: verticalRate ?? 0,
    lastContact,
    positionTime: timePosition ?? lastContact,
    positionSource,
    category
  };
}

export async function fetchFlights(signal?: AbortSignal): Promise<{ time: number; flights: FlightPoint[] }> {
  const url = new URL(`${OPEN_SKY_BASE_URL}/states/all`, window.location.origin);
  if (USE_EXTENDED_STATES) {
    url.searchParams.set('extended', '1');
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error(`OpenSky request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as OpenSkyResponse;
  const flights = (payload.states ?? [])
    .map(rowToFlight)
    .filter((flight): flight is FlightPoint => Boolean(flight))
    .sort((a, b) => b.altitude - a.altitude)
    .slice(0, MAX_AIRCRAFT);

  return {
    time: payload.time,
    flights
  };
}

export function mergeFlightSnapshot(previous: Map<string, FlightPoint>, nextFlights: FlightPoint[], snapshotTime: number) {
  const nextMap = new Map<string, FlightPoint>();
  const now = Date.now();

  for (const flight of nextFlights) {
    nextMap.set(flight.id, flight);
  }

  const merged = nextFlights.map((flight) => ({
    ...flight,
    previous: previous.get(flight.id),
    target: flight,
    receivedAt: now,
    expiresAt: now + FLIGHT_TTL_MS,
    snapshotTime
  }));

  return {
    nextMap,
    merged
  };
}
