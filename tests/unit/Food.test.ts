import { Food, FoodManager } from '../../src/game/Food';
import { Vector2D } from '../../src/utils/Vector2D';
import { FoodType, Rectangle } from '../../src/types/GameTypes';
import { GAME_CONFIG } from '../../src/utils/Constants';

describe('Food', () => {
  let food: Food;

  beforeEach(() => {
    food = new Food(FoodType.NORMAL);
  });

  describe('initialization', () => {
    it('should initialize with correct type and properties', () => {
      expect(food.type).toBe(FoodType.NORMAL);
      expect(food.isActive).toBe(false);
      expect(food.value).toBe(10);
    });

    it('should initialize different food types correctly', () => {
      const normalFood = new Food(FoodType.NORMAL);
      const bonusFood = new Food(FoodType.BONUS);
      const speedFood = new Food(FoodType.SPEED);

      expect(normalFood.value).toBe(10);
      expect(bonusFood.value).toBe(50);
      expect(speedFood.value).toBe(25);
    });
  });

  describe('spawning', () => {
    const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };

    it('should spawn within bounds', () => {
      food.spawn(bounds);

      expect(food.isActive).toBe(true);
      expect(food.position.x).toBeGreaterThanOrEqual(bounds.x + food.radius * 2);
      expect(food.position.x).toBeLessThanOrEqual(bounds.x + bounds.width - food.radius * 2);
      expect(food.position.y).toBeGreaterThanOrEqual(bounds.y + food.radius * 2);
      expect(food.position.y).toBeLessThanOrEqual(bounds.y + bounds.height - food.radius * 2);
    });

    it('should avoid existing positions', () => {
      const existingPositions = [
        new Vector2D(100, 100),
        new Vector2D(200, 200),
        new Vector2D(300, 300)
      ];

      food.spawn(bounds, existingPositions);

      for (const pos of existingPositions) {
        const distance = food.position.distance(pos);
        expect(distance).toBeGreaterThan(food.radius * 3); // Should maintain minimum distance
      }
    });

    it('should handle small bounds gracefully', () => {
      const smallBounds: Rectangle = { x: 0, y: 0, width: 50, height: 50 };
      expect(() => food.spawn(smallBounds)).not.toThrow();
    });
  });

  describe('animation', () => {
    beforeEach(() => {
      const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };
      food.spawn(bounds);
    });

    it('should update animation properties', () => {
      const initialPulseScale = food.pulseScale;
      const initialRotationAngle = food.rotationAngle;

      food.update(100);

      // Animation properties should change
      expect(food.pulseScale).not.toBe(initialPulseScale);
    });

    it('should maintain reasonable pulse scale', () => {
      for (let i = 0; i < 100; i++) {
        food.update(20);
        expect(food.pulseScale).toBeGreaterThan(0.5);
        expect(food.pulseScale).toBeLessThan(2.0);
      }
    });

    it('should handle different animation speeds for different food types', () => {
      const normalFood = new Food(FoodType.NORMAL);
      const bonusFood = new Food(FoodType.BONUS);
      const speedFood = new Food(FoodType.SPEED);

      const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };
      normalFood.spawn(bounds);
      bonusFood.spawn(bounds);
      speedFood.spawn(bounds);

      const initialBonusAngle = bonusFood.rotationAngle;
      const initialSpeedAngle = speedFood.rotationAngle;

      // Update all foods
      normalFood.update(1000);
      bonusFood.update(1000);
      speedFood.update(1000);

      // Bonus and speed foods should rotate
      expect(bonusFood.rotationAngle).not.toBeCloseTo(initialBonusAngle);
      expect(speedFood.rotationAngle).not.toBeCloseTo(initialSpeedAngle);
    });
  });

  describe('collision detection', () => {
    beforeEach(() => {
      const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };
      food.spawn(bounds);
    });

    it('should detect collision correctly', () => {
      const nearPoint = food.position.add(new Vector2D(food.radius * 0.5, 0));
      const farPoint = food.position.add(new Vector2D(food.radius * 3, 0));

      expect(food.checkCollision(nearPoint, 5)).toBe(true);
      expect(food.checkCollision(farPoint, 5)).toBe(false);
    });

    it('should not detect collision when inactive', () => {
      food.consume(); // Make inactive
      const nearPoint = food.position.add(new Vector2D(food.radius * 0.5, 0));

      expect(food.checkCollision(nearPoint, 5)).toBe(false);
    });

    it('should consider pulse scale in collision detection', () => {
      // Update to change pulse scale
      food.update(500);

      const effectiveRadius = food.getEffectiveRadius();
      expect(effectiveRadius).not.toBe(food.radius);

      // Test collision at effective radius boundary
      const testPoint = food.position.add(new Vector2D(effectiveRadius, 0));
      expect(food.checkCollision(testPoint, 0)).toBe(true);
    });
  });

  describe('consumption', () => {
    it('should become inactive when consumed', () => {
      const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };
      food.spawn(bounds);

      expect(food.isActive).toBe(true);
      food.consume();
      expect(food.isActive).toBe(false);
    });
  });

  describe('static factory methods', () => {
    it('should create correct food types', () => {
      const normal = Food.createNormal();
      const bonus = Food.createBonus();
      const speed = Food.createSpeed();

      expect(normal.type).toBe(FoodType.NORMAL);
      expect(bonus.type).toBe(FoodType.BONUS);
      expect(speed.type).toBe(FoodType.SPEED);
    });

    it('should create random food', () => {
      const foods = [];
      for (let i = 0; i < 100; i++) {
        foods.push(Food.createRandom());
      }

      // Should have variety of food types
      const types = new Set(foods.map(f => f.type));
      expect(types.size).toBeGreaterThan(1);
    });
  });
});

