import { Vector2D } from '@/utils/Vector2D.js';
import { MathUtils } from '@/utils/MathUtils.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { Rectangle } from '@/types/GameTypes.js';
import { PHYSICS_CONSTANTS } from '@/utils/Constants.js';

export interface CollisionResult {
  occurred: boolean;
  point?: Vector2D;
  normal?: Vector2D;
  distance?: number;
}

export class CollisionDetector {
  private tolerance: number = PHYSICS_CONSTANTS.COLLISION_TOLERANCE;

  // Check collision between two circles
  public circleToCircle(
    center1: Vector2D,
    radius1: number,
    center2: Vector2D,
    radius2: number
  ): CollisionResult {
    const distance = center1.distance(center2);
    const totalRadius = radius1 + radius2;

    if (distance <= totalRadius + this.tolerance) {
      const normal = center2.subtract(center1).normalize();
      return {
        occurred: true,
        point: center1.add(normal.multiply(radius1)),
        normal: normal,
        distance: distance
      };
    }

    return { occurred: false };
  }

  // Check if a point is inside a circle
  public pointInCircle(
    point: Vector2D,
    center: Vector2D,
    radius: number
  ): CollisionResult {
    const distance = point.distance(center);

    if (distance <= radius + this.tolerance) {
      const normal = point.subtract(center).normalize();
      return {
        occurred: true,
        point: point.clone(),
        normal: normal,
        distance: distance
      };
    }

    return { occurred: false };
  }

  // Check collision between a circle and a rectangle
  public circleToRectangle(
    center: Vector2D,
    radius: number,
    rect: Rectangle
  ): CollisionResult {
    // Find the closest point on the rectangle to the circle center
    const closestX = MathUtils.clamp(center.x, rect.x, rect.x + rect.width);
    const closestY = MathUtils.clamp(center.y, rect.y, rect.y + rect.height);
    const closest = new Vector2D(closestX, closestY);

    const distance = center.distance(closest);

    if (distance <= radius + this.tolerance) {
      const normal = closest.subtract(center).normalize();
      return {
        occurred: true,
        point: closest.clone(),
        normal: normal,
        distance: distance
      };
    }

    return { occurred: false };
  }

  // Check collision between a point and a line segment
  public pointToLineSegment(
    point: Vector2D,
    lineStart: Vector2D,
    lineEnd: Vector2D,
    threshold: number = 1.0
  ): CollisionResult {
    const distance = MathUtils.pointToLineDistance(point, lineStart, lineEnd);

    if (distance <= threshold + this.tolerance) {
      // Calculate the closest point on the line segment
      const A = point.x - lineStart.x;
      const B = point.y - lineStart.y;
      const C = lineEnd.x - lineStart.x;
      const D = lineEnd.y - lineStart.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;

      let param = 0;
      if (lenSq !== 0) {
        param = MathUtils.clamp(dot / lenSq, 0, 1);
      }

      const closest = new Vector2D(
        lineStart.x + param * C,
        lineStart.y + param * D
      );

      const normal = point.subtract(closest).normalize();

      return {
        occurred: true,
        point: closest.clone(),
        normal: normal,
        distance: distance
      };
    }

    return { occurred: false };
  }

  // Check if snake head collides with any food
  public snakeToFood(snake: Snake, food: Food): CollisionResult {
    if (!food.isActive) {
      return { occurred: false };
    }

    const head = snake.getHead();
    return this.circleToCircle(
      head,
      snake.radius,
      food.position,
      food.getEffectiveRadius()
    );
  }

  // Check snake self-collision (optimized)
  public snakeSelfCollision(snake: Snake): CollisionResult {
    if (snake.segments.length < 4) {
      return { occurred: false };
    }

    const head = snake.getHead();
    const radius = snake.radius;

    // Skip the first few segments to avoid immediate collision
    for (let i = 3; i < snake.segments.length; i++) {
      const segment = snake.segments[i];
      const collision = this.circleToCircle(head, radius, segment, radius);

      if (collision.occurred) {
        return collision;
      }
    }

    return { occurred: false };
  }

