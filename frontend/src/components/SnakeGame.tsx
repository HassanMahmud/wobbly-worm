import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { apiClient } from '../api';

interface SnakeGameProps {
  userId?: string;
  userName?: string;
  isGuest?: boolean;
  onGameEnd: (score: number, foodCount: number, gameTime: number) => void;
}

const GRID_WIDTH = 50;
const GRID_HEIGHT = 25;
const CELL_SIZE = 60;
const INITIAL_SPEED = 100;

// Food types with different appearances
const FOOD_TYPES = [
  { emoji: '🍕', color: '#ff6b35', name: 'Pizza' },
  { emoji: '🍗', color: '#d4a574', name: 'Chicken' },
  { emoji: '🎂', color: '#ff69b4', name: 'Cake' },
  { emoji: '🍬', color: '#ff6b9d', name: 'Candy' },
  { emoji: '🍪', color: '#d4a574', name: 'Cookie' },
  { emoji: '🍓', color: '#e63946', name: 'Strawberry' },
];

const getRandomFoodType = () => Math.floor(Math.random() * FOOD_TYPES.length);

export const SnakeGame: React.FC<SnakeGameProps> = ({
  userId,
  userName,
  onGameEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialFoodType = getRandomFoodType();
  const [gameState, setGameState] = useState<GameState>({
    snake: [[25, 12]],
    food: [35, 18],
    foodSpawnTime: 0,
    foodType: initialFoodType,
    score: 0,
    foodCount: 0,
    gameTime: 0,
    isPaused: false,
    isGameOver: false,
    direction: [1, 0],
    nextDirection: [1, 0],
  });
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    gradient.addColorStop(0, '#0f0f1e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 100, 120, 0.1)';
    ctx.lineWidth = 0.5;
    // Draw vertical lines
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    // Draw horizontal lines
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake with better snake-like graphics
    gameState.snake.forEach((segment, index) => {
      const x = segment[0] * CELL_SIZE;
      const y = segment[1] * CELL_SIZE;
      const radius = 6;

      if (index === 0) {
        // Snake head with gradient and eyes
        const headGradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        headGradient.addColorStop(0, '#00ff66');
        headGradient.addColorStop(1, '#00cc44');
        ctx.fillStyle = headGradient;

        // Rounded head
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + CELL_SIZE - radius, y);
        ctx.quadraticCurveTo(x + CELL_SIZE, y, x + CELL_SIZE, y + radius);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - radius);
        ctx.quadraticCurveTo(x + CELL_SIZE, y + CELL_SIZE, x + CELL_SIZE - radius, y + CELL_SIZE);
        ctx.lineTo(x + radius, y + CELL_SIZE);
        ctx.quadraticCurveTo(x, y + CELL_SIZE, x, y + CELL_SIZE - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Draw snake eyes based on direction
        ctx.fillStyle = '#000';
        const eyeSize = 2;
        if (gameState.direction[0] === 1) { // Moving right
          ctx.fillRect(x + CELL_SIZE - 6, y + 5, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - 6, y + CELL_SIZE - 7, eyeSize, eyeSize);
        } else if (gameState.direction[0] === -1) { // Moving left
          ctx.fillRect(x + 4, y + 5, eyeSize, eyeSize);
          ctx.fillRect(x + 4, y + CELL_SIZE - 7, eyeSize, eyeSize);
        } else if (gameState.direction[1] === -1) { // Moving up
          ctx.fillRect(x + 5, y + 4, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - 7, y + 4, eyeSize, eyeSize);
        } else { // Moving down
          ctx.fillRect(x + 5, y + CELL_SIZE - 6, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - 7, y + CELL_SIZE - 6, eyeSize, eyeSize);
        }
      } else {
        // Snake body with gradient
        const bodyGradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        const intensity = Math.max(0.4, 1 - index / gameState.snake.length);
        bodyGradient.addColorStop(0, `rgba(0, 255, 100, ${intensity})`);
        bodyGradient.addColorStop(1, `rgba(0, 200, 100, ${intensity * 0.8})`);
        ctx.fillStyle = bodyGradient;

        // Rounded body segment
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + CELL_SIZE - radius, y);
        ctx.quadraticCurveTo(x + CELL_SIZE, y, x + CELL_SIZE, y + radius);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - radius);
        ctx.quadraticCurveTo(x + CELL_SIZE, y + CELL_SIZE, x + CELL_SIZE - radius, y + CELL_SIZE);
        ctx.lineTo(x + radius, y + CELL_SIZE);
        ctx.quadraticCurveTo(x, y + CELL_SIZE, x, y + CELL_SIZE - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Add border for depth
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw food with emoji and glow
    const foodX = gameState.food[0] * CELL_SIZE;
    const foodY = gameState.food[1] * CELL_SIZE;
    const currentFood = FOOD_TYPES[gameState.foodType];

    // Food circle background
    ctx.fillStyle = currentFood.color;
    ctx.beginPath();
    ctx.arc(foodX + CELL_SIZE / 2, foodY + CELL_SIZE / 2, CELL_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Food glow effect
    ctx.strokeStyle = currentFood.color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw emoji
    ctx.font = `bold ${CELL_SIZE * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(currentFood.emoji, foodX + CELL_SIZE / 2, foodY + CELL_SIZE / 2);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        const newSnake = [...prev.snake];
        const direction = prev.nextDirection;

        // Calculate new head
        const head = newSnake[0];
        let newHead = [head[0] + direction[0], head[1] + direction[1]];

        // Wrap around edges instead of ending game
        newHead[0] = (newHead[0] + GRID_WIDTH) % GRID_WIDTH;
        newHead[1] = (newHead[1] + GRID_HEIGHT) % GRID_HEIGHT;

        // Check collision with self
        if (newSnake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])) {
          return { ...prev, isGameOver: true };
        }

        newSnake.unshift(newHead);

        // Check food collision
        if (newHead[0] === prev.food[0] && newHead[1] === prev.food[1]) {
          const newFoodCount = prev.foodCount + 1;
          // Calculate points: Base 10 points minus time penalty (0.1 points per second)
          const timeToConsume = prev.gameTime - prev.foodSpawnTime;
          const pointsEarned = Math.max(1, 10 - Math.floor(timeToConsume * 0.1));
          const newScore = prev.score + pointsEarned;
          const newFoodType = getRandomFoodType();

          return {
            ...prev,
            score: newScore,
            foodCount: newFoodCount,
            direction,
            nextDirection: direction,
            food: [Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT)],
            foodType: newFoodType,
            foodSpawnTime: prev.gameTime,
            snake: newSnake,
          };
        } else {
          newSnake.pop();
        }

        return {
          ...prev,
          snake: newSnake,
          direction,
          nextDirection: direction,
        };
      });
    }, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused]);

  // Timer
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    timerRef.current = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        gameTime: prev.gameTime + 1,
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      switch (key) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          setGameState((prev) => ({
            ...prev,
            nextDirection: prev.direction[1] === 0 ? [0, -1] : prev.nextDirection,
          }));
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          setGameState((prev) => ({
            ...prev,
            nextDirection: prev.direction[1] === 0 ? [0, 1] : prev.nextDirection,
          }));
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          setGameState((prev) => ({
            ...prev,
            nextDirection: prev.direction[0] === 0 ? [-1, 0] : prev.nextDirection,
          }));
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          setGameState((prev) => ({
            ...prev,
            nextDirection: prev.direction[0] === 0 ? [1, 0] : prev.nextDirection,
          }));
          break;
        case ' ':
          e.preventDefault();
          setGameState((prev) => ({
            ...prev,
            isPaused: !prev.isPaused,
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      // Save score for both authenticated users and guests
      if (userId) {
        apiClient.submitScore(
          userId,
          gameState.score,
          gameState.foodCount,
          gameState.gameTime
        ).catch(err => console.error('Failed to save score:', err));
      }

      setTimeout(() => {
        onGameEnd(gameState.score, gameState.foodCount, gameState.gameTime);
      }, 500);
    }
  }, [gameState.isGameOver, gameState.score, gameState.foodCount, gameState.gameTime, userId, onGameEnd]);

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div className="game-board">
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * CELL_SIZE}
          height={GRID_HEIGHT * CELL_SIZE}
        />
      </div>

      <div className="game-info">
        <div className="game-info-item">
          <p>👤 Player</p>
          <span>{userName || 'Guest'}</span>
        </div>
        <div className="game-info-item">
          <p>⭐ Score</p>
          <span>{gameState.score}</span>
        </div>
        <div className="game-info-item">
          <p>🍎 Food</p>
          <span>{gameState.foodCount}</span>
        </div>
        <div className="game-info-item">
          <p>⏱️ Time</p>
          <span>{gameState.gameTime}s</span>
        </div>
      </div>

      <div style={{ marginTop: '25px', color: 'white', fontSize: '15px', fontWeight: '500' }}>
        <p style={{ marginBottom: '10px' }}>🎮 Arrow Keys or WASD to move | Spacebar to pause</p>
        {gameState.isPaused && <p style={{ color: '#667eea', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>⏸️ PAUSED</p>}
        {gameState.isGameOver && <p style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>💀 GAME OVER!</p>}
      </div>
    </div>
  );
};