describe('FoodManager', () => {
  let foodManager: FoodManager;
  const bounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };

  beforeEach(() => {
    foodManager = new FoodManager(bounds);
  });

  describe('initialization', () => {
    it('should initialize with no foods', () => {
      expect(foodManager.getFoods().length).toBe(0);
    });
  });

  describe('food spawning', () => {
    it('should spawn food over time', () => {
      const snakeSegments = [new Vector2D(400, 300)];

      // Simulate enough time to trigger spawning
      foodManager.update(GAME_CONFIG.FOOD.SPAWN_INTERVAL + 100, snakeSegments);

      expect(foodManager.getFoods().length).toBeGreaterThan(0);
    });

    it('should not exceed maximum food count', () => {
      const snakeSegments = [new Vector2D(400, 300)];

      // Simulate a lot of time to trigger multiple spawns
      for (let i = 0; i < 10; i++) {
        foodManager.update(GAME_CONFIG.FOOD.SPAWN_INTERVAL + 100, snakeSegments);
      }

      expect(foodManager.getFoods().length).toBeLessThanOrEqual(GAME_CONFIG.FOOD.MAX_FOOD_COUNT);
    });

    it('should force spawn when requested', () => {
      const snakeSegments = [new Vector2D(400, 300)];

      foodManager.forceSpawn(snakeSegments);
      expect(foodManager.getFoods().length).toBe(1);

      foodManager.forceSpawn(snakeSegments);
      expect(foodManager.getFoods().length).toBe(2);
    });
  });

  describe('collision detection', () => {
    it('should detect collisions and return consumed food', () => {
      const snakeSegments = [new Vector2D(400, 300)];
      foodManager.forceSpawn(snakeSegments);

      const foods = foodManager.getFoods();
      expect(foods.length).toBe(1);

      const food = foods[0];
      const collision = foodManager.checkCollisions(food.position, 10);

      expect(collision).toBe(food);
      expect(food.isActive).toBe(false);
    });

    it('should return null when no collision occurs', () => {
      const snakeSegments = [new Vector2D(400, 300)];
      foodManager.forceSpawn(snakeSegments);

      const farPoint = new Vector2D(0, 0);
      const collision = foodManager.checkCollisions(farPoint, 5);

      expect(collision).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove inactive foods', () => {
      const snakeSegments = [new Vector2D(400, 300)];
      foodManager.forceSpawn(snakeSegments);

      let foods = foodManager.getFoods();
      expect(foods.length).toBe(1);

      // Consume the food
      foods[0].consume();

      // Update should remove inactive food
      foodManager.update(100, snakeSegments);

      foods = foodManager.getFoods();
      expect(foods.length).toBe(0);
    });

    it('should reset correctly', () => {
      const snakeSegments = [new Vector2D(400, 300)];
      foodManager.forceSpawn(snakeSegments);
      foodManager.forceSpawn(snakeSegments);

      expect(foodManager.getFoods().length).toBe(2);

      foodManager.reset();
      expect(foodManager.getFoods().length).toBe(0);
    });
  });

  describe('bounds management', () => {
    it('should update bounds correctly', () => {
      const newBounds: Rectangle = { x: 100, y: 100, width: 600, height: 400 };
      foodManager.setBounds(newBounds);

      const snakeSegments = [new Vector2D(300, 250)];
      foodManager.forceSpawn(snakeSegments);

      const food = foodManager.getFoods()[0];
      expect(food.position.x).toBeGreaterThanOrEqual(newBounds.x);
      expect(food.position.x).toBeLessThanOrEqual(newBounds.x + newBounds.width);
      expect(food.position.y).toBeGreaterThanOrEqual(newBounds.y);
      expect(food.position.y).toBeLessThanOrEqual(newBounds.y + newBounds.height);
    });
  });
});