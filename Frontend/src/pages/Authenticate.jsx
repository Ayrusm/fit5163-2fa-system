import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Authenticate = () => {
  // Stores the 6 digit code typed by the user
  const [code, setCode] = useState('');

  // Stores error messages to show on the page
  const [error, setError] = useState('');

  // Gets data passed from the Login page
  const location = useLocation();

  // React Router function used to move between pages
  const navigate = useNavigate();

  // Get the email that was passed from Login.jsx
  const email = location.state?.email;

  // ============================================================
  // SURYASHREE INPUT NEEDED HERE
  // Replace 'http://localhost:5000/authenticate' with whatever URL
  // Suryashree creates for her 2FA authentication endpoint.
  //
  // Ask her: "What is your 2FA authentication endpoint URL?"
  //
  // This endpoint should check:
  // 1. email
  // 2. 6 digit code
  // ============================================================
  const BACKEND_URL = 'http://localhost:5000/authenticate';

  const handleVerifyCode = async () => {
    // STEP 1 — Check code field is not empty
    if (code === '') {
      setError('Please enter your 2FA code');
      return;
    }

    // STEP 2 — Check that we still know which user is logging in
    // This email was passed from Login.jsx using navigate state.
    if (!email) {
      setError('No email found. Please login again.');
      return;
    }

    // STEP 3 — Send email and 2FA code to Suryashree's backend
    // ============================================================
    // SURYASHREE INPUT NEEDED HERE
    // Check with Suryashree what field names she expects.
    //
    // Right now we are sending:
    // {
    //   email,
    //   code
    // }
    //
    // Ask her: "Do you expect email and code, or different names?"
    // ============================================================
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email, // SURYASHREE — confirm field name "email"
          code   // SURYASHREE — confirm field name "code"
        })
      });

      // STEP 4 — Read what Suryashree's backend sends back
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
        // Backend said YES — 2FA code matched

        // Clear any old error message
        setError('');

        // Go to the main application page
        navigate('/game');
      } else {
        // Backend said NO — 2FA code did not match
        // data.message is whatever error text Suryashree sends back
        setError(data.message || 'Invalid 2FA code');
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
  // This button skips 2FA authentication so you can test the chess game
  // without needing the backend to be running.
  // ============================================================
  const skipAuthenticationForTesting = () => {
    navigate('/game');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Two-Factor Authentication</h1>

      {/* Shows which email is being authenticated */}
      {email ? (
        <p>Enter the 6-digit code for: {email}</p>
      ) : (
        <p>Please return to login first.</p>
      )}

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
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Verify button — triggers handleVerifyCode */}
      <button
        onClick={handleVerifyCode}
        style={{
          padding: '10px 30px',
          marginTop: '10px',
          display: 'block',
          margin: '10px auto'
        }}
      >
        Verify Code
      </button>

      {/* 
        TESTING ONLY — REMOVE BEFORE FINAL SUBMISSION
        This button skips authentication so you can test the chess game
        without needing the backend to be running.
      */}
      <button
        onClick={skipAuthenticationForTesting}
        style={{
          padding: '5px 15px',
          marginTop: '10px',
          display: 'block',
          margin: '10px auto',
          fontSize: '11px',
          color: 'gray'
        }}
      >
        Skip authentication, testing only
      </button>
    </div>
  );
}

export default Authenticate;