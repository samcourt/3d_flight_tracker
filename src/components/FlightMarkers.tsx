import { useMemo, useRef } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { InterpolatedFlight } from '../types/flights';
import { flightPosition, lerpAngleDegrees, tangentQuaternion } from '../lib/geo';
import { GLOBE_RADIUS, OPEN_SKY_POLL_MS } from '../lib/constants';

interface FlightMarkersProps {
  flights: InterpolatedFlight[];
  selectedId?: string;
  onSelect?: (id?: string) => void;
}

const tempVec = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();

export function FlightMarkers({ flights, selectedId, onSelect }: FlightMarkersProps) {
  const selectedFlight = useMemo(() => flights.find((flight) => flight.id === selectedId), [flights, selectedId]);
  const labelPosition = useMemo(() => {
    if (!selectedFlight) return null;
    return flightPosition(selectedFlight.latitude, selectedFlight.longitude, selectedFlight.altitude + 1800);
  }, [selectedFlight]);

  return (
    <group>
      {flights.map((flight) => (
        <AnimatedFlightMarker key={flight.id} flight={flight} selected={flight.id === selectedId} onSelect={onSelect} />
      ))}

      <mesh rotation-x={-Math.PI / 2} position={[0, -GLOBE_RADIUS - 0.001, 0]}>
        <ringGeometry args={[GLOBE_RADIUS * 1.001, GLOBE_RADIUS * 1.0016, 180]} />
        <meshBasicMaterial color="#2b6cb0" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {selectedFlight && labelPosition ? (
        <group position={labelPosition}>
          <Text fontSize={0.16} color="#f9fbff" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#071120">
            {selectedFlight.callsign}
          </Text>
          <Html center distanceFactor={15} position={[0, -0.12, 0]}>
            <div className="scene-pill">tracking</div>
          </Html>
        </group>
      ) : null}
    </group>
  );
}

function AnimatedFlightMarker({
  flight,
  selected,
  onSelect
}: {
  flight: InterpolatedFlight;
  selected: boolean;
  onSelect?: (id?: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const now = Date.now();
    const age = now - flight.receivedAt;
    const progress = THREE.MathUtils.clamp(age / OPEN_SKY_POLL_MS, 0, 1);
    const source = flight.previous ?? flight;
    const target = flight.target ?? flight;

    tempVec.copy(
      flightPosition(
        THREE.MathUtils.lerp(source.latitude, target.latitude, progress),
        THREE.MathUtils.lerp(source.longitude, target.longitude, progress),
        THREE.MathUtils.lerp(source.altitude, target.altitude, progress)
      )
    );

    tempQuat.copy(tangentQuaternion(tempVec, lerpAngleDegrees(source.trueTrack, target.trueTrack, progress)));

    groupRef.current.position.copy(tempVec);
    groupRef.current.quaternion.copy(tempQuat);
    groupRef.current.scale.setScalar(selected ? 1.55 : 1);
  });

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(selected ? undefined : flight.id);
      }}
    >
      <mesh castShadow>
        <coneGeometry args={[0.05, 0.24, 8]} />
        <meshStandardMaterial
          color={selected ? '#ffe082' : '#f5f7ff'}
          emissive={selected ? '#ffdf70' : '#b8d7ff'}
          emissiveIntensity={selected ? 2.8 : 1.8}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshBasicMaterial color={selected ? '#ffe082' : '#9fd0ff'} toneMapped={false} />
      </mesh>
    </group>
  );
}
