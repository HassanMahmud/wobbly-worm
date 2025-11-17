# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **No-Grid Snake Game** - a modern twist on the classic Snake game that removes traditional grid-based movement, allowing smooth 360-degree movement in continuous 2D space. The project is built with TypeScript, HTML5 Canvas, and containerized with Docker.

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm run test
npm run test:watch

# Docker development
docker-compose up --build
```

### Project Structure (Target Architecture)

The project follows this modular structure:
- `src/game/` - Core game logic (Game.ts, Snake.ts, Food.ts, CollisionDetector.ts, InputHandler.ts)
- `src/graphics/` - Rendering system (Renderer.ts, Camera.ts)
- `src/utils/` - Utilities (Vector2D.ts, MathUtils.ts, Constants.ts)
- `src/types/` - TypeScript type definitions
- `tests/` - Unit and integration tests

## Core Architecture Concepts

### Movement System
- **Continuous Movement**: Snake moves smoothly through 2D space without grid constraints
- **360-degree Control**: Full directional movement using arrow keys/WASD
- **Physics-based**: Includes momentum, acceleration, and configurable turning radius
- **Collision Detection**: Precise circle-to-circle collision detection

### Key Classes and Responsibilities
- **Game**: Main game loop, state management, and coordination
- **Snake**: Movement, growth, self-collision detection using Vector2D segments
- **Food**: Random spawning, collision detection, multiple food types
- **Vector2D**: Essential utility class for all position/direction calculations
- **Renderer**: Canvas-based rendering with smooth animations and effects

### Game Configuration
All game parameters are centralized in `GAME_CONFIG` constant including:
- Canvas dimensions (800x600)
- Snake physics (speed: 100px/s, segment radius: 8px, turning radius: 15px)
- Food system (spawn intervals, collision radius)
- Physics constants (friction: 0.98, acceleration: 200)

## Technical Stack

- **TypeScript** with strict type checking
- **Vite** for build tooling and development server
- **HTML5 Canvas** for graphics rendering
- **Jest** for testing
- **Docker** for containerization
- **ESLint + Prettier** for code quality

## Development Guidelines

### Performance Targets
- 60 FPS gameplay with smooth animations
- Sub-16ms input lag for responsive controls
- Efficient collision detection using spatial partitioning for large snakes
- Canvas optimization (only redraw changed areas)

### Input System
Implement `InputState` interface supporting:
- Arrow keys/WASD for direction control
- Space for pause/unpause
- R for reset
- Plus/Minus for speed adjustment (debug mode)

### Game States
Use `GameState` enum: MENU, PLAYING, PAUSED, GAME_OVER with proper state transitions.

### Testing Strategy
- Unit tests for Snake movement, collision detection, food system, input handling
- Integration tests for complete game flow and state management
- Performance tests for frame rate and memory usage

## Key Implementation Notes

- Use `requestAnimationFrame` with delta time for smooth animation
- Implement object pooling for segments and particles to minimize memory allocation
- Snake segments are stored as `Vector2D[]` array with circular collision detection
- Food spawns randomly within canvas bounds with configurable collision radius
- Self-collision occurs when snake head touches any body segment
- Boundary collision behavior is configurable (wrap-around or death)

## Docker Configuration

The project includes Docker setup with:
- Node.js 18 Alpine base image
- Development volume mounting for hot reload
- Port 3000 exposure for web access
- Environment variable support for different modes