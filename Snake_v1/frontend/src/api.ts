import axios, { AxiosInstance } from 'axios';
import { User, Guest, ScoresResponse, UserProfile } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.token = localStorage.getItem('token');
    if (this.token) {
      this.setAuthToken(this.token);
    }
  }

  setAuthToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }

  clearAuthToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }

  getToken() {
    return this.token;
  }

  // User endpoints
  async register(username: string, password: string): Promise<User> {
    const response = await this.client.post<User>('/users/register', {
      username,
      password,
    });
    return response.data;
  }

  async login(username: string, password: string): Promise<User> {
    const response = await this.client.post<User>('/users/login', {
      username,
      password,
    });
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async createGuest(guestName: string): Promise<Guest> {
    const response = await this.client.post<Guest>('/users/guest', {
      guestName,
    });
    return response.data;
  }

  async verifyUser(username: string, password: string): Promise<{ valid: boolean; userId: string; username: string }> {
    const response = await this.client.post('/users/verify', {
      username,
      password,
    });
    return response.data;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>(`/users/${userId}`);
    return response.data;
  }

  // Score endpoints
  async submitScore(userId: string, score: number, foodCount: number, gameTime: number): Promise<any> {
    const response = await this.client.post('/scores', {
      userId,
      score,
      foodCount,
      gameTime,
    });
    return response.data;
  }

  async getTopScores(limit: number = 10): Promise<ScoresResponse> {
    const response = await this.client.get<ScoresResponse>('/scores/top', {
      params: { limit },
    });
    return response.data;
  }

  async getUserScores(userId: string, limit: number = 20): Promise<ScoresResponse> {
    const response = await this.client.get<ScoresResponse>(`/scores/user/${userId}`, {
      params: { limit },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
