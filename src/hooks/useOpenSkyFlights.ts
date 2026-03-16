import { useEffect, useMemo, useRef, useState } from 'react';
import type { FlightPoint, InterpolatedFlight } from '../types/flights';
import { fetchFlights, mergeFlightSnapshot } from '../lib/openskies';
import { OPEN_SKY_POLL_MS } from '../lib/constants';

interface FlightsState {
  flights: InterpolatedFlight[];
  lastUpdated?: number;
  isLoading: boolean;
  error?: string;
}

export function useOpenSkyFlights() {
  const [state, setState] = useState<FlightsState>({
    flights: [],
    isLoading: true
  });
  const previousFlightsRef = useRef<Map<string, FlightPoint>>(new Map());

  useEffect(() => {
    let mounted = true;
    let timeoutId: number | undefined;
    let activeController: AbortController | undefined;

    const load = async () => {
      activeController?.abort();
      activeController = new AbortController();

      try {
        const snapshot = await fetchFlights(activeController.signal);
        if (!mounted) return;

        const { nextMap, merged } = mergeFlightSnapshot(previousFlightsRef.current, snapshot.flights, snapshot.time);
        previousFlightsRef.current = nextMap;

        setState({
          flights: merged,
          lastUpdated: snapshot.time,
          isLoading: false,
          error: undefined
        });
      } catch (error) {
        if (!mounted || (error instanceof DOMException && error.name === 'AbortError')) return;

        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown OpenSky error'
        }));
      } finally {
        if (mounted) {
          timeoutId = window.setTimeout(load, OPEN_SKY_POLL_MS);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      activeController?.abort();
    };
  }, []);

  const activeFlights = useMemo(() => state.flights.filter((flight) => flight.expiresAt > Date.now()), [state.flights, state.lastUpdated]);

  return {
    ...state,
    flights: activeFlights
  };
}
