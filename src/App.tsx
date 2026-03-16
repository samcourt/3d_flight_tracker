import { useMemo, useState } from 'react';
import { Scene } from './components/Scene';
import { useOpenSkyFlights } from './hooks/useOpenSkyFlights';
import { formatAltitude, formatCoords, formatSpeed, formatTimestamp, formatVerticalRate } from './lib/format';

export default function App() {
  const { flights, lastUpdated, isLoading, error } = useOpenSkyFlights();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const selectedFlight = useMemo(() => flights.find((flight) => flight.id === selectedId), [flights, selectedId]);
  const displayedFlights = useMemo(() => flights.slice(0, 8), [flights]);

  return (
    <div className="app-shell">
      <div className="canvas-wrap">
        <Scene flights={flights} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <header className="hud hud-top-left">
        <div className="eyebrow">Live OpenSky feed</div>
        <h1>3D flight tracker</h1>
        <p>
          Real-time aircraft positions wrapped to a rotatable 3D Earth with altitude-aware placement, smooth motion interpolation,
          and cinematic lighting.
        </p>
      </header>

      <section className="hud hud-top-right stats-card">
        <div>
          <span className="label">Visible aircraft</span>
          <strong>{flights.length}</strong>
        </div>
        <div>
          <span className="label">Updated</span>
          <strong>{lastUpdated ? formatTimestamp(lastUpdated) : '—'}</strong>
        </div>
        <div>
          <span className="label">Status</span>
          <strong>{isLoading ? 'Loading…' : error ? 'Degraded' : 'Live'}</strong>
        </div>
      </section>

      <section className="hud hud-bottom-left panel">
        <div className="panel-header">
          <h2>Tracked aircraft</h2>
          <span>{displayedFlights.length} shown</span>
        </div>
        <div className="flight-list">
          {displayedFlights.map((flight) => (
            <button
              key={flight.id}
              className={`flight-row ${selectedId === flight.id ? 'is-active' : ''}`}
              onClick={() => setSelectedId(selectedId === flight.id ? undefined : flight.id)}
            >
              <div>
                <strong>{flight.callsign}</strong>
                <small>{flight.originCountry}</small>
              </div>
              <div>
                <strong>{formatAltitude(flight.altitude)}</strong>
                <small>{formatSpeed(flight.velocity)}</small>
              </div>
            </button>
          ))}
          {!displayedFlights.length && !error ? <div className="empty-state">Waiting for aircraft positions…</div> : null}
          {error ? <div className="empty-state error">{error}</div> : null}
        </div>
      </section>

      <aside className="hud hud-bottom-right panel detail-panel">
        <div className="panel-header">
          <h2>{selectedFlight ? selectedFlight.callsign : 'Flight details'}</h2>
          <span>{selectedFlight ? selectedFlight.icao24.toUpperCase() : 'Select a plane'}</span>
        </div>

        {selectedFlight ? (
          <dl className="detail-grid">
            <div>
              <dt>Country</dt>
              <dd>{selectedFlight.originCountry}</dd>
            </div>
            <div>
              <dt>Altitude</dt>
              <dd>{formatAltitude(selectedFlight.altitude)}</dd>
            </div>
            <div>
              <dt>Ground speed</dt>
              <dd>{formatSpeed(selectedFlight.velocity)}</dd>
            </div>
            <div>
              <dt>Vertical rate</dt>
              <dd>{formatVerticalRate(selectedFlight.verticalRate)}</dd>
            </div>
            <div>
              <dt>Heading</dt>
              <dd>{Math.round(selectedFlight.trueTrack)}°</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>{formatCoords(selectedFlight.latitude, selectedFlight.longitude)}</dd>
            </div>
            <div>
              <dt>Surface state</dt>
              <dd>{selectedFlight.onGround ? 'On ground' : 'Airborne'}</dd>
            </div>
            <div>
              <dt>Last contact</dt>
              <dd>{formatTimestamp(selectedFlight.lastContact)}</dd>
            </div>
          </dl>
        ) : (
          <div className="empty-state">Click an aircraft to inspect heading, climb rate, altitude, and coordinates.</div>
        )}
      </aside>
    </div>
  );
}
