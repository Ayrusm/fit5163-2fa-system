import React from 'react';
import { Link } from 'react-router-dom';

const Game = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {/* This screen shows after successful login and 2FA authentication */}
      <h1>Welcome! You are logged in.</h1>

      <p>Chess game will go here.</p>

      {/* 
        YOUR TASK — LAVISHA
        Replace the paragraph above with the chess game component
        once you have found and installed it.
      */}

      {/* Logout link — sends user back to login page */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/login">Logout</Link>
      </div>
    </div>
  );
}

export default Game;