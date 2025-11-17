import { UserSession } from '@/types/ApiTypes.js';
import { ApiService } from './ApiService.js';

export class UserSessionManager {
  private session: UserSession | null = null;
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.loadSessionFromStorage();
  }

  private loadSessionFromStorage(): void {
    const sessionData = localStorage.getItem('snake_game_session');
    if (sessionData) {
      try {
        this.session = JSON.parse(sessionData);
      } catch (error) {
        console.error('Failed to parse session data:', error);
        this.clearSession();
      }
    }
  }

  private saveSessionToStorage(): void {
    if (this.session) {
      localStorage.setItem('snake_game_session', JSON.stringify(this.session));
    } else {
      localStorage.removeItem('snake_game_session');
    }
  }

  public setSession(userId: string, username: string, token: string, isGuest: boolean = false): void {
    this.session = {
      userId,
      username,
      token,
      isGuest,
    };
    this.saveSessionToStorage();
  }

  public getSession(): UserSession | null {
    return this.session;
  }

  public isLoggedIn(): boolean {
    return this.session !== null && this.apiService.isAuthenticated();
  }

  public isGuest(): boolean {
    return this.session?.isGuest || false;
  }

  public getUsername(): string {
    return this.session?.username || 'Anonymous';
  }

  public getUserId(): string | null {
    return this.session?.userId || null;
  }

  public clearSession(): void {
    this.session = null;
    this.saveSessionToStorage();
    this.apiService.logout();
  }

  public async validateSession(): Promise<boolean> {
    if (!this.session || !this.apiService.isAuthenticated()) {
      return false;
    }

    try {
      // Try to get user profile to validate session
      await this.apiService.getUserProfile(this.session.userId);
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return false;
    }
  }
}