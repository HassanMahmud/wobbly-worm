import { Vector2D } from './Vector2D.js';

export class MathUtils {
  // Clamp a value between min and max
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // Linear interpolation between two values
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  // Map a value from one range to another
  static map(
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
  ): number {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  }

  // Generate a random number between min and max
  static random(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
  }

  // Generate a random integer between min and max (inclusive)
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Check if a point is inside a circle
  static pointInCircle(
    point: Vector2D,
    center: Vector2D,
    radius: number
  ): boolean {
    return point.distanceSquared(center) <= radius * radius;
  }

  // Check if two circles intersect
  static circlesIntersect(
    center1: Vector2D,
    radius1: number,
    center2: Vector2D,
    radius2: number
  ): boolean {
    const distance = center1.distance(center2);
    return distance <= radius1 + radius2;
  }

  // Check if a point is inside a rectangle
  static pointInRectangle(
    point: Vector2D,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    return (
      point.x >= rectX &&
      point.x <= rectX + rectWidth &&
      point.y >= rectY &&
      point.y <= rectY + rectHeight
    );
  }

  // Wrap a value around a range (useful for boundary wrapping)
  static wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range <= 0) return min;

    let wrapped = ((value - min) % range) + min;
    if (wrapped < min) wrapped += range;

    return wrapped;
  }

  // Calculate the angle between two vectors
  static angleBetween(v1: Vector2D, v2: Vector2D): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }

  // Calculate the shortest angular distance between two angles
  static angleDistance(angle1: number, angle2: number): number {
    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
  }

  // Smooth step function for smooth transitions
  static smoothStep(t: number): number {
    t = this.clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Convert degrees to radians
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Check if a number is approximately equal to another (with tolerance)
  static approximately(a: number, b: number, tolerance: number = 0.0001): boolean {
    return Math.abs(a - b) < tolerance;
  }

  // Get the sign of a number (-1, 0, or 1)
  static sign(value: number): number {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }

  // Calculate distance from a point to a line segment
  static pointToLineDistance(
    point: Vector2D,
    lineStart: Vector2D,
    lineEnd: Vector2D
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      // Line segment is actually a point
      return point.distance(lineStart);
    }

    let param = dot / lenSq;
    param = this.clamp(param, 0, 1);

    const closestPoint = new Vector2D(
      lineStart.x + param * C,
      lineStart.y + param * D
    );

    return point.distance(closestPoint);
  }
}