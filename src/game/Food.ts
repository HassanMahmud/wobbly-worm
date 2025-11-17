import { Vector2D } from '@/utils/Vector2D.js';
import { MathUtils } from '@/utils/MathUtils.js';
import { FoodType, Rectangle } from '@/types/GameTypes.js';
import { GAME_CONFIG, FOOD_VALUES } from '@/utils/Constants.js';

export class Food {
  public position: Vector2D = Vector2D.zero();
  public radius: number = GAME_CONFIG.FOOD.RADIUS;
  public value: number = 10;
  public type: FoodType = FoodType.NORMAL;
  public isActive: boolean = false;

  // Animation properties
  public animationTime: number = 0;
  public pulseScale: number = 1;
  public rotationAngle: number = 0;

  private maxAnimationTime: number = 2000; // 2 seconds per pulse cycle
  private baseRadius: number = GAME_CONFIG.FOOD.RADIUS;

  constructor(type: FoodType = FoodType.NORMAL) {
    this.type = type;
    this.value = FOOD_VALUES[type];
    this.setPropertiesForType();
  }

  private setPropertiesForType(): void {
    switch (this.type) {
      case FoodType.NORMAL:
        this.radius = this.baseRadius;
        break;
      case FoodType.BONUS:
        this.radius = this.baseRadius * 1.3;
        break;
      case FoodType.SPEED:
        this.radius = this.baseRadius * 0.8;
        break;
    }
  }

  public spawn(bounds: Rectangle, existingPositions: Vector2D[] = []): void {
    const maxAttempts = 50;
    let attempts = 0;

    do {
      this.position = this.generateRandomPosition(bounds);
      attempts++;
    } while (
      attempts < maxAttempts &&
      this.isPositionTooClose(existingPositions)
    );

    this.isActive = true;
    this.animationTime = Math.random() * this.maxAnimationTime;
    this.rotationAngle = Math.random() * Math.PI * 2;
  }

  private generateRandomPosition(bounds: Rectangle): Vector2D {
    // Add padding to ensure food doesn't spawn too close to edges
    const padding = this.radius * 2;

    const x = MathUtils.random(
      bounds.x + padding,
      bounds.x + bounds.width - padding
    );
    const y = MathUtils.random(
      bounds.y + padding,
      bounds.y + bounds.height - padding
    );

    return new Vector2D(x, y);
  }

  private isPositionTooClose(existingPositions: Vector2D[]): boolean {
    const minDistance = this.radius * 4; // Minimum distance from other objects

    for (const pos of existingPositions) {
      if (this.position.distance(pos) < minDistance) {
        return true;
      }
    }

    return false;
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update animation time
    this.animationTime += deltaTime;
    if (this.animationTime > this.maxAnimationTime) {
      this.animationTime = 0;
    }

    // Calculate pulsing effect
    const pulseProgress = this.animationTime / this.maxAnimationTime;
    this.pulseScale = 1 + Math.sin(pulseProgress * Math.PI * 4) * 0.2;

    // Update rotation for certain food types
    if (this.type === FoodType.BONUS) {
      this.rotationAngle += (deltaTime / 1000) * Math.PI; // Rotate 180 degrees per second
    } else if (this.type === FoodType.SPEED) {
      this.rotationAngle += (deltaTime / 1000) * Math.PI * 2; // Rotate 360 degrees per second
    }
  }

  public checkCollision(point: Vector2D, collisionRadius: number): boolean {
    if (!this.isActive) return false;

    const distance = this.position.distance(point);
    const totalRadius = this.getEffectiveRadius() + collisionRadius;

    return distance <= totalRadius;
  }

  public getEffectiveRadius(): number {
    return this.radius * this.pulseScale;
  }

  public consume(): void {
    this.isActive = false;
  }

  public getColor(): string {
    switch (this.type) {
      case FoodType.NORMAL:
        return '#ff6b6b';
      case FoodType.BONUS:
        return '#ffd93d';
      case FoodType.SPEED:
        return '#6bcf7f';
      default:
        return '#ff6b6b';
    }
  }

  public getSecondaryColor(): string {
    switch (this.type) {
      case FoodType.NORMAL:
        return '#ff5252';
      case FoodType.BONUS:
        return '#ffcc02';
      case FoodType.SPEED:
        return '#4caf50';
      default:
        return '#ff5252';
    }
  }

  // Static factory methods for creating different food types
  static createNormal(): Food {
    return new Food(FoodType.NORMAL);
  }

  static createBonus(): Food {
    return new Food(FoodType.BONUS);
  }

  static createSpeed(): Food {
    return new Food(FoodType.SPEED);
  }

  static createRandom(): Food {
    const rand = Math.random();

    if (rand < 0.7) {
      return Food.createNormal();
    } else if (rand < 0.9) {
      return Food.createSpeed();
    } else {
      return Food.createBonus();
    }
  }
}

export class FoodManager {
  private foods: Food[] = [];
  private lastSpawnTime: number = 0;
  private spawnInterval: number = GAME_CONFIG.FOOD.SPAWN_INTERVAL;
  private maxFoodCount: number = GAME_CONFIG.FOOD.MAX_FOOD_COUNT;
  private bounds: Rectangle;

  constructor(bounds: Rectangle) {
    this.bounds = bounds;
  }

  public update(deltaTime: number, snakeSegments: Vector2D[]): void {
    // Update existing food items
    this.foods.forEach(food => food.update(deltaTime));

    // Remove inactive foods
    this.foods = this.foods.filter(food => food.isActive);

    // Try to spawn new food
    this.lastSpawnTime += deltaTime;
    if (this.shouldSpawnFood()) {
      this.spawnNewFood(snakeSegments);
      this.lastSpawnTime = 0;
    }
  }

  private shouldSpawnFood(): boolean {
    return (
      this.lastSpawnTime >= this.spawnInterval &&
      this.foods.length < this.maxFoodCount
    );
  }

  private spawnNewFood(snakeSegments: Vector2D[]): void {
    const newFood = Food.createRandom();

    // Include existing food positions to avoid overlap
    const existingPositions = [
      ...snakeSegments,
      ...this.foods.map(food => food.position)
    ];

    newFood.spawn(this.bounds, existingPositions);
    this.foods.push(newFood);
  }

  public checkCollisions(point: Vector2D, radius: number): Food | null {
    for (const food of this.foods) {
      if (food.checkCollision(point, radius)) {
        food.consume();
        return food;
      }
    }
    return null;
  }

  public getFoods(): readonly Food[] {
    return this.foods;
  }

  public reset(): void {
    this.foods = [];
    this.lastSpawnTime = 0;
  }

  public setBounds(bounds: Rectangle): void {
    this.bounds = bounds;
  }

  public forceSpawn(snakeSegments: Vector2D[]): void {
    if (this.foods.length < this.maxFoodCount) {
      this.spawnNewFood(snakeSegments);
    }
  }
}