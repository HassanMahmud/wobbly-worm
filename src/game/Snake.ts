import { Vector2D } from '@/utils/Vector2D.js';
import { MathUtils } from '@/utils/MathUtils.js';
import { GAME_CONFIG } from '@/utils/Constants.js';

export class Snake {
  public segments: Vector2D[] = [];
  public direction: Vector2D = Vector2D.right();
  public targetDirection: Vector2D = Vector2D.right();
  public speed: number = GAME_CONFIG.SNAKE.INITIAL_SPEED;
  public radius: number = GAME_CONFIG.SNAKE.SEGMENT_RADIUS;
  public isAlive: boolean = true;

  private segmentSpacing: number;
  private turningSpeed: number = 5; // How quickly the snake can change direction

  constructor(startPosition: Vector2D) {
    this.segmentSpacing = this.radius * 2;
    this.initializeSegments(startPosition);
  }

  private initializeSegments(startPosition: Vector2D): void {
    this.segments = [];

    // Create initial segments in a line
    for (let i = 0; i < GAME_CONFIG.SNAKE.INITIAL_LENGTH; i++) {
      const segmentPosition = startPosition.subtract(
        Vector2D.right().multiply(i * this.segmentSpacing)
      );
      this.segments.push(segmentPosition);
    }
  }

  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.updateDirection(deltaTime);
    this.moveSegments(deltaTime);
    this.checkSelfCollision();
  }

  private updateDirection(deltaTime: number): void {
    // Smoothly interpolate towards the target direction for realistic turning
    const angleDiff = MathUtils.angleDistance(
      this.direction.angle(),
      this.targetDirection.angle()
    );

    // Calculate how much we can turn this frame
    const maxTurnAngle = (this.turningSpeed * deltaTime) / 1000;
    const turnAngle = MathUtils.clamp(angleDiff, -maxTurnAngle, maxTurnAngle);

    // Apply the turn
    const newAngle = this.direction.angle() + turnAngle;
    this.direction = Vector2D.fromAngle(newAngle);
  }

  private moveSegments(deltaTime: number): void {
    const moveDistance = (this.speed * deltaTime) / 1000;
    const movement = this.direction.multiply(moveDistance);

    // Move the head
    this.segments[0] = this.segments[0].add(movement);

    // Follow the leader - each segment follows the one in front of it
    for (let i = 1; i < this.segments.length; i++) {
      const leader = this.segments[i - 1];
      const follower = this.segments[i];
      const toLeader = leader.subtract(follower);
      const distance = toLeader.magnitude();

      // Only move if the distance is greater than the desired spacing
      if (distance > this.segmentSpacing) {
        const moveDirection = toLeader.normalize();
        const moveAmount = distance - this.segmentSpacing;
        this.segments[i] = follower.add(moveDirection.multiply(moveAmount));
      }
    }
  }

  public turn(newDirection: Vector2D): void {
    // Prevent the snake from immediately reversing into itself
    const oppositeDirection = this.direction.multiply(-1);
    const dot = newDirection.normalize().dot(oppositeDirection.normalize());

    // If the new direction is not directly opposite (with some tolerance)
    if (dot < 0.8) {
      this.targetDirection = newDirection.normalize();
    }
  }

  public grow(): void {
    if (this.segments.length === 0) return;

    // Add new segments at the tail
    const tail = this.segments[this.segments.length - 1];

    for (let i = 0; i < GAME_CONFIG.SNAKE.GROWTH_RATE; i++) {
      // Place new segment slightly behind the current tail
      let newSegmentPos = tail.clone();

      if (this.segments.length > 1) {
        const secondToLast = this.segments[this.segments.length - 2];
        const tailDirection = tail.subtract(secondToLast).normalize();
        newSegmentPos = tail.subtract(tailDirection.multiply(this.segmentSpacing * (i + 1)));
      } else {
        // If only one segment, place behind in opposite direction
        const oppositeDirection = this.direction.multiply(-1);
        newSegmentPos = tail.add(oppositeDirection.multiply(this.segmentSpacing * (i + 1)));
      }

      this.segments.push(newSegmentPos);
    }
  }

  public getHead(): Vector2D {
    return this.segments[0]?.clone() || Vector2D.zero();
  }

  public getLength(): number {
    return this.segments.length;
  }

  public checkSelfCollision(): boolean {
    if (this.segments.length < 4) return false; // Can't collide with itself if too short

    const head = this.getHead();

    // Check collision with body segments (skip the first few to avoid immediate collision)
    for (let i = 3; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const distance = head.distance(segment);

      if (distance < this.radius * 2) {
        this.isAlive = false;
        return true;
      }
    }

    return false;
  }

  public checkBoundaryCollision(canvasWidth: number, canvasHeight: number): boolean {
    const head = this.getHead();

    // Check if head is outside canvas bounds
    if (
      head.x - this.radius < 0 ||
      head.x + this.radius > canvasWidth ||
      head.y - this.radius < 0 ||
      head.y + this.radius > canvasHeight
    ) {
      this.isAlive = false;
      return true;
    }

    return false;
  }

  public wrapAroundBounds(canvasWidth: number, canvasHeight: number): void {
    const head = this.getHead();
    let wrapped = false;

    // Wrap around horizontally
    if (head.x < -this.radius) {
      this.segments[0].x = canvasWidth + this.radius;
      wrapped = true;
    } else if (head.x > canvasWidth + this.radius) {
      this.segments[0].x = -this.radius;
      wrapped = true;
    }

    // Wrap around vertically
    if (head.y < -this.radius) {
      this.segments[0].y = canvasHeight + this.radius;
      wrapped = true;
    } else if (head.y > canvasHeight + this.radius) {
      this.segments[0].y = -this.radius;
      wrapped = true;
    }

    // If head wrapped, adjust body segments to follow smoothly
    if (wrapped) {
      this.adjustSegmentsAfterWrap();
    }
  }

  private adjustSegmentsAfterWrap(): void {
    // After wrapping, ensure body segments follow the head properly
    // This prevents the body from stretching across the screen
    for (let i = 1; i < this.segments.length; i++) {
      const leader = this.segments[i - 1];
      const follower = this.segments[i];
      const distance = leader.distance(follower);

      // If segments are too far apart (likely due to wrapping), bring them closer
      if (distance > this.segmentSpacing * 3) {
        const direction = leader.subtract(follower).normalize();
        this.segments[i] = leader.subtract(direction.multiply(this.segmentSpacing));
      }
    }
  }

  public reset(startPosition: Vector2D): void {
    this.isAlive = true;
    this.direction = Vector2D.right();
    this.targetDirection = Vector2D.right();
    this.speed = GAME_CONFIG.SNAKE.INITIAL_SPEED;
    this.initializeSegments(startPosition);
  }

  public increaseSpeed(amount: number): void {
    this.speed += amount;
  }

  public getScore(): number {
    // Simple scoring based on length beyond initial length
    return Math.max(0, this.segments.length - GAME_CONFIG.SNAKE.INITIAL_LENGTH) * 10;
  }
}