import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // Stores the email typed by the user
  const [email, setEmail] = useState('');

  // Stores the password typed by the user
  const [password, setPassword] = useState('');

  // Stores error messages to show on the page
  const [error, setError] = useState('');

  // React Router function used to move between pages
  const navigate = useNavigate();

  // ============================================================
  // SURYASHREE INPUT NEEDED HERE
  // Replace 'http://localhost:5000/login' with whatever URL
  // Suryashree creates for her login endpoint.
  //
  // Ask her: "What is your login endpoint URL?"
  //
  // This endpoint should check only:
  // 1. email
  // 2. password
  //
  // The 2FA code is checked later in Authenticate.jsx.
  // ============================================================
  const BACKEND_URL = 'http://localhost:5000/login';

  const handleLogin = async () => {
    // STEP 1 — Check fields are not empty
    if (email === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }

    // STEP 2 — Send email and password to Suryashree's backend
    // ============================================================
    // SURYASHREE INPUT NEEDED HERE
    // Check with Suryashree what field names she expects.
    //
    // Right now we are sending:
    // {
    //   email,
    //   password
    // }
    //
    // Ask her: "Do you expect email and password, or different names?"
    // ============================================================
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,    // SURYASHREE — confirm field name "email"
          password  // SURYASHREE — confirm field name "password"
        })
      });

      // STEP 3 — Read what Suryashree's backend sends back
      // ============================================================
      // SURYASHREE INPUT NEEDED HERE
      // Ask her: "What does your response look like on success and failure?"
      //
      // Right now we assume:
      // Success → response.ok is true, probably HTTP status 200
      // Failure → response.ok is false and data.message has the error text
      // ============================================================
      const data = await response.json();

      if (response.ok) {
        // Backend said YES — email and password matched

        // Clear any old error message
        setError('');

        // Go to the 2FA page
        // We pass the email to the next page so it knows which user's code to verify
        navigate('/authenticate', {
          state: { email }
        });
      } else {
        // Backend said NO — email or password did not match
        // data.message is whatever error text Suryashree sends back
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      // This runs if Suryashree's server is not running
      // or there is a network / CORS problem
      setError('Could not connect to server. Is the backend running?');
    }
  };

  // ============================================================
  // TESTING ONLY — REMOVE BEFORE FINAL SUBMISSION
  //
  // This button skips the login page so you can test the chess game
  // without needing the backend to be running.
  // ============================================================
  const skipLoginForTesting = () => {
    navigate('/game');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Chess App Login</h1>

      <div>
        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: 'block',
            margin: '10px auto',
            padding: '8px',
            width: '300px'
          }}
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: 'block',
            margin: '10px auto',
            padding: '8px',
            width: '300px'
          }}
        />

        {/* Error message — only shows when error variable has text */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Login button — triggers handleLogin */}
        <button
          onClick={handleLogin}
          style={{
            padding: '10px 30px',
            marginTop: '10px',
            display: 'block',
            margin: '10px auto'
          }}
        >
          Continue
        </button>

        {/* 
          TESTING ONLY — REMOVE BEFORE FINAL SUBMISSION
          This button skips login so you can test the chess game
          without needing the backend to be running.
        */}
        <button
          onClick={skipLoginForTesting}
          style={{
            padding: '5px 15px',
            marginTop: '10px',
            display: 'block',
            margin: '10px auto',
            fontSize: '11px',
            color: 'gray'
          }}
        >
          Skip login, testing only
        </button>
      </div>
    </div>
  );
}

export default Login;