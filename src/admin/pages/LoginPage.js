import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Ongeldig e-mailadres of wachtwoord.');
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-login-logo-text">BlueShipment</span>
          <span className="admin-login-logo-badge">Admin</span>
        </div>

        <h1 className="admin-login-title">Inloggen</h1>
        <p className="admin-login-subtitle">Toegang voor teamleden</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="email">E-mailadres</label>
            <input
              id="email"
              type="email"
              className="admin-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@blueshipment.nl"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              className="admin-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              required
            />
          </div>

          {error && (
            <div className="admin-login-error">{error}</div>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
