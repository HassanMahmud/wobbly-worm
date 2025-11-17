# No-Grid Snake Game

A modern twist on the classic Snake game that removes the traditional grid-based movement system, allowing the snake to move smoothly in any direction within a continuous 2D space.

## Features

- **Continuous Movement**: Snake moves smoothly through 2D space without grid constraints
- **360-degree Control**: Full directional movement using arrow keys or WASD
- **Smooth Physics**: Realistic turning radius and momentum-based movement
- **Multiple Food Types**: Normal, bonus, and speed food with different effects
- **Visual Effects**: Particle systems, smooth animations, and pulsing food
- **Collision Detection**: Precise circle-to-circle collision detection
- **Boundary Wrapping**: Snake wraps around screen edges

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Development mode
docker-compose --profile dev up
```

## Game Controls

- **Arrow Keys / WASD**: Move the snake in any direction
- **Space**: Pause/unpause the game
- **R**: Reset the game
- **+/-**: Adjust speed (debug mode)

## Project Structure

```
src/
├── game/           # Core game logic
│   ├── Game.ts            # Main game class and loop
│   ├── Snake.ts           # Snake mechanics and physics
│   ├── Food.ts            # Food system and spawning
│   ├── CollisionDetector.ts # Collision detection
│   └── InputHandler.ts    # Input processing
├── graphics/       # Rendering system
│   ├── Renderer.ts        # Canvas rendering and effects
│   └── Camera.ts          # Camera system (future use)
├── utils/          # Utility classes
│   ├── Vector2D.ts        # 2D vector mathematics
│   ├── MathUtils.ts       # Mathematical utilities
│   └── Constants.ts       # Game configuration
└── types/          # TypeScript definitions
    └── GameTypes.ts       # Game-specific types
```

## Technical Details

- **Language**: TypeScript
- **Graphics**: HTML5 Canvas
- **Build Tool**: Vite
- **Testing**: Jest
- **Containerization**: Docker

## Game Architecture

The game uses a component-based architecture with:

- **Continuous Physics**: Movement based on velocity and time deltas
- **Smooth Turning**: Gradual direction changes with configurable turning radius
- **Spatial Collision**: Circle-to-circle collision detection for all game objects
- **Entity Management**: Separate classes for Snake, Food, and collision handling
- **State Management**: Clean game states (Menu, Playing, Paused, Game Over)

## Development

The project includes comprehensive TypeScript types, unit tests for core functionality, and a modern development setup with hot reloading.

Built for the AI Hackathon - showcasing smooth, physics-based gameplay in a classic game format.