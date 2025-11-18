import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { Guest } from '../types';

interface GuestEntryProps {
  onGuestSuccess: (guest: Guest) => void;
  onSwitchToLogin: () => void;
}

const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const GuestEntry: React.FC<GuestEntryProps> = ({ onGuestSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  const handleGuestEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);

    try {
      const guest = await apiClient.createGuest(username, deviceId);
      onGuestSuccess(guest);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create guest session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Play as Guest</h2>

      <form onSubmit={handleGuestEntry}>
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

        {error && <div className="error">{error}</div>}

        <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Starting...' : 'Continue'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Have an account?
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              marginLeft: '5px',
              textDecoration: 'underline',
            }}
          >
            Login / Register
          </button>
        </p>
      </div>
    </div>
  );
};
