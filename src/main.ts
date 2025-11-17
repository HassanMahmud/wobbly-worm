import { Game } from './game/Game.js';
import { ApiService } from './services/ApiService.js';
import { UserSessionManager } from './services/UserSessionManager.js';
import { UIManager } from './ui/UIManager.js';

// Main application entry point
class Application {
  private game: Game | null = null;
  private apiService: ApiService | null = null;
  private sessionManager: UserSessionManager | null = null;
  private uiManager: UIManager | null = null;

  constructor() {
    this.initializeApplication();
  }

  private initializeApplication(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    try {
      // Get canvas element
      const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Initialize API service (check for API server or use localhost:5000)
      this.apiService = new ApiService();

      // Initialize session manager
      this.sessionManager = new UserSessionManager(this.apiService);

      // Initialize UI manager with callbacks
      this.uiManager = new UIManager(
        this.apiService,
        this.sessionManager,
        () => this.startGame(), // onGameStart callback
        () => this.showLeaderboard() // onShowLeaderboard callback
      );

      // Create game instance
      this.game = new Game(canvas, this.apiService, this.sessionManager);

      console.log('No-Grid Snake Game initialized successfully');

      // Add global error handling
      this.setupErrorHandling();

      // Add development helpers
      if (process.env.NODE_ENV === 'development') {
        this.setupDevelopmentHelpers();
      }

    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to initialize the game. Please refresh the page.');
    }
  }

  private startGame(): void {
    if (this.game && this.uiManager?.isGameScreen()) {
      this.game.init();
    }
  }

  private showLeaderboard(): void {
    if (this.uiManager) {
      this.uiManager.showLeaderboard();
    }
  }

  private setupErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError('An unexpected error occurred. The game may not function properly.');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }

  private setupDevelopmentHelpers(): void {
    // Make game instance available globally for debugging
    (window as any).game = this.game;

    // Add keyboard shortcuts for development
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + D to toggle debug mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        if (this.game) {
          this.game.enableDebugMode(true);
          console.log('Debug mode enabled');
        }
      }

      // Ctrl/Cmd + L to log game state
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        if (this.game) {
          this.game.logGameState();
        }
      }
    });

    console.log('Development helpers loaded:');
    console.log('- window.game: Access to game instance');
    console.log('- Ctrl/Cmd + D: Toggle debug mode');
    console.log('- Ctrl/Cmd + L: Log game state');
  }

  private showError(message: string): void {
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    errorOverlay.innerHTML = `
      <h2 style="color: #ff6b6b; margin-bottom: 20px;">Game Error</h2>
      <p style="margin-bottom: 30px; max-width: 600px; line-height: 1.5;">${message}</p>
      <button id="refreshButton" style="
        background: #00ff88;
        color: #000;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        font-family: inherit;
        cursor: pointer;
        border-radius: 5px;
      ">Refresh Page</button>
    `;

    document.body.appendChild(errorOverlay);

    // Add refresh functionality
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  // Cleanup method for proper shutdown
  public cleanup(): void {
    if (this.game) {
      this.game.cleanup();
      this.game = null;
    }
    this.apiService = null;
    this.sessionManager = null;
    this.uiManager = null;
  }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  if ((window as any).app) {
    (window as any).app.cleanup();
  }
});

// Create and start the application
const app = new Application();

// Make app available globally for cleanup
(window as any).app = app;

export default app;