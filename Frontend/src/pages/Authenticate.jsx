import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Authenticate.css';

function Authenticate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const BACKEND_URL = 'http://localhost:5000/authenticate';

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds === 1) {
          return 15;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleVerifyCode = async () => {
    if (code === '') {
      setError('Please enter your authentication code');
      return;
    }

    if (code.length !== 6) {
      setError('Authentication code must be 6 digits');
      return;
    }

    if (!email) {
      setError('No login session found. Please return to the login page.');
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
          code
        })
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        navigate('/game');
      } else {
        setError(data.message || 'Invalid or expired authentication code');
      }
    } catch (err) {
      setError('Unable to connect to the authentication server.');
    }
  };

  const skipAuthenticationForTesting = () => {
    navigate('/game');
  };

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <section className="auth-header">
          <div className="auth-brand">
            <div className="auth-mark">SC</div>
            <div>
              <h1>Secure Chess</h1>
              <p>Identity verification</p>
            </div>
          </div>
        </section>

        <section className="auth-content">
          <h2>Enter verification code</h2>

          <p className="auth-description">
            A temporary 6-digit code has been generated for this account.
            Codes refresh every 15 seconds.
          </p>

          <div className="account-summary">
            <span>Account</span>
            <strong>{email || 'No account selected'}</strong>
          </div>

          <div className="form-group">
            <label htmlFor="code">Verification code</label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              className="code-input"
              autoComplete="one-time-code"
            />
          </div>

          <div className="code-meta">
            <span>Code refresh</span>
            <strong>{secondsLeft}s remaining</strong>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-action" onClick={handleVerifyCode}>
            Verify and continue
          </button>

          <button className="testing-action" onClick={skipAuthenticationForTesting}>
            Skip authentication for testing
          </button>

          <div className="auth-links">
            <Link to="/login">Return to login</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Authenticate;