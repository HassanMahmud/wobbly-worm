# WobblyWorm Game Specification

## Overview

A modern twist on the classic Snake game that removes the traditional grid-based movement system, allowing the worm to move smoothly in any direction within a continuous 2D space. WobblyWorm features fluid, physics-based movement that creates naturally curved and wobbly paths.

## Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Graphics**: HTML5 Canvas
- **Containerization**: Docker
- **Build Tool**: Vite or Webpack
- **Package Manager**: npm/yarn

## Core Gameplay Features

### Worm Mechanics

- **Continuous Movement**: Worm moves smoothly through 2D space without grid constraints
- **Directional Control**: Full 360-degree movement using arrow keys or WASD
- **Wobbly Turning**: Worm can change direction gradually, creating naturally curved and wobbly paths
- **Collision Detection**: Precise collision detection using circular segments
- **Growth System**: Worm grows by adding segments when consuming food

### Movement System

- **Speed Control**: Adjustable snake speed (pixels per frame)
- **Momentum**: Optional momentum-based movement for more realistic physics
- **Turning Radius**: Configurable minimum turning radius to prevent sharp turns
- **Acceleration**: Smooth acceleration and deceleration

### Food System

- **Random Spawning**: Food appears at random positions in the play area
- **Multiple Food Types**: Different food types with varying point values
- **Visual Feedback**: Animated food with visual effects
- **Collision Radius**: Configurable collision detection radius

### Collision Detection

- **Self-Collision**: Worm dies when head touches any part of its body
- **Boundary Collision**: Configurable boundary behavior (wrap-around or death)
- **Precise Detection**: Circle-to-circle collision detection for smooth gameplay

## Technical Architecture

### Project Structure

```
wobblyworm/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── game/
│   │   ├── Game.ts
│   │   ├── Worm.ts
│   │   ├── Food.ts
│   │   ├── CollisionDetector.ts
│   │   └── InputHandler.ts
│   ├── graphics/
│   │   ├── Renderer.ts
│   │   └── Camera.ts
│   ├── utils/
│   │   ├── Vector2D.ts
│   │   ├── MathUtils.ts
│   │   └── Constants.ts
│   └── types/
│       └── GameTypes.ts
├── public/
│   └── assets/
└── tests/
    ├── unit/
    └── integration/
```

### Core Classes

#### Game Class

- **Responsibility**: Main game loop and state management
- **Methods**:
  - `init()`: Initialize game components
  - `update(deltaTime: number)`: Update game state
  - `render()`: Render current frame
  - `handleInput(input: InputState)`: Process player input
  - `reset()`: Reset game to initial state

#### Worm Class

- **Properties**:
  - `segments: Vector2D[]`: Array of segment positions
  - `direction: Vector2D`: Current movement direction
  - `speed: number`: Movement speed in pixels per second
  - `radius: number`: Segment radius for collision detection
  - `wobbleAmplitude: number`: Amplitude of the wobbly movement
- **Methods**:
  - `update(deltaTime: number)`: Update worm position and segments with wobble effect
  - `turn(newDirection: Vector2D)`: Change movement direction with smooth wobbling
  - `grow()`: Add new segment to worm
  - `checkSelfCollision(): boolean`: Check for self-collision

#### Food Class

- **Properties**:
  - `position: Vector2D`: Food position
  - `radius: number`: Collision radius
  - `value: number`: Point value
  - `type: FoodType`: Food type enumeration
- **Methods**:
  - `spawn(bounds: Rectangle)`: Spawn at random position
  - `checkCollision(point: Vector2D, radius: number): boolean`

#### Vector2D Utility Class

- **Properties**:
  - `x: number`, `y: number`: Coordinates
- **Methods**:
  - `add(other: Vector2D): Vector2D`
  - `subtract(other: Vector2D): Vector2D`
  - `multiply(scalar: number): Vector2D`
  - `magnitude(): number`
  - `normalize(): Vector2D`
  - `distance(other: Vector2D): number`

## Docker Configuration

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  wobblyworm-game:
    build: .
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## Game Configuration

### Constants

```typescript
export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#1a1a2e',
  },
  WORM: {
    INITIAL_SPEED: 100, // pixels per second
    SEGMENT_RADIUS: 8,
    INITIAL_LENGTH: 5,
    GROWTH_RATE: 2,
    MIN_TURNING_RADIUS: 15,
    WOBBLE_FREQUENCY: 2.0, // wobbles per second
    WOBBLE_AMPLITUDE: 5, // maximum wobble distance in pixels
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
```

## Input System

### Controls

- **Arrow Keys / WASD**: Direction control
- **Space**: Pause/unpause game
- **R**: Reset game
- **Plus/Minus**: Adjust game speed (debug mode)

### Input Handling

```typescript
interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  reset: boolean;
}
```

## Graphics and Rendering

### Canvas Rendering

- **Worm Segments**: Circular segments with gradient effects and wobble animation
- **Food**: Pulsating circles with particle effects
- **Background**: Subtle pattern or solid color
- **UI Elements**: Score, speed, and game state indicators

### Visual Effects

- **Wobbly Movement**: Interpolated movement between frames with natural wobble effects
- **Particle Systems**: Food consumption and collision effects
- **Trail Effects**: Optional worm trail visualization with wobble history
- **Responsive Design**: Canvas scales to window size

## Game States

### State Management

```typescript
enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}
```

### State Transitions

- **Menu → Playing**: Start new game
- **Playing → Paused**: Space key pressed
- **Playing → Game Over**: Collision detected
- **Game Over → Menu**: Reset key pressed

## Development Workflow

### Setup Commands

```bash
# Build and run with Docker
docker-compose up --build

# Development mode (local)
npm install
npm run dev

# Testing
npm run test
npm run test:watch

# Build for production
npm run build
```

### Development Features

- **Hot Reload**: Automatic reloading during development
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing framework

## Performance Considerations

### Optimization Strategies

- **Efficient Collision Detection**: Spatial partitioning for large snakes
- **Canvas Optimization**: Only redraw changed areas
- **Memory Management**: Object pooling for segments and particles
- **Smooth Animation**: RequestAnimationFrame with delta time

### Target Performance

- **60 FPS**: Smooth gameplay at 60 frames per second
- **Low Memory**: Minimal memory allocation during gameplay
- **Responsive**: Sub-16ms input lag

## Future Enhancements

### Planned Features

- **Multiplayer Support**: Real-time multiplayer gameplay
- **Power-ups**: Special abilities and temporary effects
- **Procedural Obstacles**: Dynamic barriers and challenges
- **Leaderboards**: Score tracking and persistence
- **Mobile Support**: Touch controls for mobile devices
- **Sound System**: Audio effects and background music

### Extensibility

- **Plugin System**: Modular game mode support
- **Theme System**: Customizable visual themes
- **Configuration**: Runtime game parameter adjustment
- **Replay System**: Record and playback gameplay sessions

## Testing Strategy

### Unit Tests

- **Worm Movement**: Verify accurate position updates and wobble effects
- **Collision Detection**: Test all collision scenarios
- **Food System**: Validate spawning and consumption
- **Input Handling**: Confirm proper input processing

### Integration Tests

- **Game Flow**: Complete game lifecycle testing
- **State Management**: State transition validation
- **Performance**: Frame rate and memory usage tests

### Manual Testing

- **Gameplay Feel**: Subjective movement quality assessment
- **UI/UX**: User interface responsiveness and clarity
- **Cross-browser**: Compatibility across different browsers

This specification provides a comprehensive foundation for building WobblyWorm, a modern, grid-less worm game with natural wobbly movement using TypeScript and Docker.
