import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000/login';

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        navigate('/authenticate', {
          state: { email }
        });
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
    }
  };

  const skipLoginForTesting = () => {
    navigate('/game');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="logo-box">♟</div>
          <h1>Secure Chess</h1>
          <p>
            {/* A two-factor authentication system for protecting access to your chess game. */}
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Login to continue to your account</p>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button" onClick={handleLogin}>
            Continue to 2FA
          </button>

          <button className="secondary-button" onClick={skipLoginForTesting}>
            Skip login, testing only
          </button>

          <div className="login-footer">
            <span>Admin?</span>
            <button onClick={() => navigate('/admin')}>
              Go to Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;