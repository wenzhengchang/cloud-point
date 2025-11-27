import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';
import { PARTICLE_COUNT, CAMERA_POSITION, CAMERA_FOV } from '../constants';

// Declare types for R3F intrinsic elements to fix JSX errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      pointsMaterial: any;
      ambientLight: any;
      fog: any;
    }
  }
}

interface ParticleSceneProps {
  shape: ShapeType;
  color: string;
  handDistance: number;
  isTracking: boolean;
}

const Particles: React.FC<ParticleSceneProps> = ({ shape, color, handDistance, isTracking }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Memoize geometry based on shape selection
  const positions = useMemo(() => generateParticles(PARTICLE_COUNT, shape), [shape]);
  
  // Create geometry buffer
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // Store original positions for lerping
    geo.setAttribute('initialPosition', new THREE.BufferAttribute(Float32Array.from(positions), 3));
    return geo;
  }, [positions]);

  // Target scale logic
  const targetScale = useRef(1);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    timeRef.current += delta;
    const points = pointsRef.current;
    
    // Determine target scale based on hand tracking or breathing animation
    let desiredScale = 1;
    if (isTracking) {
      // Map hand distance (0.2 - 1.5) to a nice scale factor (0.5 - 2.5)
      desiredScale = 0.5 + handDistance * 2; 
    } else {
      // Idle breathing animation
      desiredScale = 1 + Math.sin(timeRef.current * 0.8) * 0.2;
    }

    // Smooth lerp to target scale
    targetScale.current = THREE.MathUtils.lerp(targetScale.current, desiredScale, delta * 3);

    // Rotate the whole system slowly
    points.rotation.y += delta * 0.1;
    if (shape === ShapeType.SATURN) {
       points.rotation.z = Math.sin(timeRef.current * 0.2) * 0.1;
    }

    // Animate individual particles for "aliveness"
    const positions = points.geometry.attributes.position.array as Float32Array;
    const initials = points.geometry.attributes.initialPosition.array as Float32Array;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ix = initials[i3];
      const iy = initials[i3 + 1];
      const iz = initials[i3 + 2];

      // Apply Scale
      let x = ix * targetScale.current;
      let y = iy * targetScale.current;
      let z = iz * targetScale.current;

      // Add some noise/turbulence
      if (shape === ShapeType.FIREWORKS) {
          // Fireworks explode outward continuously
          // For simplicity in this demo, we just jitter them
          x += Math.sin(timeRef.current * 2 + i) * 0.05;
          y += Math.cos(timeRef.current * 2 + i) * 0.05;
          z += Math.sin(timeRef.current * 2 + i) * 0.05;
      } else if (shape === ShapeType.FLOWER) {
          // Petals breathe
          const breathe = Math.sin(timeRef.current + x) * 0.1;
          x += x * breathe;
          y += y * breathe;
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const ParticleScene: React.FC<ParticleSceneProps> = (props) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Canvas
        camera={{ position: [...CAMERA_POSITION], fov: CAMERA_FOV }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <Particles {...props} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={!props.isTracking} 
          autoRotateSpeed={0.5}
        />
        <fog attach="fog" args={['#000000', 10, 40]} />
      </Canvas>
    </div>
  );
};

export default ParticleScene;