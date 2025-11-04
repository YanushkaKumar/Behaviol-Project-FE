import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { AuthUtils } from '../utils';
import '../styles/AuthStyles.css';

const Registration = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!AuthUtils.validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!AuthUtils.validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({ 
        name: name.trim(), 
        email, 
        password 
      });
      
      if (response.success) {
        // Registration successful, now login
        const loginResponse = await authAPI.login({ 
          username: name.trim(), 
          password 
        });
        
        if (loginResponse.success) {
          // Call onRegister with user data
          onRegister({
            username: loginResponse.user.username,
            name: loginResponse.user.username
          });
        } else {
          // Registration worked but login failed, tell user to login manually
          setError('Registration successful! Please login with your username.');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us to start managing tasks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
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
              placeholder="Create a password (min 6 characters)"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="auth-link"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;