import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { Link } from "expo-router";

const initialBoard = Array(9).fill(null);
const moveLimit = 3;

export default function Game4() {
  const [board, setBoard] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [xMoves, setXMoves] = useState(0);
  const [oMoves, setOMoves] = useState(0);

  const handlePress = (index: number) => {
    if (board[index]) return;

    const newBoard = board.slice();
    if (isXNext && xMoves < moveLimit) {
      newBoard[index] = "X";
      setXMoves(xMoves + 1);
    } else if (!isXNext && oMoves < moveLimit) {
      newBoard[index] = "O";
      setOMoves(oMoves + 1);
    } else {
      return;
    }

    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const renderSquare = (index: number) => (
    <TouchableOpacity key={index} style={styles.square} onPress={() => handlePress(index)}>
      <Text style={styles.squareText}>{board[index]}</Text>
    </TouchableOpacity>
  );

  const resetGame = () => {
    setBoard(initialBoard);
    setIsXNext(true);
    setXMoves(0);
    setOMoves(0);
  };

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.text}>Tic-Tac-Toe</Text>
        <View style={styles.board}>
          {Array(9)
            .fill(null)
            .map((_, index) => renderSquare(index))}
        </View>
        <Text style={styles.status}>Next player: {isXNext ? "X" : "O"}</Text>
        <Text style={styles.status}>X moves left: {moveLimit - xMoves}</Text>
        <Text style={styles.status}>O moves left: {moveLimit - oMoves}</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </TouchableOpacity>
        <Link href="/" style={styles.link}>Go Back Home</Link>
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
  background: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 30,
    color: "gold",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  square: {
    width: "33.33%",
    height: "33.33%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  squareText: {
    fontSize: 40,
    color: "white",
  },
  status: {
    fontSize: 20,
    color: "cyan",
    marginTop: 20,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "cyan",
    borderRadius: 5,
  },
  resetButtonText: {
    fontSize: 20,
    color: "black",
  },
  link: {
    fontSize: 20,
    color: "cyan",
    marginTop: 20,
  },
});
