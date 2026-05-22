import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CodeDisplay.css';

function CodeDisplay() {
  const [code, setCode] = useState('------');
  const [expiresIn, setExpiresIn] = useState(15);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000/authenticator/code';

  const fetchCurrentCode = async () => {
    const token = localStorage.getItem('authenticatorToken');

    // if (!token) {
    //   navigate('/login');
    //   return;
    // }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCode(data.code);
        setExpiresIn(data.expiresIn);
        setEmail(data.email);
        setError('');
      } else {
        setError(data.message || 'Could not load verification code');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  useEffect(() => {
    fetchCurrentCode();

    const interval = setInterval(() => {
      fetchCurrentCode();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authenticatorToken');
    localStorage.removeItem('authenticatorUser');

    navigate('/login');
  };

  return (
    <div className="authenticator-page">
      <main className="code-card">
        <header className="code-header">
          <div className="authenticator-logo">SC</div>

          <div>
            <h1>Verification Code</h1>
            <p>Secure Authenticator</p>
          </div>
        </header>

        <section className="account-box">
          <span>Account</span>
          <strong>{email || 'Loading account...'}</strong>
        </section>

        <section className="code-display-box">
          <span>Current code</span>
          <strong>{code}</strong>
        </section>

        <section className="timer-box">
          <span>Refreshes in</span>
          <strong>{expiresIn}s</strong>
        </section>

        <p className="code-description">
          Enter this 6-digit code in the main Secure Chess application.
          The code refreshes every 15 seconds.
        </p>

        {error && <div className="error-box">{error}</div>}

        <button className="secondary-button" onClick={handleLogout}>
          Logout from authenticator
        </button>
      </main>
    </div>
  );
}

export default CodeDisplay;