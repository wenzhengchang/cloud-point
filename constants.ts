import { ShapeType } from './types';

export const PARTICLE_COUNT = 8000;
export const CAMERA_FOV = 45;
export const CAMERA_POSITION = [0, 0, 15] as const;

export const SHAPE_CONFIGS = [
  { id: ShapeType.HEART, label: '浪漫爱心', icon: '❤️' },
  { id: ShapeType.FLOWER, label: '全息花朵', icon: '🌸' },
  { id: ShapeType.SATURN, label: '土星光环', icon: '🪐' },
  { id: ShapeType.FIREWORKS, label: '盛大烟花', icon: '🎆' },
];

// MediaPipe Vision Task URL
export const WASM_FILES_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";