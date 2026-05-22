import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthenticatorLogin.css';

function AuthenticatorLogin() {
  const [email, setEmail] = useState('');
  const [authenticatorPassword, setAuthenticatorPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000/authenticator/login';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email');

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  const handleLogin = async () => {
    if (email === '' || authenticatorPassword === '') {
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
          authenticatorPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authenticatorToken', data.token);
        localStorage.setItem('authenticatorUser', JSON.stringify(data.user));

        setError('');
        navigate('/code');
      } else {
        setError(data.message || 'Invalid authenticator credentials');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  return (
    <div className="authenticator-page">
      <main className="authenticator-login-card">
        <div className="authenticator-login-brand">
          <div className="authenticator-logo">SC</div>

          <div>
            <h1>Secure Authenticator</h1>
            <p>Access your temporary verification code</p>
          </div>
        </div>

        <section className="authenticator-login-content">
          <h2>Authenticator sign in</h2>

          <p className="authenticator-login-description">
            Enter your authenticator password or PIN to view your current
            2FA verification code.
          </p>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Authenticator password / PIN</label>
            <input
              type="password"
              placeholder="Enter authenticator password"
              value={authenticatorPassword}
              onChange={(e) => setAuthenticatorPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-button" onClick={handleLogin}>
            Show verification code
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate('/register')}
          >
            Set up authenticator
          </button>
        </section>
      </main>
    </div>
  );
}

export default AuthenticatorLogin;