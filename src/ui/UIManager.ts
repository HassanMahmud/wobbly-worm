import { ApiService } from '@/services/ApiService.js';
import { UserSessionManager } from '@/services/UserSessionManager.js';
import { LeaderboardResponse } from '@/types/ApiTypes.js';

export class UIManager {
  private apiService: ApiService;
  private sessionManager: UserSessionManager;
  private currentScreen: string = 'login';
  private onGameStart: () => void;
  private onShowLeaderboard: () => void;

  constructor(
    apiService: ApiService,
    sessionManager: UserSessionManager,
    onGameStart: () => void,
    onShowLeaderboard: () => void
  ) {
    this.apiService = apiService;
    this.sessionManager = sessionManager;
    this.onGameStart = onGameStart;
    this.onShowLeaderboard = onShowLeaderboard;
    this.createUI();
  }

  private createUI(): void {
    this.createLoginScreen();
    this.createRegisterScreen();
    this.createLeaderboardScreen();
    this.createGameUI();

    // Show appropriate screen based on session
    if (this.sessionManager.isLoggedIn()) {
      this.showGameUI();
    } else {
      this.showLoginScreen();
    }
  }

  private createLoginScreen(): void {
    const loginHTML = `
      <div id="loginScreen" class="screen" style="display: none;">
        <div class="auth-container">
          <h1>No-Grid Snake</h1>
          <form id="loginForm" class="auth-form">
            <h2>Login</h2>
            <div class="form-group">
              <input type="text" id="loginUsername" placeholder="Username" required minlength="3">
            </div>
            <div class="form-group">
              <input type="password" id="loginPassword" placeholder="Password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <div class="auth-links">
              <a href="#" id="showRegister">Don't have an account? Register</a>
              <a href="#" id="playGuest">Play as Guest</a>
            </div>
          </form>
          <div id="loginError" class="error-message"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginHTML);
    this.setupLoginHandlers();
  }

  private createRegisterScreen(): void {
    const registerHTML = `
      <div id="registerScreen" class="screen" style="display: none;">
        <div class="auth-container">
          <h1>No-Grid Snake</h1>
          <form id="registerForm" class="auth-form">
            <h2>Register</h2>
            <div class="form-group">
              <input type="text" id="registerUsername" placeholder="Username" required minlength="3" maxlength="50">
            </div>
            <div class="form-group">
              <input type="password" id="registerPassword" placeholder="Password" required minlength="6">
            </div>
            <div class="form-group">
              <input type="password" id="confirmPassword" placeholder="Confirm Password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
            <div class="auth-links">
              <a href="#" id="showLogin">Already have an account? Login</a>
            </div>
          </form>
          <div id="registerError" class="error-message"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', registerHTML);
    this.setupRegisterHandlers();
  }

  private createLeaderboardScreen(): void {
    const leaderboardHTML = `
      <div id="leaderboardScreen" class="screen" style="display: none;">
        <div class="leaderboard-container">
          <h1>Top 10 Scores</h1>
          <div id="leaderboardContent" class="leaderboard-content">
            <div class="loading">Loading leaderboard...</div>
          </div>
          <div class="leaderboard-actions">
            <button id="backToGame" class="btn btn-secondary">Back to Game</button>
            <button id="refreshLeaderboard" class="btn btn-primary">Refresh</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', leaderboardHTML);
    this.setupLeaderboardHandlers();
  }

  private createGameUI(): void {
    const gameUIHTML = `
      <div id="gameUI" class="game-ui" style="display: none;">
        <div class="game-header">
          <div class="user-info">
            <span id="welcomeMessage">Welcome, <span id="currentUsername">Player</span>!</span>
            <button id="viewLeaderboard" class="btn btn-small">Leaderboard</button>
            <button id="logoutBtn" class="btn btn-small btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', gameUIHTML);
    this.setupGameUIHandlers();
  }

