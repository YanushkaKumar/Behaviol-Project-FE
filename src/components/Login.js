import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/AuthStyles.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    console.log('Attempting login with username:', username);

    try {
      const response = await authAPI.login({ username: username.trim(), password });
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, user data:', response.user);
        // Call onLogin with user data
        onLogin({
          username: response.user.username,
          name: response.user.username
        });
      } else {
        console.error('Login failed:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error caught:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Task Manager</h1>
          <p className="auth-subtitle">Sign in to manage your tasks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="auth-link"
              disabled={loading}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;