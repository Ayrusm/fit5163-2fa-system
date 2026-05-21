import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ============================================================
  // BACKEND INPUT NEEDED
  // This endpoint should create the main chess application account.
  //
  // Expected request:
  // {
  //   email,
  //   password
  // }
  //
  // Expected response on success:
  // {
  //   message: "User registered successfully"
  // }
  //
  // After successful registration, the user is redirected to the
  // authenticator app to create a separate authenticator password/PIN.
  // ============================================================
  const BACKEND_URL = 'http://localhost:5000/register';

  // ============================================================
  // AUTHENTICATOR APP URL
  // Change this depending on where your authenticator app runs.
  //
  // Example:
  // Main app:          http://localhost:3000
  // Authenticator app: http://localhost:3001
  //
  // The email is passed as a query parameter so the authenticator
  // registration page can pre-fill the same email.
  // ============================================================
  const AUTHENTICATOR_REGISTER_URL = 'http://localhost:3001/register';

  const handleRegister = async () => {
    if (email === '' || password === '' || confirmPassword === '') {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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

        // ============================================================
        // After creating the main account, redirect the user to the
        // authenticator app so they can create their authenticator
        // account using a separate password/PIN.
        // ============================================================
        window.location.href = `${AUTHENTICATOR_REGISTER_URL}?email=${encodeURIComponent(email)}`;
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
    }
  };

  return (
    <div className="register-page">
      <section className="register-panel">
        <div className="register-brand">
          <div className="register-mark">SC</div>

          <div>
            <h1>Secure Chess</h1>
            <p>Create your main application account</p>
          </div>
        </div>

        <div className="register-card">
          <h2>Create account</h2>

          <p className="register-description">
            Register for the chess application. After this step, you will set up
            a separate authenticator account for two-factor authentication.
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
            <label>Main app password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button className="register-button" onClick={handleRegister}>
            Register and set up authenticator
          </button>

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;