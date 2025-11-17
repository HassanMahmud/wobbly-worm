import { Vector2D } from '@/utils/Vector2D.js';
import { GameState, Rectangle, FoodType } from '@/types/GameTypes.js';
import { GAME_CONFIG, PHYSICS_CONSTANTS } from '@/utils/Constants.js';
import { Snake } from './Snake.js';
import { FoodManager } from './Food.js';
import { InputHandler } from './InputHandler.js';
import { CollisionDetector } from './CollisionDetector.js';
import { Renderer } from '@/graphics/Renderer.js';
import { ApiService } from '@/services/ApiService.js';
import { UserSessionManager } from '@/services/UserSessionManager.js';

export class Game {
  // Core game components
  private canvas: HTMLCanvasElement;
  private snake!: Snake;
  private foodManager!: FoodManager;
  private inputHandler!: InputHandler;
  private collisionDetector!: CollisionDetector;
  private renderer!: Renderer;

  // API and session management
  private apiService: ApiService;
  private sessionManager: UserSessionManager;

  // Game state
  private gameState: GameState = GameState.PLAYING; // Start in playing state since login is handled separately
  private score: number = 0;
  private foodCount: number = 0;
  private gameStartTime: number = 0;
  private isRunning: boolean = false;

  // Visual feedback
  private snakeColorFlash: number = 0;

  // Timing
  private lastFrameTime: number = 0;
  private animationFrameId: number = 0;

  // Game bounds
  private gameBounds: Rectangle;

  // UI elements
  private scoreElement: HTMLElement | null = null;
  private lengthElement: HTMLElement | null = null;
  private speedElement: HTMLElement | null = null;
  private gameStateElement: HTMLElement | null = null;

  constructor(canvas: HTMLCanvasElement, apiService: ApiService, sessionManager: UserSessionManager) {
    this.canvas = canvas;
    this.apiService = apiService;
    this.sessionManager = sessionManager;

    // Initialize game bounds
    this.gameBounds = {
      x: 0,
      y: 0,
      width: GAME_CONFIG.CANVAS.WIDTH,
      height: GAME_CONFIG.CANVAS.HEIGHT
    };

    // Initialize core components
    this.initializeComponents();
    this.initializeUI();

    // Set up event listeners
    this.setupEventListeners();
  }

  private initializeComponents(): void {
    // Create snake at center of screen
    const startPosition = new Vector2D(
      this.gameBounds.width / 2,
      this.gameBounds.height / 2
    );

    this.snake = new Snake(startPosition);
    this.foodManager = new FoodManager(this.gameBounds);
    this.inputHandler = new InputHandler();
    this.collisionDetector = new CollisionDetector();
    this.renderer = new Renderer(this.canvas);
  }

  private initializeUI(): void {
    this.scoreElement = document.getElementById('score');
    this.lengthElement = document.getElementById('length');
    this.speedElement = document.getElementById('speed');
    this.gameStateElement = document.getElementById('gameState');
  }

  private setupEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  public init(): void {
    this.gameState = GameState.PLAYING;
    this.resetGame(); // Initialize the game state
    this.updateUI();
    this.start();
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastFrameTime, PHYSICS_CONSTANTS.MAX_DELTA_TIME);
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render(deltaTime);

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // Update visual feedback timer
    if (this.snakeColorFlash > 0) {
      this.snakeColorFlash = Math.max(0, this.snakeColorFlash - deltaTime);
    }

    // Handle state-specific updates
    switch (this.gameState) {
      case GameState.MENU:
        this.updateMenu();
        break;
      case GameState.PLAYING:
        this.updatePlaying(deltaTime);
        break;
      case GameState.PAUSED:
        this.updatePaused();
        break;
      case GameState.GAME_OVER:
        this.updateGameOver();
        break;
    }

    this.updateUI();

