import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { GuestEntry } from './components/GuestEntry';
import { SnakeGame } from './components/SnakeGame';
import { Scoreboard } from './components/Scoreboard';
import { GameResults } from './components/GameResults';
import { User, Guest } from './types';
import { apiClient } from './api';

type Screen = 'guest-entry' | 'login' | 'register' | 'menu' | 'game' | 'results' | 'scores';

interface UserSession {
  userId: string;
  username: string;
  isGuest: boolean;
  sessionId?: string;
  deviceId?: string;
}

interface GameResult {
  score: number;
  foodCount: number;
  gameTime: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('guest-entry');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserSession({
          userId: user.userId,
          username: user.username,
          isGuest: false,
        });
        setCurrentScreen('menu');
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    const session: UserSession = {
      userId: user.userId,
      username: user.username,
      isGuest: false,
    };
    setUserSession(session);
    localStorage.setItem('user', JSON.stringify(session));
    setCurrentScreen('menu');
  };

  const handleRegisterSuccess = (user: User) => {
    const session: UserSession = {
      userId: user.userId,
      username: user.username,
      isGuest: false,
    };
    setUserSession(session);
    localStorage.setItem('user', JSON.stringify(session));
    setCurrentScreen('menu');
  };

  const handleGuestSuccess = (guest: Guest) => {
    const session: UserSession = {
      userId: guest.userId,
      username: guest.username,
      isGuest: true,
      sessionId: guest.sessionId,
      deviceId: guest.deviceId,
    };
    setUserSession(session);
    localStorage.setItem('user', JSON.stringify(session));
    setCurrentScreen('menu');
  };

  const handleGameEnd = (score: number, foodCount: number, gameTime: number) => {
    setGameResult({ score, foodCount, gameTime });
    setCurrentScreen('results');
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiClient.clearAuthToken();
    setCurrentScreen('guest-entry');
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'guest-entry':
        return (
          <GuestEntry
            onGuestSuccess={handleGuestSuccess}
            onSwitchToLogin={() => setCurrentScreen('login')}
          />
        );

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentScreen('register')}
            onSwitchToGuest={() => setCurrentScreen('guest-entry')}
          />
        );

      case 'register':
        return (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentScreen('login')}
          />
        );

      case 'menu':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nav-bar">
              <h2>Welcome, {userSession?.username}! 👋</h2>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <div className="card" style={{ maxWidth: '550px', marginTop: '50px' }}>
              <h1 style={{ marginBottom: '15px', color: '#667eea', fontSize: '42px' }}>🐍 Snake Game</h1>
              <p style={{ marginBottom: '35px', color: '#666', fontSize: '16px', fontWeight: '400' }}>Get ready for an exciting gaming experience!</p>
              <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                <button
                  onClick={() => setCurrentScreen('game')}
                  className="button"
                  style={{ fontSize: '18px', padding: '15px' }}
                >
                  🎮 Start Game
                </button>
                <button
                  onClick={() => setCurrentScreen('scores')}
                  className="button"
                  style={{ fontSize: '18px', padding: '15px' }}
                >
                  🏆 View Scores
                </button>
              </div>
            </div>
          </div>
        );

      case 'game':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nav-bar">
              <h2>🎮 Snake Game</h2>
              <button onClick={() => setCurrentScreen('menu')} className="button">
                ← Back to Menu
              </button>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '40px' }}>
              <SnakeGame
                userId={userSession?.userId}
                userName={userSession?.username}
                isGuest={userSession?.isGuest}
                onGameEnd={handleGameEnd}
              />
            </div>
          </div>
        );

      case 'results':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nav-bar">
              <h2>📊 Game Results</h2>
              <div></div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '40px' }}>
              <GameResults
                score={gameResult?.score || 0}
                foodCount={gameResult?.foodCount || 0}
                gameTime={gameResult?.gameTime || 0}
                playerName={userSession?.username || 'Guest'}
                onPlayAgain={() => setCurrentScreen('game')}
                onBackToMenu={() => setCurrentScreen('menu')}
              />
            </div>
          </div>
        );

      case 'scores':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nav-bar">
              <h2>🏆 Leaderboard</h2>
              <button onClick={() => setCurrentScreen('menu')} className="button">
                ← Back to Menu
              </button>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '40px' }}>
              <Scoreboard
                userId={userSession?.userId}
                isGuest={userSession?.isGuest}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {currentScreen === 'guest-entry' || currentScreen === 'login' || currentScreen === 'register' ? (
        <div className="header">
          <h1>🐍 Snake Game</h1>
          <p>A classic snake game with leaderboard</p>
        </div>
      ) : null}
      {renderContent()}
    </div>
  );
}

export default App;
