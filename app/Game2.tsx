import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Game2() {
  const [board1, setBoard1] = useState(Array(9).fill(null));
  const [board2, setBoard2] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner1, setWinner1] = useState<string | null>(null);
  const [winner2, setWinner2] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [typeBoard, setTypeBoard] = useState(2);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext1, setIsXNext1] = useState(true);
  const [count, setCount] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const router = useRouter();

  const mode = (type: number) => {
    if (typeBoard === type) { return; }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    if (type === 1) {
      setBoard2(board.slice());
      setBoard(board1.slice());
      setWinner2(winner);
      setWinner(winner1);
      setIsXNext1(isXNext);
      setIsXNext(true);
      setCount2(count);
      setCount(count1);
    }

    if (type === 2) {
      setBoard1(board.slice());
      setBoard(board2.slice());
      setWinner1(winner);
      setWinner(winner2);
      setIsXNext(isXNext1);
      setCount1(count);
      setCount(count2);
    }

    setTypeBoard(type);
  }

  const handlePress = (index: number) => {
    if (typeBoard === 1 && count === 5 && winner === null) {
      return alert("👻 Game Over 👻 ,Please Rest Game 🔄");
    }

    if (typeBoard === 2 && count === 9 && winner === null) {
      return alert("👻 Game Over 👻 ,Please Rest Game 🔄");
    }

    if (board[index] || winner) {
      if (winner) {
        return alert(`Game Over ✨ ${winner} ✨ Is 🎊 WINNER 🎉`);
      }
      return;
    }

    if (count < 9) {
      setCount(count + 1);
    }

    board[index] = isXNext ? "X" : "O";
    setCurrentPlayer(isXNext ? "O" : "X");
    setWinner(calculateWinner(board));
    typeBoard === 1 ? computerMove() : setIsXNext(!isXNext);

    Animated.spring(scaleAnim, {
      toValue: 1.05,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }).start();
    });
  };

  const computerMove = () => {
    const newboard = board.slice();
    let availableMoves = newboard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (availableMoves.length > 0) {
      let move = findBestMove(newboard);
      newboard[move] = "O";
      setIsXNext(true);
      setWinner(calculateWinner(newboard));
      setBoard(newboard);
    }
  };

  const findBestMove = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] === "O" && board[b] === "O" && board[c] === null) return c;
      if (board[a] === "O" && board[b] === null && board[c] === "O") return b;
      if (board[a] === null && board[b] === "O" && board[c] === "O") return a;
    }

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] === "X" && board[b] === "X" && board[c] === null) return c;
      if (board[a] === "X" && board[b] === null && board[c] === "X") return b;
      if (board[a] === null && board[b] === "X" && board[c] === "X") return a;
    }

    let availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const calculateWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  };

  const renderSquare = (index: number) => {
    const isWinningSquare = winner && isPartOfWinningLine(index);

    return (
      <TouchableOpacity
        style={[
          styles.square,
          isWinningSquare && styles.winningSquare
        ]}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.squareText,
          board[index] === "X" ? styles.xText : styles.oText
        ]}>
          {board[index]}
        </Text>
      </TouchableOpacity>
    );
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(typeBoard === 1 ? true : isXNext);
    setCurrentPlayer("X");
    setCount(0);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={28} color="#78F0BC" />
        </TouchableOpacity>

        <Text style={styles.title}>Tic Tac Toe</Text>

        <View style={styles.gameInfo}>
          <Text style={styles.modeTitle}>Playing Mode</Text>

          <View style={styles.modeSelectorContainer}>
            <TouchableOpacity
              style={[styles.modeButton, typeBoard === 1 && styles.activeModeButton]}
              onPress={() => mode(1)}
            >
              <Text style={[styles.modeButtonText, typeBoard === 1 && styles.activeModeButtonText]}>1 PLAYER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, typeBoard === 2 && styles.activeModeButton]}
              onPress={() => mode(2)}
            >
              <Text style={[styles.modeButtonText, typeBoard === 2 && styles.activeModeButtonText]}>2 PLAYERS</Text>
            </TouchableOpacity>
          </View>

          {!winner && count < (typeBoard === 1 ? 5 : 9) && (
            <View style={styles.turnIndicator}>
              <Text style={styles.turnText}>
                {typeBoard === 1 && currentPlayer === "O" ? "Computer thinking..." : `Player ${currentPlayer}'s turn`}
              </Text>
            </View>
          )}
        </View>

        <Animated.View style={[
          styles.boardContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={styles.board}>
            <View style={styles.boardRow}>
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </View>
            <View style={styles.boardRow}>
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </View>
            <View style={styles.boardRow}>
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </View>
          </View>
        </Animated.View>

        {winner && (
          <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
            <Text style={styles.winnerText}>Winner: Player {winner}</Text>
          </Animated.View>
        )}

        {((typeBoard === 2 && count === 9 && winner === null) ||
          (typeBoard === 1 && count === 5 && winner === null)) && (
            <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
              <Text style={styles.drawText}>It's a Draw!</Text>
            </Animated.View>
          )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.resetButtonText}>Reset Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  gameInfo: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  modeButton: {
    backgroundColor: "rgba(120, 240, 188, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: 150,
    borderWidth: 1,
    borderColor: "#78F0BC",
  },
  activeModeButton: {
    backgroundColor: "rgba(120, 240, 188, 0.3)",
  },
  modeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78F0BC",
    textAlign: "center",
  },
  activeModeButtonText: {
    color: "#fff",
  },
  turnIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  turnText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  boardContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  board: {
    width: (Math.min(Dimensions.get("window").width - 60, Dimensions.get("window").height - 420)),
    height: (Math.min(Dimensions.get("window").width - 60, Dimensions.get("window").height - 420)),
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  boardRow: {
    flexDirection: "row",
    flex: 1,
  },
  square: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    backgroundColor: "rgba(120, 240, 188, 0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(120, 240, 188, 0.3)",
  },
  winningSquare: {
    backgroundColor: "rgba(120, 240, 188, 0.3)",
    borderColor: "#78F0BC",
  },
  squareText: {
    fontSize: ((Math.min(Dimensions.get("window").width - 60, Dimensions.get("window").height - 420)) / 3) - 50,
    fontWeight: "bold",
  },
  xText: {
    color: "#78F0BC",
  },
  oText: {
    color: "#FF9AA2",
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    color: "#78F0BC",
    fontWeight: "bold",
    textAlign: "center",
  },
  drawText: {
    fontSize: 24,
    color: "#78F0BC",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 30,
  },
  resetButton: {
    backgroundColor: "rgba(120, 240, 188, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#78F0BC",
  },
  resetButtonText: {
    color: "#78F0BC",
    fontSize: 18,
    fontWeight: "bold",
  },
});
