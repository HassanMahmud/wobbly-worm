import React, { useState } from 'react';
import { apiClient } from '../api';
import { Guest } from '../types';

interface GuestEntryProps {
  onGuestSuccess: (guest: Guest) => void;
  onSwitchToLogin: () => void;
}

export const GuestEntry: React.FC<GuestEntryProps> = ({ onGuestSuccess, onSwitchToLogin }) => {
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);

    try {
      const guest = await apiClient.createGuest(guestName);
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
          <label htmlFor="guestName">Your Name</label>
          <input
            id="guestName"
            type="text"
            className="input-field"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Starting...' : 'Start Playing'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Want to save your scores?
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
