import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useAlert } from '../context/AlertContext';

export default function Game2() {
  const [board1, setBoard1] = useState<(string | null)[]>(Array(9).fill(null));
  const [board2, setBoard2] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner1, setWinner1] = useState<string | null>(null);
  const [winner2, setWinner2] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [typeBoard, setTypeBoard] = useState(2);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext1, setIsXNext1] = useState(true);
  const [count, setCount] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.95);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    const t = setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 30);
    return () => clearTimeout(t);
  }, []);

  const triggerSpringScale = () => {
    setScale(1.05);
    setTimeout(() => {
      setScale(1);
    }, 150);
  };

  const mode = (type: number) => {
    if (typeBoard === type) {
      return;
    }

    setOpacity(0);
    setTimeout(() => {
      setOpacity(1);
    }, 150);

    if (type === 1) {
      setBoard2(board.slice());
      setBoard(board1.slice());
      setWinner2(winner);
      setWinner(winner1);
      setIsXNext1(isXNext);
      setIsXNext(true);
      setCount2(count);
      setCount(count1);
      setCurrentPlayer('X');
    }

    if (type === 2) {
      setBoard1(board.slice());
      setBoard(board2.slice());
      setWinner1(winner);
      setWinner(winner2);
      setIsXNext(isXNext1);
      setCount1(count);
      setCount(count2);
      setCurrentPlayer(isXNext1 ? 'X' : 'O');
    }

    setTypeBoard(type);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  const findBestMove = (currentBoard: (string | null)[]): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (currentBoard[a] === 'O' && currentBoard[b] === 'O' && currentBoard[c] === null) return c;
      if (currentBoard[a] === 'O' && currentBoard[b] === null && currentBoard[c] === 'O') return b;
      if (currentBoard[a] === null && currentBoard[b] === 'O' && currentBoard[c] === 'O') return a;
    }

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (currentBoard[a] === 'X' && currentBoard[b] === 'X' && currentBoard[c] === null) return c;
      if (currentBoard[a] === 'X' && currentBoard[b] === null && currentBoard[c] === 'X') return b;
      if (currentBoard[a] === null && currentBoard[b] === 'X' && currentBoard[c] === 'X') return a;
    }

    const availableMoves = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const computerMove = (boardAfterPlayer: (string | null)[]) => {
    const newboard = boardAfterPlayer.slice();
    const availableMoves = newboard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);
    if (availableMoves.length > 0) {
      const move = findBestMove(newboard);
      newboard[move] = 'O';
      setIsXNext(true);
      setCurrentPlayer('X');
      setWinner(calculateWinner(newboard));
      setBoard(newboard);
    }
  };

  const handlePress = (index: number) => {
    if (typeBoard === 1 && count === 5 && winner === null) {
      return showAlert('Game Over', '👻 Game Over 👻 ,Please Rest Game 🔄');
    }

    if (typeBoard === 2 && count === 9 && winner === null) {
      return showAlert('Game Over', '👻 Game Over 👻 ,Please Rest Game 🔄');
    }

    if (board[index] || winner) {
      if (winner) {
        return showAlert('Game Over', `Game Over ✨ ${winner} ✨ Is 🎊 WINNER 🎉`);
      }
      return;
    }

    if (count < 9) {
      setCount(count + 1);
    }

    // Fix Audit Bug #2: Clone board immutably and prevent AI move if Player X just won
    const nextBoard = board.slice();
    nextBoard[index] = isXNext ? 'X' : 'O';
    const immediateWinner = calculateWinner(nextBoard);

    setBoard(nextBoard);
    setWinner(immediateWinner);
    triggerSpringScale();

    if (typeBoard === 1) {
      if (!immediateWinner) {
        computerMove(nextBoard);
      }
    } else {
      setCurrentPlayer(isXNext ? 'O' : 'X');
      setIsXNext(!isXNext);
    }
  };

  const isPartOfWinningLine = (index: number) => {
    if (!winner) return false;

    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return index === a || index === b || index === c;
      }
    }

    return false;
  };

  const renderSquare = (index: number) => {
    const isWinningSquare = Boolean(winner && isPartOfWinningLine(index));

    return (
      <button
        key={index}
        type="button"
        style={{
          ...styles.square,
          ...(isWinningSquare ? styles.winningSquare : {}),
        }}
        onClick={() => handlePress(index)}
      >
        <span
          style={{
            ...styles.squareText,
            ...(board[index] === 'X' ? styles.xText : styles.oText),
          }}
        >
          {board[index]}
        </span>
      </button>
    );
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(typeBoard === 1 ? true : isXNext);
    setCurrentPlayer('X');
    setCount(0);

    setOpacity(0.3);
    setTimeout(() => {
      setOpacity(1);
    }, 200);
  };

  const isDraw =
    (typeBoard === 2 && count === 9 && winner === null) ||
    (typeBoard === 1 && count === 5 && winner === null);

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

        <div style={styles.title}>Tic Tac Toe</div>

        <div style={styles.gameInfo}>
          <div style={styles.modeTitle}>Playing Mode</div>

          <div style={styles.modeSelectorContainer}>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(typeBoard === 1 ? styles.activeModeButton : {}),
              }}
              onClick={() => mode(1)}
            >
              <span
                style={{
                  ...styles.modeButtonText,
                  ...(typeBoard === 1 ? styles.activeModeButtonText : {}),
                }}
              >
                1 PLAYER
              </span>
            </button>

            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(typeBoard === 2 ? styles.activeModeButton : {}),
              }}
              onClick={() => mode(2)}
            >
              <span
                style={{
                  ...styles.modeButtonText,
                  ...(typeBoard === 2 ? styles.activeModeButtonText : {}),
                }}
              >
                2 PLAYERS
              </span>
            </button>
          </div>

          {!winner && count < (typeBoard === 1 ? 5 : 9) && (
            <div style={styles.turnIndicator}>
              <span style={styles.turnText}>
                {typeBoard === 1 && currentPlayer === 'O'
                  ? 'Computer thinking...'
                  : `Player ${currentPlayer}'s turn`}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            ...styles.boardContainer,
            opacity,
            transform: `scale(${scale})`,
            transition: 'opacity 0.25s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div style={styles.board}>
            <div style={styles.boardRow}>
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </div>
            <div style={styles.boardRow}>
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </div>
            <div style={styles.boardRow}>
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
          </div>
        </div>

        {winner && (
          <div style={{ ...styles.resultCard, opacity }}>
            <div style={styles.winnerText}>Winner: Player {winner}</div>
          </div>
        )}

        {isDraw && (
          <div style={{ ...styles.resultCard, opacity }}>
            <div style={styles.drawText}>It's a Draw!</div>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button type="button" style={styles.resetButton} onClick={resetGame}>
            <span style={styles.resetButtonText}>Reset Game</span>
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
    marginBottom: 20,
    textAlign: 'center',
    textShadow: '1px 1px 5px rgba(0,0,0,0.7)',
  },
  gameInfo: {
    width: '100%',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 15,
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
  },
  modeSelectorContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  modeButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.1)',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 25,
    width: 150,
    border: '1px solid #78F0BC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeModeButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.3)',
  },
  modeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78F0BC',
    textAlign: 'center',
  },
  activeModeButtonText: {
    color: '#fff',
  },
  turnIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  turnText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 500,
  },
  boardContainer: {
    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))',
  },
  board: {
    width: 'clamp(260px, 78vw, 330px)',
    height: 'clamp(260px, 78vw, 330px)',
    aspectRatio: '1 / 1',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  boardRow: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  square: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: 'rgba(120, 240, 188, 0.1)',
    borderRadius: 10,
    border: '1px solid rgba(120, 240, 188, 0.3)',
  },
  winningSquare: {
    backgroundColor: 'rgba(120, 240, 188, 0.3)',
    borderColor: '#78F0BC',
  },
  squareText: {
    fontSize: 'clamp(36px, 11vw, 52px)',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  xText: {
    color: '#78F0BC',
  },
  oText: {
    color: '#FF9AA2',
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerText: {
    fontSize: 24,
    color: '#78F0BC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  drawText: {
    fontSize: 24,
    color: '#78F0BC',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 30,
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
};
