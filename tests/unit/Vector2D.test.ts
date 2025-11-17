import { Vector2D } from '../../src/utils/Vector2D';

describe('Vector2D', () => {
  describe('constructor', () => {
    it('should create a vector with default values', () => {
      const v = new Vector2D();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should create a vector with specified values', () => {
      const v = new Vector2D(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('basic operations', () => {
    it('should add vectors correctly', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(3, 4);
      const result = v1.add(v2);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
      // Original vectors should be unchanged
      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);
    });

    it('should subtract vectors correctly', () => {
      const v1 = new Vector2D(5, 7);
      const v2 = new Vector2D(2, 3);
      const result = v1.subtract(v2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it('should multiply by scalar correctly', () => {
      const v = new Vector2D(3, 4);
      const result = v.multiply(2);

      expect(result.x).toBe(6);
      expect(result.y).toBe(8);
    });

    it('should divide by scalar correctly', () => {
      const v = new Vector2D(6, 8);
      const result = v.divide(2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it('should throw error when dividing by zero', () => {
      const v = new Vector2D(3, 4);
      expect(() => v.divide(0)).toThrow('Cannot divide by zero');
    });
  });

  describe('magnitude calculations', () => {
    it('should calculate magnitude correctly', () => {
      const v = new Vector2D(3, 4);
      expect(v.magnitude()).toBe(5);
    });

    it('should calculate magnitude squared correctly', () => {
      const v = new Vector2D(3, 4);
      expect(v.magnitudeSquared()).toBe(25);
    });

    it('should handle zero vector magnitude', () => {
      const v = new Vector2D(0, 0);
      expect(v.magnitude()).toBe(0);
      expect(v.magnitudeSquared()).toBe(0);
    });
  });

  describe('normalization', () => {
    it('should normalize vector correctly', () => {
      const v = new Vector2D(3, 4);
      const normalized = v.normalize();

      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
      expect(normalized.magnitude()).toBeCloseTo(1);
    });

    it('should handle zero vector normalization', () => {
      const v = new Vector2D(0, 0);
      const normalized = v.normalize();

      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });
  });

  describe('distance calculations', () => {
    it('should calculate distance correctly', () => {
      const v1 = new Vector2D(0, 0);
      const v2 = new Vector2D(3, 4);

      expect(v1.distance(v2)).toBe(5);
      expect(v2.distance(v1)).toBe(5);
    });

    it('should calculate distance squared correctly', () => {
      const v1 = new Vector2D(0, 0);
      const v2 = new Vector2D(3, 4);

      expect(v1.distanceSquared(v2)).toBe(25);
    });
  });

  describe('dot product', () => {
    it('should calculate dot product correctly', () => {
      const v1 = new Vector2D(2, 3);
      const v2 = new Vector2D(4, 5);

      expect(v1.dot(v2)).toBe(23); // 2*4 + 3*5 = 8 + 15 = 23
    });

    it('should return zero for perpendicular vectors', () => {
      const v1 = new Vector2D(1, 0);
      const v2 = new Vector2D(0, 1);

      expect(v1.dot(v2)).toBe(0);
    });
  });

  describe('angle operations', () => {
    it('should calculate angle correctly', () => {
      const v = new Vector2D(1, 0);
      expect(v.angle()).toBe(0);

      const v2 = new Vector2D(0, 1);
      expect(v2.angle()).toBeCloseTo(Math.PI / 2);
    });

    it('should rotate vector correctly', () => {
      const v = new Vector2D(1, 0);
      const rotated = v.rotate(Math.PI / 2);

      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(1);
    });
  });

  describe('static methods', () => {
    it('should create common vectors correctly', () => {
      expect(Vector2D.zero()).toEqual(new Vector2D(0, 0));
      expect(Vector2D.one()).toEqual(new Vector2D(1, 1));
      expect(Vector2D.up()).toEqual(new Vector2D(0, -1));
      expect(Vector2D.down()).toEqual(new Vector2D(0, 1));
      expect(Vector2D.left()).toEqual(new Vector2D(-1, 0));
      expect(Vector2D.right()).toEqual(new Vector2D(1, 0));
    });

    it('should create vector from angle correctly', () => {
      const v = Vector2D.fromAngle(0, 5);
      expect(v.x).toBeCloseTo(5);
      expect(v.y).toBeCloseTo(0);

      const v2 = Vector2D.fromAngle(Math.PI / 2, 3);
      expect(v2.x).toBeCloseTo(0);
      expect(v2.y).toBeCloseTo(3);
    });

    it('should create random unit vector', () => {
      const v = Vector2D.random();
      expect(v.magnitude()).toBeCloseTo(1);
    });
  });

  describe('utility methods', () => {
    it('should clone vector correctly', () => {
      const v = new Vector2D(3, 4);
      const clone = v.clone();

      expect(clone).toEqual(v);
      expect(clone).not.toBe(v); // Different objects
    });

    it('should check equality correctly', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(1, 2);
      const v3 = new Vector2D(1.0001, 2);

      expect(v1.equals(v2)).toBe(true);
      expect(v1.equals(v3)).toBe(false);
      expect(v1.equals(v3, 0.001)).toBe(true);
    });

    it('should interpolate correctly', () => {
      const v1 = new Vector2D(0, 0);
      const v2 = new Vector2D(10, 10);

      const mid = v1.lerp(v2, 0.5);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(5);

      const quarter = v1.lerp(v2, 0.25);
      expect(quarter.x).toBe(2.5);
      expect(quarter.y).toBe(2.5);
    });

    it('should convert to string correctly', () => {
      const v = new Vector2D(3.14159, 2.71828);
      const str = v.toString();
      expect(str).toBe('Vector2D(3.14, 2.72)');
    });
  });
});