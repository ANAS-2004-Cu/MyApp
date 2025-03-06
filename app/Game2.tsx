import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

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

  const mode = (type: number) => {
    if (typeBoard === type) { return; }
    else {
      if (type === 1) {
        setBoard2(board.slice());
        setBoard(board1.slice());
        setWinner2(winner);
        setWinner(winner1);
        setIsXNext1(isXNext);
        setIsXNext(true);
      }
      if (type === 2) {
        setBoard1(board.slice());
        setBoard(board2.slice());
        setWinner1(winner);
        setWinner(winner2);
        setIsXNext(isXNext1);
      }
    }
    setTypeBoard(type);
  }

  const handlePress = (index: number) => {
    if (board[index] || winner) {
      if (winner) { return alert(`Game Over ✨ ${winner} ✨ Is 🎊 WINNER 🎉`); }
      return;
    }
    board[index] = isXNext ? "X" : "O";
    setWinner(calculateWinner(board));
    typeBoard === 1 ? computerMove() : setIsXNext(!isXNext);
  };

  const computerMove = () => {
    const newboard = board.slice();

    let availableMoves = newboard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (availableMoves.length > 0) {
      let move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      newboard[move] = "O";
      setIsXNext(true);
      setWinner(calculateWinner(newboard));
      setBoard(newboard);
    }
  };

  const calculateWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const renderSquare = (index: number) => (
    <TouchableOpacity style={styles.square} onPress={() => handlePress(index)} activeOpacity={1}>
      <Text style={styles.squareText}>{board[index]}</Text>
    </TouchableOpacity>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(typeBoard === 1 ? true : isXNext);
  };
  const router = useRouter();


  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Tic Tac Toe_V1</Text>
        <Text style={{ fontSize: 27, fontWeight: "bold", color: "lightblue", marginBottom: 15 }}>Playing Mode</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 50 }}>

          <TouchableOpacity style={typeBoard === 1 ? styles.hold : styles.player} onPress={() => mode(1)}>
            <Text style={styles.playertext}>1 PLAYER</Text>
          </TouchableOpacity>

          <TouchableOpacity style={typeBoard === 2 ? styles.hold : styles.player} onPress={() => mode(2)}>
            <Text style={styles.playertext}>2 PLAYER</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.boards}>


          <View style={{ flexDirection: "row" }}>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </View>
          <View style={{ flexDirection: "row" }}>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </View>
          <View style={{ flexDirection: "row" }}>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </View>


        </View>

        {winner && <Text style={styles.winnerText}>Winner Is: {winner}</Text>}
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.home} onPress={() => router.push("/")}>
          <Text style={styles.resetButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hold: {
    backgroundColor: "lightblue",
    padding: 10,
    width: 150,
    borderRadius: 20,
    opacity: 0.5
  },
  player: {
    backgroundColor: "lightblue",
    padding: 10,
    width: 150,
    borderRadius: 20,
  },
  playertext: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  background: {
    width: '100%',
    height: '100%',
  },
  header: {
    fontSize: 30,
    color: "gold",
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: 0,
    width: "100%",
    height: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    textAlignVertical: "center",
    alignContent: "center",
  },
  boards: {
    width: (Math.min(Dimensions.get("window").width - 45, Dimensions.get("window").height - 400)),
    height: (Math.min(Dimensions.get("window").width - 45, Dimensions.get("window").height - 400)),
    borderRadius: 30,
    overflow: "hidden",
    borderColor: "darkred",
    borderWidth: 4,
  },
  square: {
    width: (Math.min(Dimensions.get("window").width - 45, Dimensions.get("window").height - 400)) / 3,
    height: (Math.min(Dimensions.get("window").width - 45, Dimensions.get("window").height - 400)) / 3,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderColor: "black",
  },
  squareText: {
    fontSize: ((Math.min(Dimensions.get("window").width - 45, Dimensions.get("window").height - 400)) / 3) - 45,
    color: "blue",
    fontWeight: "bold",

  },
  winnerText: {
    fontSize: 30,
    color: "gold",
    marginTop: 10,
    fontWeight: "900",
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "cyan",
    borderRadius: 20,
    width: 150,
  },
  resetButtonText: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
    fontWeight: "bold"
  },
  home: {
    position: "absolute",
    bottom: 30,
    padding: 10,
    backgroundColor: "cyan",
    borderRadius: 20,
    width: 150,
  },
});
