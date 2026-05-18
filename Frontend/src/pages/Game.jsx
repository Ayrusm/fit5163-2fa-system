import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import '../styles/Game.css';

function Game() {
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState('White to move');

  const updateStatus = (currentGame) => {
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
    const newGame = new Chess();

    setGame(newGame);
    setStatus('White to move');
  };

  const undoMove = () => {
    const gameCopy = new Chess(game.fen());

    gameCopy.undo();

    setGame(gameCopy);
    updateStatus(gameCopy);
  };

  return (
    <div className="game-page">
      <header className="game-header">
        <div>
          <h1>Secure Chess</h1>
          <p>Authenticated game session</p>
        </div>

        <Link to="/login" className="logout-button">
          Logout
        </Link>
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