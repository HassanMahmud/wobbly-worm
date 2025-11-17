import React, { useState } from 'react';
import { apiClient } from '../api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onSwitchToGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onSwitchToGuest,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiClient.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '32px', fontWeight: '700' }}>
        Welcome Back 👋
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '15px' }}>Sign in to your account</p>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="button" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? '⏳ Logging in...' : '🔓 Login'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '25px' }}>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '2px 4px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.color = '#764ba2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            Create Account
          </button>
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          <button
            onClick={onSwitchToGuest}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '2px 4px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.color = '#764ba2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            🎮 Play as Guest
          </button>
        </p>
      </div>
    </div>
  );
};
