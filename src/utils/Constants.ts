import { GameConfig } from '@/types/GameTypes.js';

export const GAME_CONFIG: GameConfig = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#1a1a2e',
  },
  SNAKE: {
    INITIAL_SPEED: 100, // pixels per second
    SEGMENT_RADIUS: 8,
    INITIAL_LENGTH: 5,
    GROWTH_RATE: 2,
    MIN_TURNING_RADIUS: 15,
  },
  FOOD: {
    RADIUS: 6,
    SPAWN_INTERVAL: 3000, // milliseconds
    MAX_FOOD_COUNT: 3,
  },
  PHYSICS: {
    FRICTION: 0.98,
    ACCELERATION: 200,
  },
};

export const COLORS = {
  SNAKE_HEAD: '#00ff88',
  SNAKE_BODY: '#00cc66',
  SNAKE_TAIL: '#008844',
  FOOD_NORMAL: '#ff6b6b',
  FOOD_BONUS: '#ffd93d',
  FOOD_SPEED: '#6bcf7f',
  UI_TEXT: '#ffffff',
  UI_BACKGROUND: 'rgba(255, 255, 255, 0.1)',
  BOUNDARY: '#333333',
};

export const KEYS = {
  // Arrow keys
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',

  // WASD keys
  W: 'KeyW',
  A: 'KeyA',
  S: 'KeyS',
  D: 'KeyD',

  // Control keys
  SPACE: 'Space',
  R: 'KeyR',
  PLUS: 'Equal',
  MINUS: 'Minus',
};

export const FOOD_VALUES = {
  [FoodType.NORMAL]: 10,
  [FoodType.BONUS]: 50,
  [FoodType.SPEED]: 25,
};

// Import FoodType enum for the FOOD_VALUES constant
import { FoodType } from '@/types/GameTypes.js';

export const PHYSICS_CONSTANTS = {
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 1000 / 30, // Cap at 30 FPS minimum
  COLLISION_TOLERANCE: 0.1,
};

export const DEBUG = {
  SHOW_COLLISION_CIRCLES: false,
  SHOW_SEGMENT_INDICES: false,
  SHOW_VELOCITY_VECTORS: false,
  LOG_PERFORMANCE: false,
};