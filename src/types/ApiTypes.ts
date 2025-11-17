// API Types based on OpenAPI specification

export interface User {
  userId: string;
  username: string;
  createdAt?: string;
  totalGamesPlayed?: number;
  highestScore?: number;
  averageScore?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface GuestRequest {
  guestName: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  token: string;
  message: string;
}

export interface GuestResponse {
  guestId: string;
  guestName: string;
  token: string;
  message: string;
}

export interface ScoreSubmission {
  userId: string;
  score: number;
  foodCount: number;
  gameTime?: number;
}

export interface ScoreEntry {
  rank?: number;
  scoreId?: string;
  userId: string;
  username: string;
  score: number;
  foodCount: number;
  gameTime: number;
  timestamp: string;
}

export interface LeaderboardResponse {
  scores: ScoreEntry[];
  total: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface UserSession {
  userId: string;
  username: string;
  token: string;
  isGuest: boolean;
}

// Game state types that work with API
export interface GameSession {
  user: UserSession | null;
  currentScore: number;
  foodCount: number;
  gameStartTime: number;
  isLoggedIn: boolean;
}