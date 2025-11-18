export interface User {
  userId: string;
  username: string;
  token?: string;
}

export interface Guest {
  userId: string;
  username: string;
  sessionId: string;
  deviceId: string;
  isGuest: boolean;
  token: string;
}

export interface Score {
  rank: number;
  scoreId: string;
  userId: string;
  username: string;
  score: number;
  foodCount: number;
  gameTime: number;
  timestamp: string;
}

export interface ScoresResponse {
  scores: Score[];
  total: number;
}

export interface UserProfile {
  userId: string;
  username: string;
  createdAt: string;
  totalGamesPlayed: number;
  highestScore: number;
  averageScore: number;
}

export interface GameState {
  snake: number[][];
  food: number[];
  foodSpawnTime: number;
  foodType: number;
  score: number;
  foodCount: number;
  gameTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  direction: number[];
  nextDirection: number[];
}
