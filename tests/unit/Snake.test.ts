import { Snake } from '../../src/game/Snake';
import { Vector2D } from '../../src/utils/Vector2D';
import { GAME_CONFIG } from '../../src/utils/Constants';

describe('Snake', () => {
  let snake: Snake;
  const startPosition = new Vector2D(100, 100);

  beforeEach(() => {
    snake = new Snake(startPosition);
  });

  describe('initialization', () => {
    it('should initialize with correct starting position', () => {
      const head = snake.getHead();
      expect(head.x).toBe(startPosition.x);
      expect(head.y).toBe(startPosition.y);
    });

    it('should initialize with correct length', () => {
      expect(snake.getLength()).toBe(GAME_CONFIG.SNAKE.INITIAL_LENGTH);
    });

    it('should initialize moving right', () => {
      expect(snake.direction.x).toBeCloseTo(1);
      expect(snake.direction.y).toBeCloseTo(0);
    });

    it('should initialize as alive', () => {
      expect(snake.isAlive).toBe(true);
    });

    it('should initialize with correct speed', () => {
      expect(snake.speed).toBe(GAME_CONFIG.SNAKE.INITIAL_SPEED);
    });
  });

  describe('movement', () => {
    it('should move forward when updated', () => {
      const initialHead = snake.getHead();
      snake.update(1000); // 1 second

      const newHead = snake.getHead();
      expect(newHead.x).toBeGreaterThan(initialHead.x);
      expect(newHead.y).toBeCloseTo(initialHead.y);
    });

    it('should maintain segment spacing', () => {
      snake.update(1000);

      for (let i = 1; i < snake.segments.length; i++) {
        const distance = snake.segments[i - 1].distance(snake.segments[i]);
        expect(distance).toBeLessThanOrEqual(snake.radius * 2.1); // Allow small tolerance
      }
    });

    it('should turn smoothly', () => {
      const newDirection = Vector2D.up();
      snake.turn(newDirection);

      // Should not turn instantly
      expect(snake.direction.equals(newDirection)).toBe(false);

      // After multiple updates, should approach target direction
      for (let i = 0; i < 10; i++) {
        snake.update(100);
      }

      expect(snake.direction.x).toBeCloseTo(0, 1);
      expect(snake.direction.y).toBeCloseTo(-1, 1);
    });

    it('should not reverse direction immediately', () => {
      const initialDirection = snake.direction.clone();
      const oppositeDirection = Vector2D.left(); // Opposite of initial right direction

      snake.turn(oppositeDirection);
      snake.update(100);

      // Should not have turned to opposite direction
      expect(snake.direction.dot(initialDirection)).toBeGreaterThan(0);
    });
  });

  describe('growth', () => {
    it('should grow when grow() is called', () => {
      const initialLength = snake.getLength();
      snake.grow();

      expect(snake.getLength()).toBe(initialLength + GAME_CONFIG.SNAKE.GROWTH_RATE);
    });

    it('should add segments at the tail', () => {
      const initialTail = snake.segments[snake.segments.length - 1].clone();
      snake.grow();

      // New segments should be behind the original tail
      const newLength = snake.getLength();
      for (let i = newLength - GAME_CONFIG.SNAKE.GROWTH_RATE; i < newLength; i++) {
        const segment = snake.segments[i];
        expect(segment).toBeDefined();
      }
    });
  });

  describe('collision detection', () => {
    it('should not detect self-collision with short snake', () => {
      expect(snake.checkSelfCollision()).toBe(false);
      expect(snake.isAlive).toBe(true);
    });

    it('should detect self-collision when segments overlap', () => {
      // Grow snake to make it long enough for self-collision
      for (let i = 0; i < 10; i++) {
        snake.grow();
      }

      // Move in a circle to create self-collision
      const directions = [Vector2D.up(), Vector2D.left(), Vector2D.down(), Vector2D.right()];
      let dirIndex = 0;

      for (let i = 0; i < 50; i++) {
        if (i % 10 === 0) {
          snake.turn(directions[dirIndex % directions.length]);
          dirIndex++;
        }
        snake.update(50);

        if (!snake.isAlive) {
          break;
        }
      }

      // Snake should eventually collide with itself
      expect(snake.isAlive).toBe(false);
    });

    it('should handle boundary collision', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      // Move snake to the right edge
      for (let i = 0; i < 100; i++) {
        snake.update(100);
        if (snake.getHead().x > canvasWidth) break;
      }

      const collision = snake.checkBoundaryCollision(canvasWidth, canvasHeight);
      expect(collision).toBe(true);
      expect(snake.isAlive).toBe(false);
    });

    it('should handle boundary wrapping', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;

      // Move snake to the right edge
      const initialX = snake.getHead().x;
      for (let i = 0; i < 100; i++) {
        snake.update(100);
        if (snake.getHead().x > canvasWidth) break;
      }

      snake.wrapAroundBounds(canvasWidth, canvasHeight);

      // Head should wrap to the left side
      expect(snake.getHead().x).toBeLessThan(initialX);
      expect(snake.isAlive).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('should calculate score correctly', () => {
      const initialScore = snake.getScore();
      snake.grow();
      const newScore = snake.getScore();

      expect(newScore).toBeGreaterThan(initialScore);
    });

    it('should increase speed correctly', () => {
      const initialSpeed = snake.speed;
      snake.increaseSpeed(50);

      expect(snake.speed).toBe(initialSpeed + 50);
    });

    it('should reset correctly', () => {
      // Modify snake state
      snake.grow();
      snake.turn(Vector2D.up());
      snake.increaseSpeed(100);
      snake.isAlive = false;

      // Reset
      const resetPosition = new Vector2D(200, 200);
      snake.reset(resetPosition);

      // Should be back to initial state
      expect(snake.getHead().x).toBe(resetPosition.x);
      expect(snake.getHead().y).toBe(resetPosition.y);
      expect(snake.getLength()).toBe(GAME_CONFIG.SNAKE.INITIAL_LENGTH);
      expect(snake.isAlive).toBe(true);
      expect(snake.speed).toBe(GAME_CONFIG.SNAKE.INITIAL_SPEED);
      expect(snake.direction.x).toBeCloseTo(1);
      expect(snake.direction.y).toBeCloseTo(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero delta time', () => {
      const initialHead = snake.getHead();
      snake.update(0);

      const newHead = snake.getHead();
      expect(newHead.x).toBeCloseTo(initialHead.x);
      expect(newHead.y).toBeCloseTo(initialHead.y);
    });

    it('should handle very large delta time', () => {
      const initialHead = snake.getHead();
      snake.update(10000); // 10 seconds

      const newHead = snake.getHead();
      expect(newHead.x).toBeGreaterThan(initialHead.x);
      expect(isFinite(newHead.x)).toBe(true);
      expect(isFinite(newHead.y)).toBe(true);
    });

    it('should handle single segment snake', () => {
      // Create a snake with minimal segments
      const singleSegmentSnake = new Snake(startPosition);
      // Remove all but one segment (this would be unusual but test edge case)
      singleSegmentSnake.segments = [startPosition.clone()];

      expect(() => singleSegmentSnake.update(100)).not.toThrow();
      expect(() => singleSegmentSnake.grow()).not.toThrow();
    });
  });
});