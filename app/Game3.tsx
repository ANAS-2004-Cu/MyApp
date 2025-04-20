import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Game3() {
    const router = useRouter();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameStatus, setGameStatus] = useState("Player X's turn");
    const [xPositions, setXPositions] = useState<number[]>([]);
    const [oPositions, setOPositions] = useState<number[]>([]);

    const handleSquarePress = (index: number) => {
        // If square is already occupied or game is over, do nothing
        if (board[index] || gameStatus.includes("wins")) {
            return;
        }

        const newBoard = [...board];
        const currentPlayer = isXNext ? "X" : "O";
        const currentPositions = isXNext ? [...xPositions] : [...oPositions];

        // If player already has 3 markers, remove the oldest one
        if (currentPositions.length === 3) {
            const oldestPosition = currentPositions.shift(); // Remove and get the oldest position
            newBoard[oldestPosition!] = null; // Clear that position on the board
        }

        // Add new position to the player's positions array
        currentPositions.push(index);

        // Update the board with the new marker
        newBoard[index] = currentPlayer;

        // Update state
        setBoard(newBoard);
        if (isXNext) {
            setXPositions(currentPositions);
        } else {
            setOPositions(currentPositions);
        }

        // Check for winner
        const winner = calculateWinner(newBoard);
        if (winner) {
            setGameStatus(`Player ${winner} wins!`);
        } else {
            // Switch turns
            setIsXNext(!isXNext);
            setGameStatus(`Player ${!isXNext ? "X" : "O"}'s turn`);
        }
    };

    const calculateWinner = (squares: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const [a, b, c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameStatus("Player X's turn");
        setXPositions([]);
        setOPositions([]);
    };

    const renderSquare = (index: number) => {
        const value = board[index];

        return (
            <TouchableOpacity
                style={styles.square}
                onPress={() => handleSquarePress(index)}
                activeOpacity={0.7}
            >
                {value === "X" && (
                    <Text style={styles.xMarker}>X</Text>
                )}
                {value === "O" && (
                    <Text style={styles.oMarker}>O</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={require("../assets/images/background.jpg")}
            style={styles.background}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={28} color="#78F0BC" />
                </TouchableOpacity>

                <Text style={styles.title}>Three Marker Tic-Tac-Toe</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Each player can only have 3 markers on the board</Text>
                    <Text style={styles.infoText}>Placing a 4th marker removes your oldest one</Text>
                </View>

                <Text style={styles.gameStatus}>{gameStatus}</Text>

                <View style={styles.board}>
                    <View style={styles.row}>
                        {renderSquare(0)}
                        {renderSquare(1)}
                        {renderSquare(2)}
                    </View>
                    <View style={styles.row}>
                        {renderSquare(3)}
                        {renderSquare(4)}
                        {renderSquare(5)}
                    </View>
                    <View style={styles.row}>
                        {renderSquare(6)}
                        {renderSquare(7)}
                        {renderSquare(8)}
                    </View>
                </View>

                <View style={styles.markerCount}>
                    <Text style={styles.markerCountText}>
                        X markers: {xPositions.length}/3
                    </Text>
                    <Text style={styles.markerCountText}>
                        O markers: {oPositions.length}/3
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetGame}
                >
                    <Text style={styles.resetButtonText}>Reset Game</Text>
                </TouchableOpacity>
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
        marginBottom: 10,
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    infoContainer: {
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
    },
    infoText: {
        color: "#78F0BC",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 5,
    },
    gameStatus: {
        fontSize: 20,
        color: "#fff",
        marginBottom: 20,
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 10,
        overflow: "hidden",
        textAlign: "center",
        minWidth: 200,
    },
    board: {
        width: 300,
        height: 300,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        flex: 1,
    },
    square: {
        flex: 1,
        margin: 5,
        backgroundColor: "rgba(120, 240, 188, 0.1)",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(120, 240, 188, 0.3)",
    },
    xMarker: {
        fontSize: 50,
        fontWeight: "bold",
        color: "#78F0BC",
    },
    oMarker: {
        fontSize: 50,
        fontWeight: "bold",
        color: "#FF9AA2",
    },
    markerCount: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 20,
    },
    markerCountText: {
        fontSize: 16,
        color: "#fff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 10,
        borderRadius: 10,
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
