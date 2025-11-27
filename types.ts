export enum ShapeType {
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  FIREWORKS = 'FIREWORKS'
}

export interface ParticleState {
  shape: ShapeType;
  color: string;
  handDistance: number; // Normalized 0 to 1+
  isTracking: boolean;
}

export interface HandLandmarkerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
}