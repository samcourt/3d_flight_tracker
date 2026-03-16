import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_ROTATION_SPEED, GLOBE_RADIUS } from '../lib/constants';

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, '#0f2f59');
  ocean.addColorStop(0.5, '#0a2341');
  ocean.addColorStop(1, '#081a30');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 10; i += 1) {
    ctx.fillStyle = `rgba(24, ${70 + i * 7}, ${120 + i * 4}, ${0.03 + i * 0.01})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 220 + Math.random() * 250, 80 + Math.random() * 120, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const continents = [
    [0.18, 0.28, 0.12, 0.18],
    [0.26, 0.55, 0.09, 0.22],
    [0.49, 0.34, 0.13, 0.25],
    [0.57, 0.55, 0.1, 0.24],
    [0.72, 0.32, 0.17, 0.2],
    [0.82, 0.63, 0.11, 0.1]
  ];

  continents.forEach(([x, y, w, h], idx) => {
    const gradient = ctx.createRadialGradient(x * canvas.width, y * canvas.height, 20, x * canvas.width, y * canvas.height, Math.max(w * canvas.width, h * canvas.height));
    gradient.addColorStop(0, idx % 2 === 0 ? '#5f7f45' : '#c4a46f');
    gradient.addColorStop(0.55, '#3e5b36');
    gradient.addColorStop(1, 'rgba(32,49,28,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height, idx * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let lon = 0; lon <= 24; lon += 1) {
    const x = (lon / 24) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 12; lat += 1) {
    const y = (lat / 12) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function Earth() {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => makeEarthTexture(), []);

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * EARTH_ROTATION_SPEED;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * EARTH_ROTATION_SPEED * 1.2;
  });

  return (
    <group>
      <mesh ref={globeRef} castShadow receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture}
          emissive="#0b1f35"
          emissiveIntensity={0.18}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.012, 96, 96]} />
        <meshStandardMaterial color="#bcd4ff" transparent opacity={0.07} depthWrite={false} roughness={1} metalness={0} />
      </mesh>

      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.045, 96, 96]} />
        <meshBasicMaterial color="#53a7ff" transparent opacity={0.09} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
