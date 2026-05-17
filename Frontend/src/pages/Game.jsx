import { Link } from 'react-router-dom';

function Game() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Chess Game</h1>
      <p>You are logged in.</p>
      <p>The chess game will go here.</p>

      <Link to="/login">Logout</Link>
    </div>
  );
}

export default Game;