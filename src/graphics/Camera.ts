import { Vector2D } from '@/utils/Vector2D.js';
import { MathUtils } from '@/utils/MathUtils.js';

export class Camera {
  private position: Vector2D = Vector2D.zero();
  private targetPosition: Vector2D = Vector2D.zero();
  private zoom: number = 1.0;
  private targetZoom: number = 1.0;

  // Camera smoothing parameters
  private followSpeed: number = 2.0;
  private zoomSpeed: number = 1.5;

  // Viewport dimensions
  private viewportWidth: number;
  private viewportHeight: number;

  // Bounds for camera movement (optional)
  private bounds: { min: Vector2D; max: Vector2D } | null = null;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public update(deltaTime: number): void {
    // Smooth camera following
    const followLerp = Math.min(1.0, (this.followSpeed * deltaTime) / 1000);
    this.position = this.position.lerp(this.targetPosition, followLerp);

    // Smooth zoom
    const zoomLerp = Math.min(1.0, (this.zoomSpeed * deltaTime) / 1000);
    this.zoom = MathUtils.lerp(this.zoom, this.targetZoom, zoomLerp);

    // Apply bounds if set
    this.applyBounds();
  }

  public followTarget(target: Vector2D): void {
    this.targetPosition = target.clone();
  }

  public setZoom(zoom: number): void {
    this.targetZoom = MathUtils.clamp(zoom, 0.1, 5.0);
  }

  public adjustZoom(delta: number): void {
    this.setZoom(this.targetZoom + delta);
  }

  public getPosition(): Vector2D {
    return this.position.clone();
  }

  public getZoom(): number {
    return this.zoom;
  }

  // Convert world coordinates to screen coordinates
  public worldToScreen(worldPos: Vector2D): Vector2D {
    const screenCenter = new Vector2D(this.viewportWidth / 2, this.viewportHeight / 2);
    const relative = worldPos.subtract(this.position);
    const scaled = relative.multiply(this.zoom);
    return screenCenter.add(scaled);
  }

  // Convert screen coordinates to world coordinates
  public screenToWorld(screenPos: Vector2D): Vector2D {
    const screenCenter = new Vector2D(this.viewportWidth / 2, this.viewportHeight / 2);
    const relative = screenPos.subtract(screenCenter);
    const scaled = relative.divide(this.zoom);
    return this.position.add(scaled);
  }

  // Get the world bounds that are currently visible
  public getVisibleBounds(): { min: Vector2D; max: Vector2D } {
    const halfWidth = (this.viewportWidth / 2) / this.zoom;
    const halfHeight = (this.viewportHeight / 2) / this.zoom;

    return {
      min: new Vector2D(this.position.x - halfWidth, this.position.y - halfHeight),
      max: new Vector2D(this.position.x + halfWidth, this.position.y + halfHeight)
    };
  }

  // Check if a point is visible on screen
  public isVisible(worldPos: Vector2D, margin: number = 0): boolean {
    const bounds = this.getVisibleBounds();
    return (
      worldPos.x >= bounds.min.x - margin &&
      worldPos.x <= bounds.max.x + margin &&
      worldPos.y >= bounds.min.y - margin &&
      worldPos.y <= bounds.max.y + margin
    );
  }

  // Set camera bounds (useful for keeping camera within game world)
  public setBounds(minPos: Vector2D, maxPos: Vector2D): void {
    this.bounds = { min: minPos.clone(), max: maxPos.clone() };
  }

  public clearBounds(): void {
    this.bounds = null;
  }

  private applyBounds(): void {
    if (!this.bounds) return;

    // Calculate the visible area at current zoom
    const halfWidth = (this.viewportWidth / 2) / this.zoom;
    const halfHeight = (this.viewportHeight / 2) / this.zoom;

    // Clamp position to keep camera within bounds
    this.position.x = MathUtils.clamp(
      this.position.x,
      this.bounds.min.x + halfWidth,
      this.bounds.max.x - halfWidth
    );

    this.position.y = MathUtils.clamp(
      this.position.y,
      this.bounds.min.y + halfHeight,
      this.bounds.max.y - halfHeight
    );

    // Also clamp target position
    this.targetPosition.x = MathUtils.clamp(
      this.targetPosition.x,
      this.bounds.min.x + halfWidth,
      this.bounds.max.x - halfWidth
    );

    this.targetPosition.y = MathUtils.clamp(
      this.targetPosition.y,
      this.bounds.min.y + halfHeight,
      this.bounds.max.y - halfHeight
    );
  }

  // Camera shake effect (useful for impact effects)
  public shake(intensity: number, _duration: number): void {
    // This could be implemented with a shake timer and random offsets
    // For now, we'll apply a simple random offset
    const shakeOffset = Vector2D.random().multiply(intensity);
    this.position = this.position.add(shakeOffset);
  }

  // Set camera smoothing parameters
  public setFollowSpeed(speed: number): void {
    this.followSpeed = Math.max(0.1, speed);
  }

  public setZoomSpeed(speed: number): void {
    this.zoomSpeed = Math.max(0.1, speed);
  }

  // Immediate camera positioning (no smoothing)
  public setPosition(position: Vector2D): void {
    this.position = position.clone();
    this.targetPosition = position.clone();
  }

  public setZoomImmediate(zoom: number): void {
    this.zoom = MathUtils.clamp(zoom, 0.1, 5.0);
    this.targetZoom = this.zoom;
  }

  // Get camera transformation matrix for more advanced rendering
  public getTransformMatrix(): DOMMatrix {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.viewportWidth / 2, this.viewportHeight / 2);
    matrix.scaleSelf(this.zoom, this.zoom);
    matrix.translateSelf(-this.position.x, -this.position.y);
    return matrix;
  }

  // Apply camera transformation to canvas context
  public applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x, -this.position.y);
  }

  public restoreTransform(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  // Resize viewport (call when canvas size changes)
  public resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  // Calculate optimal zoom to fit a rectangular area
  public zoomToFit(worldBounds: { min: Vector2D; max: Vector2D }, padding: number = 50): void {
    const worldWidth = worldBounds.max.x - worldBounds.min.x;
    const worldHeight = worldBounds.max.y - worldBounds.min.y;

    const scaleX = (this.viewportWidth - padding * 2) / worldWidth;
    const scaleY = (this.viewportHeight - padding * 2) / worldHeight;

    this.setZoom(Math.min(scaleX, scaleY));

    // Center on the bounds
    const center = new Vector2D(
      (worldBounds.min.x + worldBounds.max.x) / 2,
      (worldBounds.min.y + worldBounds.max.y) / 2
    );
    this.followTarget(center);
  }
}