    // Update input handler at the end of the frame for next frame's "just pressed" detection
    this.inputHandler.update();
  }

  private updateMenu(): void {
    // Check for any input to start the game
    const direction = this.inputHandler.getDirectionVector();
    if (direction.magnitude() > 0) {
      this.startNewGame();
    }
  }

  private updatePlaying(deltaTime: number): void {
    // Handle input
    this.handleGameInput();

    // Update snake
    this.snake.update(deltaTime);

    // Update food manager
    this.foodManager.update(deltaTime, this.snake.segments);

    // Check collisions
    this.checkCollisions();

    // Check boundary collision (game over when hitting edges)
    if (this.snake.checkBoundaryCollision(this.gameBounds.width, this.gameBounds.height)) {
      this.gameOver();
      return;
    }

    // Update score based on snake length
    this.score = this.snake.getScore();
  }

  private updatePaused(): void {
    // Check for unpause input
    if (this.inputHandler.wasSpaceJustPressed()) {
      this.gameState = GameState.PLAYING;
    }

    // Check for reset
    if (this.inputHandler.wasResetJustPressed()) {
      this.resetGame();
    }
  }

  private updateGameOver(): void {
    // Check for reset input
    if (this.inputHandler.wasResetJustPressed()) {
      this.resetGame();
    }
  }

  private handleGameInput(): void {
    // Handle pause
    if (this.inputHandler.wasSpaceJustPressed()) {
      this.gameState = GameState.PAUSED;
      return;
    }

    // Handle reset
    if (this.inputHandler.wasResetJustPressed()) {
      this.resetGame();
      return;
    }

    // Handle direction input
    const direction = this.inputHandler.getDirectionVector();
    if (direction.magnitude() > 0) {
      this.snake.turn(direction);
    }

    // Debug: Handle speed adjustment
    if (this.inputHandler.wasSpeedUpPressed()) {
      this.snake.increaseSpeed(20);
    }
    if (this.inputHandler.wasSpeedDownPressed()) {
      this.snake.increaseSpeed(-20);
    }
  }

  private checkCollisions(): void {
    // Check food collisions
    const head = this.snake.getHead();
    const eatenFood = this.foodManager.checkCollisions(head, this.snake.radius);

    if (eatenFood) {
      this.handleFoodConsumption(eatenFood);
    }

    // Check self collision using collision detector
    const selfCollision = this.collisionDetector.snakeSelfCollision(this.snake);
    if (selfCollision.occurred) {
      this.gameOver();
      return;
    }

    // Note: Boundary collision is handled by wrapping in this version
    // You could add boundary collision detection here using this.collisionDetector.snakeToBoundary()
  }

  private handleFoodConsumption(food: any): void {
    // Grow snake
    this.snake.grow();

    // Add to score and food count
    this.score += food.value;
    this.foodCount += 1;

    // Visual feedback - flash snake color
    this.snakeColorFlash = 500; // Flash for 500ms

    // Handle special food effects
    switch (food.type) {
      case FoodType.SPEED:
        this.snake.increaseSpeed(10);
        break;
      case FoodType.BONUS:
        // Bonus food already gives extra points through food.value
        break;
    }

    // Add particle effect
    this.renderer.addFoodParticles(food.position, food.getColor());
  }

  private startNewGame(): void {
    this.resetGame();
    this.gameState = GameState.PLAYING;
  }

  private resetGame(): void {
    // Reset snake
    const startPosition = new Vector2D(
      this.gameBounds.width / 2,
      this.gameBounds.height / 2
    );
    this.snake.reset(startPosition);

    // Reset food manager
    this.foodManager.reset();

    // Force spawn initial food
    this.foodManager.forceSpawn(this.snake.segments);

    // Reset game statistics
    this.score = 0;
    this.foodCount = 0;
    this.gameStartTime = Date.now();
    this.snakeColorFlash = 0;

    // Set state to playing
    this.gameState = GameState.PLAYING;
  }

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.submitScore();
  }

  private async submitScore(): Promise<void> {
    if (!this.sessionManager.isLoggedIn()) {
      return;
    }

    const userId = this.sessionManager.getUserId();
    if (!userId) {
      return;
    }

    const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

    try {
      await this.apiService.submitScore({
        userId,
        score: this.score,
        foodCount: this.foodCount,
        gameTime,
      });
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }

  private render(deltaTime: number): void {
    this.renderer.render(
      this.snake,
      this.foodManager.getFoods(),
      this.gameState,
      this.score,
      deltaTime,
      this.snakeColorFlash
    );
  }

  private updateUI(): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = this.score.toString();
    }

    if (this.lengthElement) {
      this.lengthElement.textContent = this.snake.getLength().toString();
    }

    if (this.speedElement) {
      this.speedElement.textContent = Math.round(this.snake.speed).toString();
    }

    if (this.gameStateElement) {
      this.gameStateElement.textContent = this.gameState.toUpperCase();
    }

    // Update food count display
    const foodElement = document.getElementById('foodCount');
    if (foodElement) {
      foodElement.textContent = this.foodCount.toString();
    }
  }

  private handleResize(): void {
    // Handle canvas resize if needed
    // For now, we maintain fixed canvas size
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden' && this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    }
  }

  // Public methods for external control
  public pause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    }
  }

  public resume(): void {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  public reset(): void {
    this.resetGame();
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getScore(): number {
    return this.score;
  }

  public getSnake(): Snake {
    return this.snake;
  }

  public getSnakeColorFlash(): number {
    return this.snakeColorFlash;
  }

  public getFoodCount(): number {
    return this.foodCount;
  }

  // Cleanup method
  public cleanup(): void {
    this.stop();
    this.inputHandler.cleanup();

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Debug methods
  public enableDebugMode(enable: boolean): void {
    // This could toggle debug rendering features
    console.log(`Debug mode ${enable ? 'enabled' : 'disabled'}`);
  }

  public logGameState(): void {
    console.log('Game State:', {
      state: this.gameState,
      score: this.score,
      snakeLength: this.snake.getLength(),
      snakeSpeed: this.snake.speed,
      snakePosition: this.snake.getHead().toString(),
      foodCount: this.foodManager.getFoods().length
    });
  }
}