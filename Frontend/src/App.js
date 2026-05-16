import React, { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (email === '' || password === '' || code === '') {
      setError('Please fill in all fields');
      return;
    }
    // This is where we will call Suryashree's backend later
    // For now just simulate a successful login
    setLoggedIn(true);
  };

  if (loggedIn) {
    return (
      <div>
        <h1>Welcome! You are logged in.</h1>
        <p>Chess game will go here.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Chess App Login</h1>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', margin: '10px auto', padding: '8px', width: '300px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', margin: '10px auto', padding: '8px', width: '300px' }}
        />
        <input
          type="text"
          placeholder="6 digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ display: 'block', margin: '10px auto', padding: '8px', width: '300px' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          onClick={handleLogin}
          style={{ padding: '10px 30px', marginTop: '10px' }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default App;