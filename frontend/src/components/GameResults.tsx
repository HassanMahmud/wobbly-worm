import React from 'react';

interface GameResultsProps {
  score: number;
  foodCount: number;
  gameTime: number;
  playerName: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({
  score,
  foodCount,
  gameTime,
  playerName,
  onPlayAgain,
  onBackToMenu,
}) => {
  return (
    <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '36px', fontWeight: '800' }}>
        🎮 Game Over!
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '35px', fontSize: '15px' }}>Here's how you performed</p>

      <div className="stats">
        <div className="stat-box">
          <h3>⭐ Score</h3>
          <p>{score}</p>
        </div>
        <div className="stat-box">
          <h3>🍎 Food Eaten</h3>
          <p>{foodCount}</p>
        </div>
        <div className="stat-box">
          <h3>⏱️ Time</h3>
          <p>{gameTime}s</p>
        </div>
        <div className="stat-box">
          <h3>👤 Player</h3>
          <p style={{ fontSize: '16px', fontWeight: 'normal', color: 'white' }}>{playerName}</p>
        </div>
      </div>

      <div style={{ marginTop: '35px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <button onClick={onPlayAgain} className="button" style={{ width: '100%' }}>
          🎮 Play Again
        </button>
        <button onClick={onBackToMenu} className="button" style={{ width: '100%' }}>
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};
