import React, { useEffect, useState } from 'react';
import { apiClient } from '../api';
import { Score, ScoresResponse, UserProfile } from '../types';

interface ScoreboardProps {
  userId?: string;
  isGuest?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ userId, isGuest }) => {
  const [topScores, setTopScores] = useState<Score[]>([]);
  const [userScores, setUserScores] = useState<Score[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'top' | 'user'>('top');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScores();
  }, [activeTab, userId]);

  const fetchScores = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'top') {
        const data = await apiClient.getTopScores(10);
        setTopScores(data.scores);
      } else if (userId) {
        const data = await apiClient.getUserScores(userId, 20);
        setUserScores(data.scores);
        try {
          const profile = await apiClient.getUserProfile(userId);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to fetch user profile', err);
        }
      }
    } catch (err: any) {
      setError('Failed to load scores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><span>Loading...</span></div>;
  }

  const scores = activeTab === 'top' ? topScores : userScores;

  return (
    <div className="scoreboard">
      <h2>Scores</h2>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          Top 10 Scores
        </button>
        {userId && (
          <button
            className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            {isGuest ? 'My Session Scores' : 'My Scores'}
          </button>
        )}
      </div>

      {userProfile && activeTab === 'user' && (
        <div className="stats">
          <div className="stat-box">
            <h3>Total Games</h3>
            <p>{userProfile.totalGamesPlayed}</p>
          </div>
          <div className="stat-box">
            <h3>Best Score</h3>
            <p>{userProfile.highestScore}</p>
          </div>
          <div className="stat-box">
            <h3>Average Score</h3>
            <p>{Math.round(userProfile.averageScore)}</p>
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {scores.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Food</th>
              <th>Time (s)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score.scoreId}>
                <td>#{score.rank}</td>
                <td>{score.username}</td>
                <td>{score.score}</td>
                <td>{score.foodCount}</td>
                <td>{score.gameTime}</td>
                <td>{new Date(score.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No scores yet. {activeTab === 'user' ? 'Play a game to save your score!' : 'Be the first to score!'}
        </p>
      )}
    </div>
  );
};
