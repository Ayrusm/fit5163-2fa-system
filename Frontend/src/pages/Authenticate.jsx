import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Authenticate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleVerifyCode = () => {
    if (code === '') {
      setError('Please enter your 2FA code');
      return;
    }

    // TODO: call backend to verify 2FA code
    // For now: simulate successful authentication
    navigate('/game');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Two-Factor Authentication</h1>

      {email && <p>Enter the code for: {email}</p>}

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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleVerifyCode}
        style={{ padding: '10px 30px', marginTop: '10px' }}
      >
        Verify
      </button>
    </div>
  );
}

export default Authenticate;