  private setupLoginHandlers(): void {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const showRegister = document.getElementById('showRegister') as HTMLAnchorElement;
    const playGuest = document.getElementById('playGuest') as HTMLAnchorElement;

    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    showRegister?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterScreen();
    });

    playGuest?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleGuestLogin();
    });
  }

  private setupRegisterHandlers(): void {
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;
    const showLogin = document.getElementById('showLogin') as HTMLAnchorElement;

    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister();
    });

    showLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginScreen();
    });
  }

  private setupLeaderboardHandlers(): void {
    const backToGame = document.getElementById('backToGame') as HTMLButtonElement;
    const refreshLeaderboard = document.getElementById('refreshLeaderboard') as HTMLButtonElement;

    backToGame?.addEventListener('click', () => {
      this.hideLeaderboard();
    });

    refreshLeaderboard?.addEventListener('click', async () => {
      await this.loadLeaderboard();
    });
  }

  private setupGameUIHandlers(): void {
    const viewLeaderboard = document.getElementById('viewLeaderboard') as HTMLButtonElement;
    const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;

    viewLeaderboard?.addEventListener('click', () => {
      this.showLeaderboard();
    });

    logoutBtn?.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  private async handleLogin(): Promise<void> {
    const username = (document.getElementById('loginUsername') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('loginError') as HTMLDivElement;

    try {
      errorDiv.textContent = '';
      const response = await this.apiService.login({ username, password });
      this.sessionManager.setSession(response.userId, response.username, response.token, false);
      this.showGameUI();
      this.onGameStart();
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Login failed';
    }
  }

  private async handleRegister(): Promise<void> {
    const username = (document.getElementById('registerUsername') as HTMLInputElement).value;
    const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('registerError') as HTMLDivElement;

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      return;
    }

    try {
      errorDiv.textContent = '';
      const response = await this.apiService.register({ username, password });
      this.sessionManager.setSession(response.userId, response.username, response.token, false);
      this.showGameUI();
      this.onGameStart();
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Registration failed';
    }
  }

  private async handleGuestLogin(): Promise<void> {
    const guestName = prompt('Enter your guest name:') || 'Guest Player';

    try {
      const response = await this.apiService.createGuestSession({ guestName });
      this.sessionManager.setSession(response.guestId, response.guestName, response.token, true);
      this.showGameUI();
      this.onGameStart();
    } catch (error) {
      alert('Failed to create guest session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private handleLogout(): void {
    this.sessionManager.clearSession();
    this.showLoginScreen();
  }

  public showLoginScreen(): void {
    this.hideAllScreens();
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.style.display = 'flex';
    this.currentScreen = 'login';
  }

  public showRegisterScreen(): void {
    this.hideAllScreens();
    const registerScreen = document.getElementById('registerScreen');
    if (registerScreen) registerScreen.style.display = 'flex';
    this.currentScreen = 'register';
  }

  public showGameUI(): void {
    this.hideAllScreens();
    const gameUI = document.getElementById('gameUI');
    const gameContainer = document.getElementById('gameContainer');

    if (gameUI) gameUI.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'block';

    // Update username display
    const usernameSpan = document.getElementById('currentUsername');
    if (usernameSpan) {
      usernameSpan.textContent = this.sessionManager.getUsername();
    }

    this.currentScreen = 'game';
  }

  public async showLeaderboard(): Promise<void> {
    this.hideAllScreens();
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    if (leaderboardScreen) leaderboardScreen.style.display = 'flex';

    await this.loadLeaderboard();
    this.currentScreen = 'leaderboard';
  }

  public hideLeaderboard(): void {
    this.showGameUI();
  }

  private hideAllScreens(): void {
    const screens = ['loginScreen', 'registerScreen', 'leaderboardScreen', 'gameUI'];
    screens.forEach(screenId => {
      const screen = document.getElementById(screenId);
      if (screen) screen.style.display = 'none';
    });

    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) gameContainer.style.display = 'none';
  }

  private async loadLeaderboard(): Promise<void> {
    const content = document.getElementById('leaderboardContent');
    if (!content) return;

    try {
      content.innerHTML = '<div class="loading">Loading leaderboard...</div>';
      const leaderboard = await this.apiService.getTopScores(10);
      this.renderLeaderboard(leaderboard);
    } catch (error) {
      content.innerHTML = `<div class="error">Failed to load leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
  }

  private renderLeaderboard(leaderboard: LeaderboardResponse): void {
    const content = document.getElementById('leaderboardContent');
    if (!content) return;

    if (leaderboard.scores.length === 0) {
      content.innerHTML = '<div class="no-scores">No scores yet. Be the first to play!</div>';
      return;
    }

    const leaderboardHTML = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Food</th>
            <th>Time</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${leaderboard.scores.map(score => `
            <tr ${score.userId === this.sessionManager.getUserId() ? 'class="current-user"' : ''}>
              <td>#${score.rank}</td>
              <td>${score.username}</td>
              <td>${score.score.toLocaleString()}</td>
              <td>${score.foodCount}</td>
              <td>${this.formatTime(score.gameTime)}</td>
              <td>${this.formatDate(score.timestamp)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    content.innerHTML = leaderboardHTML;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString();
  }

  public getCurrentScreen(): string {
    return this.currentScreen;
  }

  public isGameScreen(): boolean {
    return this.currentScreen === 'game';
  }
}