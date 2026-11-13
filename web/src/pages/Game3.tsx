import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoPeople, IoDesktopOutline } from 'react-icons/io5';

export default function Game3() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState("Player X's turn");
  const [xPositions, setXPositions] = useState<number[]>([]);
  const [oPositions, setOPositions] = useState<number[]>([]);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [gameMode, setGameMode] = useState<'2-player' | 'vs-computer' | null>(null);

  useEffect(() => {
    if (gameMode === 'vs-computer' && !isXNext && !gameStatus.includes('wins')) {
      const timeout = setTimeout(() => {
        makeComputerMove();
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [isXNext, gameMode, gameStatus]);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6],             // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const findWinningMove = (currentBoard: (string | null)[], marker: string): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6],             // diagonals
    ];

    for (const [a, b, c] of lines) {
      const lineMarkers = [currentBoard[a], currentBoard[b], currentBoard[c]];
      const markerCount = lineMarkers.filter((spot) => spot === marker).length;
      const emptyCount = lineMarkers.filter((spot) => spot === null).length;

      if (markerCount === 2 && emptyCount === 1) {
        if (currentBoard[a] === null) return a;
        if (currentBoard[b] === null) return b;
        if (currentBoard[c] === null) return c;
      }
    }

    return -1;
  };

  const findBestMove = (currentBoard: (string | null)[]): number => {
    const boardCopy = [...currentBoard];

    const winningMove = findWinningMove(boardCopy, 'O');
    if (winningMove !== -1) return winningMove;

    const blockingMove = findWinningMove(boardCopy, 'X');
    if (blockingMove !== -1) return blockingMove;

    if (boardCopy[4] === null) return 4;

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((pos) => boardCopy[pos] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    const availableSpots = boardCopy
      .map((spot, idx) => (spot === null ? idx : -1))
      .filter((idx) => idx !== -1);
    if (availableSpots.length > 0) {
      return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    return -1;
  };

  const makeMove = (index: number, currentPlayer: string, currentPositions: number[]) => {
    const newBoard = [...board];

    if (currentPositions.length === 3) {
      const oldestPosition = currentPositions.shift();
      newBoard[oldestPosition!] = null;
    }

    currentPositions.push(index);
    newBoard[index] = currentPlayer;

    setBoard(newBoard);
    if (currentPlayer === 'X') {
      setXPositions([...currentPositions]);
    } else {
      setOPositions([...currentPositions]);
    }

    const winner = calculateWinner(newBoard);
    if (winner) {
      if (gameMode === 'vs-computer' && winner === 'O') {
        setGameStatus('Computer wins!');
      } else {
        setGameStatus(`Player ${winner} wins!`);
      }
    } else {
      setIsXNext(currentPlayer === 'O');
      if (gameMode === 'vs-computer') {
        setGameStatus(currentPlayer === 'O' ? 'Your turn' : 'Computer is thinking...');
      } else {
        setGameStatus(`Player ${currentPlayer === 'O' ? 'X' : 'O'}'s turn`);
      }
    }

    return newBoard;
  };

  const handleSquarePress = (index: number) => {
    if (board[index] || gameStatus.includes('wins')) {
      return;
    }

    const currentPlayer = isXNext ? 'X' : 'O';
    const currentPositions = isXNext ? [...xPositions] : [...oPositions];

    if (gameMode === 'vs-computer' && !isXNext) {
      return;
    }

    makeMove(index, currentPlayer, currentPositions);
  };

  const makeComputerMove = () => {
    if (gameStatus.includes('wins')) {
      return;
    }

    const newBoard = [...board];
    const computerPositions = [...oPositions];
    const bestMoveIndex = findBestMove(newBoard);

    if (bestMoveIndex !== -1) {
      makeMove(bestMoveIndex, 'O', computerPositions);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus(gameMode === 'vs-computer' ? 'Your turn' : "Player X's turn");
    setXPositions([]);
    setOPositions([]);
  };

  const selectGameMode = (mode: '2-player' | 'vs-computer') => {
    setGameMode(mode);
    setShowModeSelection(false);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setXPositions([]);
    setOPositions([]);
    setGameStatus(mode === 'vs-computer' ? 'Your turn' : "Player X's turn");
  };

  const renderSquare = (index: number) => {
    const value = board[index];

    return (
      <button
        key={index}
        type="button"
        style={styles.square}
        onClick={() => handleSquarePress(index)}
      >
        {value === 'X' && <span style={styles.xMarker}>X</span>}
        {value === 'O' && <span style={styles.oMarker}>O</span>}
      </button>
    );
  };

  if (showModeSelection) {
    return (
      <div className="app-background">
        <div className="app-viewport" style={styles.container}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate('/')}
            aria-label="Go Back"
          >
            <IoArrowBack size={28} color="#78F0BC" />
          </button>

          <div style={styles.title}>Three Marker Tic-Tac-Toe</div>
          <div style={styles.subtitle}>Select Game Mode</div>

          <div style={styles.modeSelectionContainer}>
            <button
              type="button"
              style={styles.modeCard}
              onClick={() => selectGameMode('2-player')}
            >
              <div style={styles.modeIconContainer}>
                <IoPeople size={40} color="#78F0BC" />
              </div>
              <div style={styles.modeCardTitle}>2 Players</div>
              <div style={styles.modeCardDescription}>
                Play against a friend on the same device
              </div>
            </button>

            <button
              type="button"
              style={styles.modeCard}
              onClick={() => selectGameMode('vs-computer')}
            >
              <div style={styles.modeIconContainer}>
                <IoDesktopOutline size={40} color="#78F0BC" />
              </div>
              <div style={styles.modeCardTitle}>vs Computer</div>
              <div style={styles.modeCardDescription}>
                Challenge the AI in a strategic battle
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate('/')}
          aria-label="Go Back"
        >
          <IoArrowBack size={28} color="#78F0BC" />
        </button>

        <div style={styles.title}>Three Marker Tic-Tac-Toe</div>
        <div style={styles.subtitle}>
          {gameMode === 'vs-computer' ? 'vs Computer' : '2 Players'}
        </div>

        <div style={styles.infoContainer}>
          <div style={styles.infoText}>Each player can only have 3 markers on the board</div>
          <div style={styles.infoText}>Placing a 4th marker removes your oldest one</div>
        </div>

        <div style={styles.gameStatus}>{gameStatus}</div>

        <div style={styles.board}>
          <div style={styles.row}>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div style={styles.row}>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div style={styles.row}>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>

        <div style={styles.markerCount}>
          <div style={styles.markerCountText}>
            {gameMode === 'vs-computer' ? 'You' : 'Player X'}: {xPositions.length}/3
          </div>
          <div style={styles.markerCountText}>
            {gameMode === 'vs-computer' ? 'Computer' : 'Player O'}: {oPositions.length}/3
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.resetButton}
            onClick={resetGame}
          >
            <span style={styles.resetButtonText}>Reset Game</span>
          </button>

          <button
            type="button"
            style={styles.modeSelectButton}
            onClick={() => setShowModeSelection(true)}
          >
            <span style={styles.resetButtonText}>Change Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadow: '1px 1px 5px rgba(0,0,0,0.7)',
  },
  infoContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  infoText: {
    color: '#78F0BC',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 5,
  },
  gameStatus: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 200,
  },
  board: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  square: {
    flex: 1,
    margin: 5,
    backgroundColor: 'rgba(120, 240, 188, 0.1)',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgba(120, 240, 188, 0.3)',
  },
  xMarker: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#78F0BC',
    lineHeight: 1,
  },
  oMarker: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#FF9AA2',
    lineHeight: 1,
  },
  markerCount: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  markerCountText: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  resetButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 25,
    border: '1px solid #78F0BC',
  },
  resetButtonText: {
    color: '#78F0BC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78F0BC',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeSelectionContainer: {
    width: '100%',
    marginTop: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modeCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #78F0BC',
    marginBottom: 15,
  },
  modeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modeCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#78F0BC',
    marginBottom: 8,
  },
  modeCardDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modeSelectButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 25,
    border: '1px solid #78F0BC',
  },
};
