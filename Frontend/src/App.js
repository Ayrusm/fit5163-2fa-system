import React, { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // ============================================================
  // SURYASHREE INPUT NEEDED HERE
  // Replace 'http://localhost:5000/login' with whatever URL 
  // Suryashree creates for her login endpoint
  // Ask her: "What is your login endpoint URL?"
  // ============================================================
  const BACKEND_URL = 'http://localhost:5000/login';

  const handleLogin = async () => {

    // STEP 1 — Check fields are not empty (already done)
    if (email === '' || password === '' || code === '') {
      setError('Please fill in all fields');
      return;
    }

    // STEP 2 — Send to Suryashree's backend
    // ============================================================
    // SURYASHREE INPUT NEEDED HERE
    // Check with Suryashree what field names she expects
    // Right now we are sending: email, password, code
    // Ask her: "Do you expect email, password, code or different names?"
    // ============================================================
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email,      // SURYASHREE — confirm field name "email"
          password,   // SURYASHREE — confirm field name "password"
          code        // SURYASHREE — confirm field name "code"
        })
      });

      // STEP 3 — Read what Suryashree's backend sends back
      // ============================================================
      // SURYASHREE INPUT NEEDED HERE
      // Ask her: "What does your response look like on success and failure?"
      // Right now we assume:
      // Success → response.ok is true (HTTP status 200)
      // Failure → response.ok is false + data.message has the error text
      // ============================================================
      const data = await response.json();

      if (response.ok) {
        // Backend said YES — all credentials matched
        setLoggedIn(true);
        setError('');
      } else {
        // Backend said NO — something didn't match
        // data.message is whatever error text Suryashree sends back
        setError(data.message || 'Invalid credentials');
      }

    } catch (err) {
      // This runs if Suryashree's server is not running
      // or there is a network problem
      setError('Could not connect to server. Is the backend running?');
    }
  };

  // ============================================================
  // SURYASHREE INPUT NEEDED HERE
  // Once backend is connected, remove this test button
  // It currently lets you skip login for testing purposes only
  // ============================================================
  const skipLoginForTesting = () => {
    setLoggedIn(true);
  };

  // This screen shows after successful login
  // Chess game goes here
  if (loggedIn) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome! You are logged in.</h1>
        <p>Chess game will go here.</p>
        {/* ============================================================
            YOUR TASK — LAVISHA
            Replace the paragraph above with the chess game component
            once you have found and installed it
            ============================================================ */}
      </div>
    );
  }

  // This is the login form — shows before login
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

        {/* 6 digit 2FA code input */}
        <input
          type="text"
          placeholder="6 digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ 
            display: 'block', 
            margin: '10px auto', 
            padding: '8px', 
            width: '300px' 
          }}
        />

        {/* Error message — only shows when error variable has text */}
        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

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
          Login
        </button>

        {/* ============================================================
            TESTING ONLY — REMOVE BEFORE FINAL SUBMISSION
            This button skips login so you can test the chess game
            without needing the backend to be running
            ============================================================ */}
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
          Skip login (testing only)
        </button>

      </div>
    </div>
  );
}

export default App;