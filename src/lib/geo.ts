import * as THREE from 'three';
import { ALTITUDE_SCALE, GLOBE_RADIUS } from './constants';

const degToRad = THREE.MathUtils.degToRad;

export function altitudeToRadius(altitudeMeters: number): number {
  return GLOBE_RADIUS + Math.max(0, altitudeMeters) * ALTITUDE_SCALE;
}

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = degToRad(90 - lat);
  const theta = degToRad(lon + 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function flightPosition(lat: number, lon: number, altitudeMeters: number): THREE.Vector3 {
  return latLonToVector3(lat, lon, altitudeToRadius(altitudeMeters));
}

export function tangentQuaternion(position: THREE.Vector3, trackDegrees: number): THREE.Quaternion {
  const up = position.clone().normalize();
  const northPole = new THREE.Vector3(0, 1, 0);

  let east = new THREE.Vector3().crossVectors(northPole, up);
  if (east.lengthSq() < 1e-6) {
    east = new THREE.Vector3(1, 0, 0);
  }
  east.normalize();
  const north = new THREE.Vector3().crossVectors(up, east).normalize();

  const heading = degToRad(trackDegrees);
  const forward = north.multiplyScalar(Math.cos(heading)).add(east.multiplyScalar(Math.sin(heading))).normalize();
  const right = new THREE.Vector3().crossVectors(forward, up).normalize();

  const matrix = new THREE.Matrix4().makeBasis(right, forward, up);
  return new THREE.Quaternion().setFromRotationMatrix(matrix);
}

export function lerpAngleDegrees(a: number, b: number, t: number): number {
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return a + delta * t;
}
