import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Authenticate.css';

function Authenticate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // ============================================================
  // BACKEND INPUT NEEDED
  // This endpoint should check:
  // 1. email
  // 2. temporary 2FA code
  //
  // The backend should generate/recalculate the expected code using:
  // HMAC-SHA256(secret, email + current15SecondTimeWindow)
  //
  // Expected request:
  // {
  //   email,
  //   code
  // }
  //
  // Expected response on success:
  // {
  //   token,
  //   user: {
  //     id,
  //     email,
  //     role
  //   }
  // }
  //
  // The JWT should be issued only after this 2FA step succeeds.
  // ============================================================
  const BACKEND_URL = 'http://localhost:5000/authenticate';

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value.length <= 6) {
      setCode(value);
    }
  };

  const openAuthenticator = () => {
    const AUTHENTICATOR_LOGIN_URL = 'http://localhost:3001/login';

    if (email) {
      window.open(
        `${AUTHENTICATOR_LOGIN_URL}?email=${encodeURIComponent(email)}`,
        '_blank',
        'width=480,height=700'
      );
    } else {
      window.open(
        AUTHENTICATOR_LOGIN_URL,
        '_blank',
        'width=480,height=700'
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!email) {
      setError('No login session found. Please return to login.');
      return;
    }

    if (code === '') {
      setError('Please enter your authentication code');
      return;
    }

    if (code.length !== 6) {
      setError('Authentication code must be 6 digits');
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
        // Store JWT and user details after successful 2FA.
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setError('');
        navigate('/game');
      } else {
        setError(data.message || 'Invalid or expired authentication code');
      }
    } catch (err) {
      setError('Unable to connect to the authentication server.');
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <section className="auth-header">
          <div className="auth-brand">
            <div className="auth-mark">SC</div>

            <div>
              <h1>Secure Chess</h1>
              <p>Two-factor verification</p>
            </div>
          </div>
        </section>

        <section className="auth-content">
          <h2>Enter verification code</h2>

          <p className="auth-description">
            Open the authenticator application, sign in using your authenticator
            password or PIN, and enter the current 6-digit code shown there.
          </p>

          <div className="account-summary">
            <span>Account</span>
            <strong>{email || 'No account selected'}</strong>
          </div>

          <button className="open-authenticator-button" onClick={openAuthenticator}>
            Open authenticator app
          </button>

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

          <div className="code-note">
            Codes refresh every 15 seconds in the authenticator app.
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-action" onClick={handleVerifyCode}>
            Verify and continue
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