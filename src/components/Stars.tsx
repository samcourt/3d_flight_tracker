import { useMemo } from 'react';
import * as THREE from 'three';

export function Stars({ count = 4000, radius = 120 }: { count?: number; radius?: number }) {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const r = radius * (0.8 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const idx = i * 3;

      pos[idx] = r * Math.sin(phi) * Math.cos(theta);
      pos[idx + 1] = r * Math.cos(phi);
      pos[idx + 2] = r * Math.sin(phi) * Math.sin(theta);

      color.setHSL(0.55 + Math.random() * 0.12, 0.4, 0.75 + Math.random() * 0.2);
      col[idx] = color.r;
      col[idx + 1] = color.g;
      col[idx + 2] = color.b;
    }

    return [pos, col];
  }, [count, radius]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.18} sizeAttenuation transparent opacity={0.9} depthWrite={false} vertexColors />
    </points>
  );
}