  // Check snake collision with boundaries
  public snakeToBoundary(
    snake: Snake,
    bounds: Rectangle
  ): CollisionResult {
    const head = snake.getHead();
    const radius = snake.radius;

    // Check each boundary
    const boundaries = [
      // Top
      { start: new Vector2D(bounds.x, bounds.y), end: new Vector2D(bounds.x + bounds.width, bounds.y) },
      // Right
      { start: new Vector2D(bounds.x + bounds.width, bounds.y), end: new Vector2D(bounds.x + bounds.width, bounds.y + bounds.height) },
      // Bottom
      { start: new Vector2D(bounds.x + bounds.width, bounds.y + bounds.height), end: new Vector2D(bounds.x, bounds.y + bounds.height) },
      // Left
      { start: new Vector2D(bounds.x, bounds.y), end: new Vector2D(bounds.x, bounds.y + bounds.height) }
    ];

    for (const boundary of boundaries) {
      const collision = this.pointToLineSegment(head, boundary.start, boundary.end, radius);
      if (collision.occurred) {
        return collision;
      }
    }

    // Also check if head is completely outside bounds
    if (
      head.x - radius < bounds.x ||
      head.x + radius > bounds.x + bounds.width ||
      head.y - radius < bounds.y ||
      head.y + radius > bounds.y + bounds.height
    ) {
      // Calculate the direction to the nearest boundary
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const normal = new Vector2D(centerX, centerY).subtract(head).normalize();

      return {
        occurred: true,
        point: head.clone(),
        normal: normal,
        distance: 0
      };
    }

    return { occurred: false };
  }

  // Advanced collision detection for moving objects
  public movingCircleToCircle(
    center1: Vector2D,
    velocity1: Vector2D,
    radius1: number,
    center2: Vector2D,
    velocity2: Vector2D,
    radius2: number,
    deltaTime: number
  ): CollisionResult {
    // Calculate relative velocity
    const relativeVelocity = velocity1.subtract(velocity2);
    const relativePosition = center1.subtract(center2);

    // If objects are not moving relative to each other, use static collision
    if (relativeVelocity.magnitude() < 0.001) {
      return this.circleToCircle(center1, radius1, center2, radius2);
    }

    const totalRadius = radius1 + radius2;

    // Solve quadratic equation for collision time
    const a = relativeVelocity.magnitudeSquared();
    const b = 2 * relativePosition.dot(relativeVelocity);
    const c = relativePosition.magnitudeSquared() - totalRadius * totalRadius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return { occurred: false }; // No collision
    }

    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

    // We want the earliest positive collision time within this frame
    let collisionTime = -1;

    if (t1 >= 0 && t1 <= deltaTime / 1000) {
      collisionTime = t1;
    } else if (t2 >= 0 && t2 <= deltaTime / 1000) {
      collisionTime = t2;
    }

    if (collisionTime >= 0) {
      // Calculate collision point
      const collisionCenter1 = center1.add(velocity1.multiply(collisionTime));
      const collisionCenter2 = center2.add(velocity2.multiply(collisionTime));
      const normal = collisionCenter2.subtract(collisionCenter1).normalize();
      const collisionPoint = collisionCenter1.add(normal.multiply(radius1));

      return {
        occurred: true,
        point: collisionPoint,
        normal: normal,
        distance: 0
      };
    }

    return { occurred: false };
  }

  // Spatial partitioning for optimization (simple grid-based)
  public createSpatialGrid(bounds: Rectangle, cellSize: number): SpatialGrid {
    return new SpatialGrid(bounds, cellSize);
  }

  // Set collision tolerance
  public setTolerance(tolerance: number): void {
    this.tolerance = tolerance;
  }

  public getTolerance(): number {
    return this.tolerance;
  }
}

// Simple spatial partitioning system for optimization
export class SpatialGrid {
  private grid: Map<string, Vector2D[]> = new Map();
  private cellSize: number;
  private bounds: Rectangle;

  constructor(bounds: Rectangle, cellSize: number) {
    this.bounds = bounds;
    this.cellSize = cellSize;
  }

  private getGridKey(position: Vector2D): string {
    const gridX = Math.floor((position.x - this.bounds.x) / this.cellSize);
    const gridY = Math.floor((position.y - this.bounds.y) / this.cellSize);
    return `${gridX},${gridY}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(position: Vector2D): void {
    const key = this.getGridKey(position);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(position);
  }

  public getNearbyPoints(position: Vector2D, radius: number): Vector2D[] {
    const nearby: Vector2D[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);

    const centerKey = this.getGridKey(position);
    const [centerX, centerY] = centerKey.split(',').map(Number);

    // Check surrounding cells
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerX + dx},${centerY + dy}`;
        const points = this.grid.get(key);
        if (points) {
          nearby.push(...points);
        }
      }
    }

    return nearby;
  }
}