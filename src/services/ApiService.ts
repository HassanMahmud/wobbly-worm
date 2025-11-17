import {
  LoginRequest,
  RegisterRequest,
  GuestRequest,
  AuthResponse,
  GuestResponse,
  ScoreSubmission,
  ScoreEntry,
  LeaderboardResponse,
  User,
  HealthResponse,
  ApiError,
} from '@/types/ApiTypes.js';

export class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('snake_game_token');
  }

  private saveTokenToStorage(token: string): void {
    this.token = token;
    localStorage.setItem('snake_game_token', token);
  }

  private clearTokenFromStorage(): void {
    this.token = null;
    localStorage.removeItem('snake_game_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(`API Error: ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Authentication methods
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    this.saveTokenToStorage(response.token);
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    this.saveTokenToStorage(response.token);
    return response;
  }

  async createGuestSession(request: GuestRequest): Promise<GuestResponse> {
    const response = await this.makeRequest<GuestResponse>('/api/users/guest', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    this.saveTokenToStorage(response.token);
    return response;
  }

  async getUserProfile(userId: string): Promise<User> {
    return await this.makeRequest<User>(`/api/users/${userId}`);
  }

  // Score methods
  async submitScore(score: ScoreSubmission): Promise<ScoreEntry> {
    return await this.makeRequest<ScoreEntry>('/api/scores', {
      method: 'POST',
      body: JSON.stringify(score),
    });
  }

  async getTopScores(limit: number = 10): Promise<LeaderboardResponse> {
    return await this.makeRequest<LeaderboardResponse>(`/api/scores/top?limit=${limit}`);
  }

  async getUserScores(userId: string, limit: number = 20): Promise<{ userId: string; scores: ScoreEntry[]; total: number }> {
    return await this.makeRequest(`/api/scores/user/${userId}?limit=${limit}`);
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return await this.makeRequest<HealthResponse>('/api/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  logout(): void {
    this.clearTokenFromStorage();
  }
}