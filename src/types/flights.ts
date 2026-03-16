export type OpenSkyStateRow = [
  string,
  string | null,
  string,
  number | null,
  number,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean,
  number,
  number | null,
];

export interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateRow[] | null;
}

export interface FlightPoint {
  id: string;
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  baroAltitude: number;
  geoAltitude: number;
  altitude: number;
  onGround: boolean;
  velocity: number;
  trueTrack: number;
  verticalRate: number;
  lastContact: number;
  positionTime: number;
  positionSource: number;
  category?: number | null;
}

export interface InterpolatedFlight extends FlightPoint {
  previous?: FlightPoint;
  target?: FlightPoint;
  receivedAt: number;
  expiresAt: number;
}
