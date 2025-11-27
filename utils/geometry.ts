import { ShapeType } from '../types';
import * as THREE from 'three';

// Helper to get random point in sphere
const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateParticles = (count: number, type: ShapeType): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const i3 = i * 3;

    switch (type) {
      case ShapeType.HEART: {
        // Parametric Heart
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Expand to 3D by rotating or adding depth
        const t = Math.random() * Math.PI * 2;
        const r = Math.random(); // volume
        // Basic heart shape in 2D
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        // Add thickness/volume
        const depth = (Math.random() - 0.5) * 4;
        
        x = hx * 0.2;
        y = hy * 0.2;
        z = depth;
        break;
      }
      
      case ShapeType.FLOWER: {
        // Polar rose: r = cos(k * theta)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const k = 4; // 4 petals
        const r = 3 * Math.sin(k * theta) + 1.5; // +1.5 to give it some body
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi) * 0.5; // Flatten slightly
        break;
      }

      case ShapeType.SATURN: {
        const isRing = Math.random() > 0.4;
        if (isRing) {
            // Ring
            const angle = Math.random() * Math.PI * 2;
            const dist = 3.5 + Math.random() * 2.5; // Ring radius 3.5 to 6
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
            y = (Math.random() - 0.5) * 0.2; // Thin ring
        } else {
            // Planet
            const p = randomInSphere(2.0);
            x = p.x;
            y = p.y;
            z = p.z;
        }
        
        // Tilt Saturn
        const tilt = Math.PI / 6;
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);
        const newX = x * cosT - y * sinT;
        const newY = x * sinT + y * cosT;
        x = newX;
        y = newY;
        break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion sphere but with trails
        const p = randomInSphere(4.5);
        x = p.x;
        y = p.y;
        z = p.z;
        break;
      }

      default:
        x = (Math.random() - 0.5) * 5;
        y = (Math.random() - 0.5) * 5;
        z = (Math.random() - 0.5) * 5;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};