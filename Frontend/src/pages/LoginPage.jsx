import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }

    // TODO: call backend to verify email/password
    // For now: go to 2FA page
    navigate('/authenticate', {
      state: { email }
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Chess App Login</h1>

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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{ padding: '10px 30px', marginTop: '10px' }}
      >
        Continue
      </button>
    </div>
  );
}

export default Login;