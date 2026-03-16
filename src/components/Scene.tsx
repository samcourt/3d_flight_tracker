import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { InterpolatedFlight } from '../types/flights';
import { Earth } from './Earth';
import { Stars } from './Stars';
import { FlightMarkers } from './FlightMarkers';

interface SceneProps {
  flights: InterpolatedFlight[];
  selectedId?: string;
  onSelect?: (id?: string) => void;
}

export function Scene({ flights, selectedId, onSelect }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      shadows
      onPointerMissed={() => onSelect?.(undefined)}
    >
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 24, 110]} />
      <PerspectiveCamera makeDefault position={[0, 7.5, 12.5]} fov={42} />
      <ambientLight intensity={0.2} />
      <hemisphereLight intensity={0.6} color="#b9d6ff" groundColor="#08111f" />
      <directionalLight
        position={[12, 10, 8]}
        intensity={2.9}
        color="#fff7df"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-18, -8, -12]} intensity={0.55} color="#295ea8" />

      <Suspense fallback={null}>
        <Stars />
        <Earth />
        <FlightMarkers flights={flights} selectedId={selectedId} onSelect={onSelect} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={7.8}
        maxDistance={22}
        rotateSpeed={0.6}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
      />
      <AdaptiveDpr pixelated />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.75} />
        <Vignette eskil={false} offset={0.18} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
