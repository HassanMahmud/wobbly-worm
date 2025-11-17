export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Create a new vector with the same values
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  // Add another vector to this one and return a new vector
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  // Subtract another vector from this one and return a new vector
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  // Multiply this vector by a scalar and return a new vector
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  // Divide this vector by a scalar and return a new vector
  divide(scalar: number): Vector2D {
    if (scalar === 0) throw new Error('Cannot divide by zero');
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  // Calculate the magnitude (length) of this vector
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Calculate the squared magnitude (more efficient when you don't need the exact length)
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  // Return a normalized version of this vector (unit vector)
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return this.divide(mag);
  }

  // Calculate the distance to another vector
  distance(other: Vector2D): number {
    return this.subtract(other).magnitude();
  }

  // Calculate the squared distance to another vector (more efficient)
  distanceSquared(other: Vector2D): number {
    return this.subtract(other).magnitudeSquared();
  }

  // Calculate the dot product with another vector
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  // Calculate the angle of this vector in radians
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  // Rotate this vector by an angle in radians
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  // Linear interpolation between this vector and another
  lerp(other: Vector2D, t: number): Vector2D {
    return this.add(other.subtract(this).multiply(t));
  }

  // Set the values of this vector
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  // Check if this vector equals another vector (with optional tolerance)
  equals(other: Vector2D, tolerance: number = 0.0001): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance
    );
  }

  // Convert to string representation
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // Static methods for common vectors
  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static one(): Vector2D {
    return new Vector2D(1, 1);
  }

  static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  static right(): Vector2D {
    return new Vector2D(1, 0);
  }

  // Create a vector from an angle and magnitude
  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  // Create a random unit vector
  static random(): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    return Vector2D.fromAngle(angle);
  }
}