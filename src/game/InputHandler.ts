import { Vector2D } from '@/utils/Vector2D.js';
import { InputState } from '@/types/GameTypes.js';
import { KEYS } from '@/utils/Constants.js';

export class InputHandler {
  private inputState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    reset: false,
  };

  private keyStates: Map<string, boolean> = new Map();
  private previousKeyStates: Map<string, boolean> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Prevent default behavior for game keys
    document.addEventListener('keydown', (event) => {
      if (this.isGameKey(event.code)) {
        event.preventDefault();
      }
    });

    // Handle window focus/blur to reset input state
    window.addEventListener('blur', this.resetInputState.bind(this));
    window.addEventListener('focus', this.resetInputState.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.setKeyState(event.code, true);
    this.updateInputState();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.setKeyState(event.code, false);
    this.updateInputState();
  }

  private setKeyState(keyCode: string, pressed: boolean): void {
    this.keyStates.set(keyCode, pressed);
  }

  private updateInputState(): void {
    // Directional input (allow multiple directions for diagonal movement)
    this.inputState.up = this.isKeyPressed(KEYS.ARROW_UP) || this.isKeyPressed(KEYS.W);
    this.inputState.down = this.isKeyPressed(KEYS.ARROW_DOWN) || this.isKeyPressed(KEYS.S);
    this.inputState.left = this.isKeyPressed(KEYS.ARROW_LEFT) || this.isKeyPressed(KEYS.A);
    this.inputState.right = this.isKeyPressed(KEYS.ARROW_RIGHT) || this.isKeyPressed(KEYS.D);

    // Control keys
    this.inputState.space = this.isKeyPressed(KEYS.SPACE);
    this.inputState.reset = this.isKeyPressed(KEYS.R);
  }

  private isKeyPressed(keyCode: string): boolean {
    return this.keyStates.get(keyCode) || false;
  }

  private isGameKey(keyCode: string): boolean {
    const gameKeys = [
      KEYS.ARROW_UP, KEYS.ARROW_DOWN, KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT,
      KEYS.W, KEYS.A, KEYS.S, KEYS.D,
      KEYS.SPACE, KEYS.R, KEYS.PLUS, KEYS.MINUS
    ];
    return gameKeys.includes(keyCode);
  }

  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public getDirectionVector(): Vector2D {
    let direction = Vector2D.zero();

    if (this.inputState.up) direction = direction.add(Vector2D.up());
    if (this.inputState.down) direction = direction.add(Vector2D.down());
    if (this.inputState.left) direction = direction.add(Vector2D.left());
    if (this.inputState.right) direction = direction.add(Vector2D.right());

    // Normalize diagonal movement to maintain consistent speed
    if (direction.magnitude() > 0) {
      direction = direction.normalize();
    }

    return direction;
  }

  public isKeyJustPressed(keyCode: string): boolean {
    const currentState = this.keyStates.get(keyCode) || false;
    const previousState = this.previousKeyStates.get(keyCode) || false;
    const result = currentState && !previousState;

    // Debug logging for SPACE and R keys
    if (keyCode === KEYS.SPACE || keyCode === KEYS.R) {
      console.log(`Key check: ${keyCode}, current: ${currentState}, previous: ${previousState}, result: ${result}`);
    }

    return result;
  }

  public isKeyJustReleased(keyCode: string): boolean {
    const currentState = this.keyStates.get(keyCode) || false;
    const previousState = this.previousKeyStates.get(keyCode) || false;
    return !currentState && previousState;
  }

  public update(): void {
    // Update previous key states for just pressed/released detection
    // This should be called at the END of the frame, not the beginning
    this.previousKeyStates.clear();
    for (const [key, state] of this.keyStates) {
      this.previousKeyStates.set(key, state);
    }
  }

  public wasSpaceJustPressed(): boolean {
    const result = this.isKeyJustPressed(KEYS.SPACE);
    if (result) console.log('Space just pressed!'); // Debug logging
    return result;
  }

  public wasResetJustPressed(): boolean {
    const result = this.isKeyJustPressed(KEYS.R);
    if (result) console.log('Reset just pressed!'); // Debug logging
    return result;
  }

  public wasSpeedUpPressed(): boolean {
    return this.isKeyJustPressed(KEYS.PLUS);
  }

  public wasSpeedDownPressed(): boolean {
    return this.isKeyJustPressed(KEYS.MINUS);
  }

  private resetInputState(): void {
    this.keyStates.clear();
    this.previousKeyStates.clear();
    this.inputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      reset: false,
    };
  }

  public cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('blur', this.resetInputState.bind(this));
    window.removeEventListener('focus', this.resetInputState.bind(this));
  }

  // Debug methods
  public getActiveKeys(): string[] {
    const activeKeys: string[] = [];
    for (const [key, pressed] of this.keyStates) {
      if (pressed) {
        activeKeys.push(key);
      }
    }
    return activeKeys;
  }

  public logInputState(): void {
    console.log('Input State:', {
      direction: this.getDirectionVector().toString(),
      space: this.inputState.space,
      reset: this.inputState.reset,
      activeKeys: this.getActiveKeys()
    });
  }
}

// Alternative touch input handler for mobile support (future enhancement)
export class TouchInputHandler {
  private canvas: HTMLCanvasElement;
  private touchStartPos: Vector2D | null = null;
  private currentDirection: Vector2D = Vector2D.zero();
  private minSwipeDistance: number = 30;
  private isActive: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.touchStartPos = new Vector2D(
      touch.clientX - rect.left,
      touch.clientY - rect.top
    );
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.touchStartPos) return;

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const currentPos = new Vector2D(
      touch.clientX - rect.left,
      touch.clientY - rect.top
    );

    const swipeVector = currentPos.subtract(this.touchStartPos);
    const distance = swipeVector.magnitude();

    if (distance > this.minSwipeDistance) {
      this.currentDirection = swipeVector.normalize();
      this.isActive = true;
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.touchStartPos = null;
    this.isActive = false;
  }

  public getDirectionVector(): Vector2D {
    return this.currentDirection.clone();
  }

  public isInputActive(): boolean {
    return this.isActive;
  }

  public cleanup(): void {
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}