import { useMemo, useRef } from 'react';
import { Html, Instances, Instance, Text } from '@react-three/drei';
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
    return flightPosition(selectedFlight.latitude, selectedFlight.longitude, selectedFlight.altitude + 1000);
  }, [selectedFlight]);

  return (
    <group>
      <Instances limit={flights.length + 8} castShadow receiveShadow>
        <coneGeometry args={[0.035, 0.18, 6]} />
        <meshStandardMaterial emissive="#fff2aa" emissiveIntensity={2.3} toneMapped={false} color="#f5f7ff" roughness={0.35} metalness={0.15} />
        {flights.map((flight) => (
          <AnimatedFlightInstance key={flight.id} flight={flight} selected={flight.id === selectedId} onSelect={onSelect} />
        ))}
      </Instances>

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

function AnimatedFlightInstance({
  flight,
  selected,
  onSelect
}: {
  flight: InterpolatedFlight;
  selected: boolean;
  onSelect?: (id?: string) => void;
}) {
  const ref = useRef<THREE.Object3D>(null);

  useFrame(() => {
    if (!ref.current) return;

    const now = Date.now();
    const age = now - flight.receivedAt;
    const progress = THREE.MathUtils.clamp(age / OPEN_SKY_POLL_MS, 0, 1);
    const source = flight.previous ?? flight;
    const target = flight.target ?? flight;

    tempVec.copy(flightPosition(
      THREE.MathUtils.lerp(source.latitude, target.latitude, progress),
      THREE.MathUtils.lerp(source.longitude, target.longitude, progress),
      THREE.MathUtils.lerp(source.altitude, target.altitude, progress)
    ));

    tempQuat.copy(tangentQuaternion(tempVec, lerpAngleDegrees(source.trueTrack, target.trueTrack, progress)));

    ref.current.position.copy(tempVec);
    ref.current.quaternion.copy(tempQuat);
    ref.current.scale.setScalar(selected ? 1.8 : 1);
  });

  return (
    <Instance
      ref={ref}
      color={selected ? '#ffe082' : '#dce8ff'}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(selected ? undefined : flight.id);
      }}
    />
  );
}
