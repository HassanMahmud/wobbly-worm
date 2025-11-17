export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

export enum FoodType {
  NORMAL = 'normal',
  BONUS = 'bonus',
  SPEED = 'speed',
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  reset: boolean;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameConfig {
  CANVAS: {
    WIDTH: number;
    HEIGHT: number;
    BACKGROUND_COLOR: string;
  };
  SNAKE: {
    INITIAL_SPEED: number;
    SEGMENT_RADIUS: number;
    INITIAL_LENGTH: number;
    GROWTH_RATE: number;
    MIN_TURNING_RADIUS: number;
  };
  FOOD: {
    RADIUS: number;
    SPAWN_INTERVAL: number;
    MAX_FOOD_COUNT: number;
  };
  PHYSICS: {
    FRICTION: number;
    ACCELERATION: number;
  };
}