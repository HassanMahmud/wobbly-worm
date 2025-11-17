import { Vector2D } from '@/utils/Vector2D.js';
import { Snake } from '@/game/Snake.js';
import { Food } from '@/game/Food.js';
import { GAME_CONFIG, COLORS, DEBUG } from '@/utils/Constants.js';
import { GameState } from '@/types/GameTypes.js';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  // Particle system for effects
  private particles: Particle[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D rendering context');
    }
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Set canvas size
    this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Configure context for smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  public render(
    snake: Snake,
    foods: readonly Food[],
    gameState: GameState,
    score: number,
    deltaTime: number,
    colorFlash: number = 0
  ): void {
    this.clear();
    this.updateParticles(deltaTime);

    switch (gameState) {
      case GameState.MENU:
        this.renderMenu();
        break;
      case GameState.PLAYING:
      case GameState.PAUSED:
        this.renderGame(snake, foods, gameState === GameState.PAUSED, colorFlash);
        break;
      case GameState.GAME_OVER:
        this.renderGame(snake, foods, false, colorFlash);
        this.renderGameOver(score);
        break;
    }

    this.renderParticles();

    if (DEBUG.SHOW_COLLISION_CIRCLES) {
      this.renderDebugInfo(snake, foods);
    }
  }

  private clear(): void {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Optional: Add subtle background pattern
    this.renderBackground();
  }

  private renderBackground(): void {
    const gridSize = 40;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;

    // Draw subtle grid
    for (let x = 0; x <= this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private renderGame(snake: Snake, foods: readonly Food[], isPaused: boolean, colorFlash: number = 0): void {
    // Render foods first (behind snake)
    foods.forEach(food => this.renderFood(food));

    // Render snake with potential color flash
    this.renderSnake(snake, colorFlash);

    // Render pause overlay
    if (isPaused) {
      this.renderPauseOverlay();
    }
  }

  private renderSnake(snake: Snake, colorFlash: number = 0): void {
    if (snake.segments.length === 0) return;

    const segments = snake.segments;

    // Render body segments (from tail to head)
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      const progress = i / (segments.length - 1);

      // Calculate colors with gradient from tail to head
      let color = this.interpolateSnakeColor(progress);

      // Apply flash effect when eating food
      if (colorFlash > 0) {
        const flashIntensity = colorFlash / 500; // 500ms flash duration
        const flashColor = progress > 0.7 ? '#ffff00' : '#ffaa00'; // Yellow for head, orange for body
        color = this.blendColors(color, flashColor, flashIntensity * 0.6);
      }

      const radius = snake.radius * (0.8 + 0.2 * progress); // Slightly smaller towards tail

      this.renderCircleWithGradient(segment, radius, color, this.lightenColor(color, 0.3));

      // Add segment index for debugging
      if (DEBUG.SHOW_SEGMENT_INDICES) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(i.toString(), segment.x, segment.y + 3);
      }
    }

    // Render eyes on the head
    this.renderSnakeEyes(snake);

    // Debug: Show velocity vector
    if (DEBUG.SHOW_VELOCITY_VECTORS) {
      const head = snake.getHead();
      const velocity = snake.direction.multiply(20);
      this.renderArrow(head, head.add(velocity), 'yellow', 2);
    }
  }

  private interpolateSnakeColor(progress: number): string {
    // Interpolate between tail and head colors
    const tailColor = this.hexToRgb(COLORS.SNAKE_TAIL);
    const headColor = this.hexToRgb(COLORS.SNAKE_HEAD);

    const r = Math.round(tailColor.r + (headColor.r - tailColor.r) * progress);
    const g = Math.round(tailColor.g + (headColor.g - tailColor.g) * progress);
    const b = Math.round(tailColor.b + (headColor.b - tailColor.b) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private renderSnakeEyes(snake: Snake): void {
    if (snake.segments.length === 0) return;

    const head = snake.getHead();
    const direction = snake.direction;
    const eyeDistance = snake.radius * 0.4;
    const eyeRadius = snake.radius * 0.15;

    // Calculate eye positions
    const perpendicular = new Vector2D(-direction.y, direction.x);
    const eye1Pos = head.add(direction.multiply(eyeDistance * 0.5)).add(perpendicular.multiply(eyeDistance));
    const eye2Pos = head.add(direction.multiply(eyeDistance * 0.5)).subtract(perpendicular.multiply(eyeDistance));

    // Render eyes
    this.ctx.fillStyle = 'white';
    this.renderCircle(eye1Pos, eyeRadius);
    this.renderCircle(eye2Pos, eyeRadius);

    // Render pupils
    this.ctx.fillStyle = 'black';
    this.renderCircle(eye1Pos, eyeRadius * 0.6);
    this.renderCircle(eye2Pos, eyeRadius * 0.6);
  }

  private renderFood(food: Food): void {
    if (!food.isActive) return;

    const radius = food.getEffectiveRadius();
    const primaryColor = food.getColor();
    const secondaryColor = food.getSecondaryColor();

    // Render food with pulsing effect
    this.renderCircleWithGradient(food.position, radius, primaryColor, secondaryColor);

    // Add special effects based on food type
    switch (food.type) {
      case 'bonus':
        this.renderStarEffect(food.position, radius * 1.2, food.rotationAngle);
        break;
      case 'speed':
        this.renderLightningEffect(food.position, radius, food.rotationAngle);
        break;
    }

    // Debug: Show collision circle
    if (DEBUG.SHOW_COLLISION_CIRCLES) {
      this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(food.position.x, food.position.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private renderStarEffect(position: Vector2D, radius: number, rotation: number): void {
    const points = 5;
    const outerRadius = radius * 0.8;
    const innerRadius = radius * 0.4;

    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(rotation);
    this.ctx.fillStyle = 'rgba(255, 217, 61, 0.6)';

    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  private renderLightningEffect(position: Vector2D, radius: number, rotation: number): void {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(rotation);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;

    // Draw lightning bolt shape
    this.ctx.beginPath();
    this.ctx.moveTo(-radius * 0.3, -radius * 0.6);
    this.ctx.lineTo(radius * 0.1, -radius * 0.2);
    this.ctx.lineTo(-radius * 0.1, -radius * 0.1);
    this.ctx.lineTo(radius * 0.3, radius * 0.6);
    this.ctx.lineTo(-radius * 0.1, radius * 0.2);
    this.ctx.lineTo(radius * 0.1, radius * 0.1);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderCircle(position: Vector2D, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderCircleWithGradient(position: Vector2D, radius: number, centerColor: string, edgeColor: string): void {
    const gradient = this.ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, radius
    );
    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(1, edgeColor);

    this.ctx.fillStyle = gradient;
    this.renderCircle(position, radius);
  }

  private renderArrow(start: Vector2D, end: Vector2D, color: string, width: number): void {
    const direction = end.subtract(start).normalize();
    const arrowLength = 8;
    const arrowWidth = 4;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Draw arrowhead
    const perpendicular = new Vector2D(-direction.y, direction.x);
    const arrowTip1 = end.subtract(direction.multiply(arrowLength)).add(perpendicular.multiply(arrowWidth));
    const arrowTip2 = end.subtract(direction.multiply(arrowLength)).subtract(perpendicular.multiply(arrowWidth));

    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(arrowTip1.x, arrowTip1.y);
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(arrowTip2.x, arrowTip2.y);
    this.ctx.stroke();
  }

  private renderMenu(): void {
    // Title
    this.ctx.fillStyle = COLORS.UI_TEXT;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NO-GRID SNAKE', this.width / 2, this.height / 2 - 60);

    // Subtitle
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Smooth Movement • No Boundaries', this.width / 2, this.height / 2 - 20);

    // Instructions
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillText('Press any arrow key or WASD to start', this.width / 2, this.height / 2 + 40);
  }

  private renderPauseOverlay(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Pause text
    this.ctx.fillStyle = COLORS.UI_TEXT;
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

    this.ctx.font = '18px Arial';
    this.ctx.fillText('Press SPACE to resume', this.width / 2, this.height / 2 + 40);
  }

  private renderGameOver(score: number): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Game Over text
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 40);

    // Score
    this.ctx.fillStyle = COLORS.UI_TEXT;
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${score}`, this.width / 2, this.height / 2 + 20);

    // Restart instruction
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillText('Press R to restart', this.width / 2, this.height / 2 + 60);
  }

  private updateParticles(deltaTime: number): void {
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.isAlive();
    });
  }

  private renderParticles(): void {
    this.particles.forEach(particle => particle.render(this.ctx));
  }

  public addFoodParticles(position: Vector2D, color: string): void {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Vector2D.fromAngle(angle, 50 + Math.random() * 50);
      this.particles.push(new Particle(position.clone(), velocity, color, 500));
    }
  }

  private renderDebugInfo(snake: Snake, _foods: readonly Food[]): void {
    // Show collision circles for snake segments
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    this.ctx.lineWidth = 1;
    snake.segments.forEach(segment => {
      this.ctx.beginPath();
      this.ctx.arc(segment.x, segment.y, snake.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });
  }

  // Utility methods
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private lightenColor(color: string, amount: number): string {
    const rgb = this.hexToRgb(color);
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private blendColors(color1: string, color2: string, ratio: number): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.setupCanvas();
  }
}

// Particle class for visual effects
class Particle {
  private position: Vector2D;
  private velocity: Vector2D;
  private color: string;
  private life: number;
  private maxLife: number;
  private size: number;

  constructor(position: Vector2D, velocity: Vector2D, color: string, life: number) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = 2 + Math.random() * 3;
  }

  public update(deltaTime: number): void {
    this.life -= deltaTime;
    this.position = this.position.add(this.velocity.multiply(deltaTime / 1000));
    this.velocity = this.velocity.multiply(0.98); // Friction
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  public isAlive(): boolean {
    return this.life > 0;
  }
}