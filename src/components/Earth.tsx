import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_ROTATION_SPEED, GLOBE_RADIUS } from '../lib/constants';

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, '#1d4e89');
  ocean.addColorStop(0.5, '#123761');
  ocean.addColorStop(1, '#0a213d');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 16; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.012 + i * 0.003})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      160 + Math.random() * 320,
      60 + Math.random() * 150,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const land = '#6fa95a';
  const landDark = '#4c7c3b';
  const desert = '#b59661';

  const drawBlob = (
    points: Array<[number, number]>,
    fill: string,
    stroke = 'rgba(12, 25, 18, 0.35)'
  ) => {
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      const px = x * canvas.width;
      const py = y * canvas.height;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  drawBlob([[0.08,0.22],[0.12,0.15],[0.18,0.12],[0.24,0.16],[0.28,0.23],[0.28,0.31],[0.24,0.37],[0.2,0.41],[0.16,0.48],[0.12,0.55],[0.09,0.48],[0.08,0.39]], land);
  drawBlob([[0.22,0.5],[0.26,0.48],[0.29,0.53],[0.3,0.61],[0.28,0.71],[0.24,0.83],[0.2,0.77],[0.19,0.68],[0.2,0.58]], landDark);
  drawBlob([[0.43,0.18],[0.5,0.14],[0.58,0.18],[0.63,0.23],[0.67,0.3],[0.65,0.37],[0.58,0.38],[0.54,0.34],[0.5,0.32],[0.47,0.36],[0.44,0.31]], land);
  drawBlob([[0.5,0.4],[0.55,0.42],[0.58,0.5],[0.59,0.63],[0.56,0.74],[0.52,0.82],[0.48,0.78],[0.46,0.68],[0.46,0.56],[0.47,0.47]], desert);
  drawBlob([[0.69,0.17],[0.78,0.13],[0.88,0.18],[0.93,0.24],[0.92,0.31],[0.86,0.36],[0.81,0.33],[0.77,0.29],[0.73,0.3],[0.69,0.25]], land);
  drawBlob([[0.82,0.65],[0.87,0.62],[0.91,0.67],[0.9,0.77],[0.86,0.82],[0.82,0.77]], landDark);
  drawBlob([[0.34,0.1],[0.37,0.08],[0.4,0.11],[0.39,0.15],[0.35,0.15]], '#d8e6d0');
  drawBlob([[0.94,0.47],[0.97,0.46],[0.985,0.5],[0.96,0.52]], '#d8e6d0');

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
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
          emissive="#17365d"
          emissiveIntensity={0.28}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.012, 96, 96]} />
        <meshStandardMaterial color="#d9ecff" transparent opacity={0.09} depthWrite={false} roughness={1} metalness={0} />
      </mesh>

      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.05, 96, 96]} />
        <meshBasicMaterial color="#5ab0ff" transparent opacity={0.13} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
