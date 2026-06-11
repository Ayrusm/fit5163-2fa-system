/*
 * Program: Game.jsx
 *
 * Purpose: Displays the authenticated chess game page. The component uses
 *          chess.js for game rules and react-chessboard for board interaction.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import '../styles/Game.css';

/*
 * Component: Game
 *
 * Purpose: Manages the local chess game state, move history, board actions,
 *          and logout flow for authenticated users.
 */
function Game() {
  const navigate = useNavigate();
  
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState('White to move');

  const updateStatus = (currentGame) => {
    /*
     * Purpose: Reads the chess engine state and updates the user-facing game
     *          status message after each board action.
     */
    if (currentGame.isCheckmate()) {
      setStatus(
        currentGame.turn() === 'w'
          ? 'Checkmate. Black wins.'
          : 'Checkmate. White wins.'
      );
      return;
    }

    if (currentGame.isDraw()) {
      setStatus('Game over. Draw.');
      return;
    }

    if (currentGame.isStalemate()) {
      setStatus('Game over. Stalemate.');
      return;
    }

    if (currentGame.isCheck()) {
      setStatus(
        currentGame.turn() === 'w'
          ? 'White is in check.'
          : 'Black is in check.'
      );
      return;
    }

    setStatus(currentGame.turn() === 'w' ? 'White to move' : 'Black to move');
  };

  const makeMove = (sourceSquare, targetSquare) => {
  /*
   * Purpose: Attempts to apply a dragged chess move and updates the board only
   *          when chess.js accepts the move as legal.
   */
  const gameCopy = new Chess(game.fen());

  try {
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });

    if (!move) {
      return false;
    }

    setGame(gameCopy);
    updateStatus(gameCopy);

    return true;
  } catch (error) {
    return false;
  }
};

  const resetGame = () => {
    /*
     * Purpose: Starts a new chess game and resets the displayed status.
     */
    const newGame = new Chess();

    setGame(newGame);
    setStatus('White to move');
  };

  const undoMove = () => {
    /*
     * Purpose: Reverts the latest move in the current chess game.
     */
    const gameCopy = new Chess(game.fen());

    gameCopy.undo();

    setGame(gameCopy);
    updateStatus(gameCopy);
  };

  const handleLogout = async () => {
  /*
   * Purpose: Notifies the backend when possible and then clears the local
   *          browser session before returning to login.
   */
  const token = localStorage.getItem('token');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  try {
    await fetch(`${BACKEND_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.log('Logout request failed, clearing local session anyway.');
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  navigate('/login');
};

  return (
    <div className="game-page">
      <header className="game-header">
        <div>
          <h1>CheckMate</h1>
          <p>Authenticated game session</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="game-layout">
        <section className="board-section">
          <div className="board-card">
            <Chessboard
              position={game.fen()}
              onPieceDrop={makeMove}
              boardWidth={520}
            />
          </div>
        </section>

        <aside className="game-panel">
          <h2>Game Status</h2>

          <div className="status-box">
            <span>Current Status</span>
            <strong>{status}</strong>
          </div>

          <div className="game-info">
            <div>
              <span>Turn</span>
              <strong>{game.turn() === 'w' ? 'White' : 'Black'}</strong>
            </div>

            <div>
              <span>Move Count</span>
              <strong>{game.history().length}</strong>
            </div>
          </div>

          <div className="game-actions">
            <button onClick={resetGame}>Reset Game</button>
            <button onClick={undoMove}>Undo Move</button>
          </div>

          <div className="moves-section">
            <h3>Move History</h3>

            {game.history().length === 0 ? (
              <p>No moves yet.</p>
            ) : (
              <ol>
                {game.history().map((move, index) => (
                  <li key={index}>{move}</li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Game;
