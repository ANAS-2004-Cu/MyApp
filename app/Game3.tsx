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
    const [showModeSelection, setShowModeSelection] = useState(true);
    const [gameMode, setGameMode] = useState<"2-player" | "vs-computer" | null>(null);
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

    // Computer move effect
    useEffect(() => {
        if (gameMode === "vs-computer" && !isXNext && !gameStatus.includes("wins")) {
            // Add a small delay to make it seem like the computer is "thinking"
            const timeout = setTimeout(() => {
                makeComputerMove();
            }, 700);
            return () => clearTimeout(timeout);
        }
    }, [isXNext, gameMode, gameStatus]);

    // Make a move for a player
    const makeMove = (index: number, currentPlayer: string, currentPositions: number[]) => {
        const newBoard = [...board];

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
        if (currentPlayer === "X") {
            setXPositions([...currentPositions]);
        } else {
            setOPositions([...currentPositions]);
        }

        // Check for winner
        const winner = calculateWinner(newBoard);
        if (winner) {
            if (gameMode === "vs-computer" && winner === "O") {
                setGameStatus("Computer wins!");
            } else {
                setGameStatus(`Player ${winner} wins!`);
            }
        } else {
            // Switch turns
            setIsXNext(currentPlayer === "O");
            if (gameMode === "vs-computer") {
                setGameStatus(currentPlayer === "O" ? "Your turn" : "Computer is thinking...");
            } else {
                setGameStatus(`Player ${currentPlayer === "O" ? "X" : "O"}'s turn`);
            }
        }

        return newBoard;
    };

    const handleSquarePress = (index: number) => {
        // If square is already occupied or game is over, do nothing
        if (board[index] || gameStatus.includes("wins")) {
            return;
        }

        const currentPlayer = isXNext ? "X" : "O";
        const currentPositions = isXNext ? [...xPositions] : [...oPositions];

        // In computer mode, only allow X (player) moves
        if (gameMode === "vs-computer" && !isXNext) {
            return;
        }

        makeMove(index, currentPlayer, currentPositions);
    };

    const makeComputerMove = () => {
        // If game is over, do nothing
        if (gameStatus.includes("wins")) {
            return;
        }

        const newBoard = [...board];
        const computerPositions = [...oPositions];

        // Get best move based on current board state
        const bestMoveIndex = findBestMove(newBoard, xPositions, computerPositions);

        if (bestMoveIndex !== -1) {
            makeMove(bestMoveIndex, "O", computerPositions);
        }
    };

    const findBestMove = (currentBoard: (string | null)[], playerPositions: number[], computerPositions: number[]): number => {
        // Clone the arrays to avoid modifying the originals
        const boardCopy = [...currentBoard];

        // Strategy 1: Win if possible
        const winningMove = findWinningMove(boardCopy, "O", computerPositions);
        if (winningMove !== -1) return winningMove;

        // Strategy 2: Block player from winning
        const blockingMove = findWinningMove(boardCopy, "X", playerPositions);
        if (blockingMove !== -1) return blockingMove;

        // Strategy 3: Take center if available
        if (boardCopy[4] === null) return 4;

        // Strategy 4: Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(pos => boardCopy[pos] === null);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Strategy 5: Take any available spot
        const availableSpots = boardCopy.map((spot, idx) => spot === null ? idx : -1).filter(idx => idx !== -1);
        if (availableSpots.length > 0) {
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
        }

        return -1; // No valid move found (shouldn't happen)
    };

    const findWinningMove = (currentBoard: (string | null)[], marker: string, positions: number[]): number => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        // Check if we can win in one move
        for (const [a, b, c] of lines) {
            // Count markers in this line
            const lineMarkers = [currentBoard[a], currentBoard[b], currentBoard[c]];
            const markerCount = lineMarkers.filter(spot => spot === marker).length;
            const emptyCount = lineMarkers.filter(spot => spot === null).length;

            // If we have 2 markers in a line and there's one empty spot, we can win
            if (markerCount === 2 && emptyCount === 1) {
                // Find the empty position
                if (currentBoard[a] === null) return a;
                if (currentBoard[b] === null) return b;
                if (currentBoard[c] === null) return c;
            }
        }

        return -1; // No winning move found
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
        setGameStatus(gameMode === "vs-computer" ? "Your turn" : "Player X's turn");
        setXPositions([]);
        setOPositions([]);
    };

    const selectGameMode = (mode: "2-player" | "vs-computer") => {
        setGameMode(mode);
        setShowModeSelection(false);
        setGameStatus(mode === "vs-computer" ? "Your turn" : "Player X's turn");
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

    // Mode selection screen
    if (showModeSelection) {
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
                    <Text style={styles.subtitle}>Select Game Mode</Text>

                    <View style={styles.modeSelectionContainer}>
                        <TouchableOpacity
                            style={styles.modeCard}
                            onPress={() => selectGameMode("2-player")}
                        >
                            <View style={styles.modeIconContainer}>
                                <Ionicons name="people" size={40} color="#78F0BC" />
                            </View>
                            <Text style={styles.modeCardTitle}>2 Players</Text>
                            <Text style={styles.modeCardDescription}>
                                Play against a friend on the same device
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modeCard}
                            onPress={() => selectGameMode("vs-computer")}
                        >
                            <View style={styles.modeIconContainer}>
                                <Ionicons name="desktop-outline" size={40} color="#78F0BC" />
                            </View>
                            <Text style={styles.modeCardTitle}>vs Computer</Text>
                            <Text style={styles.modeCardDescription}>
                                Challenge the AI in a strategic battle
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }

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
                <Text style={styles.subtitle}>
                    {gameMode === "vs-computer" ? "vs Computer" : "2 Players"}
                </Text>

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
                        {gameMode === "vs-computer" ? "You" : "Player X"}: {xPositions.length}/3
                    </Text>
                    <Text style={styles.markerCountText}>
                        {gameMode === "vs-computer" ? "Computer" : "Player O"}: {oPositions.length}/3
                    </Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetGame}
                    >
                        <Text style={styles.resetButtonText}>Reset Game</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modeSelectButton}
                        onPress={() => setShowModeSelection(true)}
                    >
                        <Text style={styles.resetButtonText}>Change Mode</Text>
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
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#78F0BC",
        marginBottom: 20,
        textAlign: "center",
    },
    modeSelectionContainer: {
        width: "100%",
        marginTop: 30,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    modeCard: {
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 15,
        padding: 20,
        width: "80%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#78F0BC",
        marginBottom: 15,
    },
    modeIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(120, 240, 188, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    modeCardTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#78F0BC",
        marginBottom: 8,
    },
    modeCardDescription: {
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
    },
    // Keep the existing styles, but remove/comment out conflicting ones
    modeContainer: {
        // width: "100%",
        // marginTop: 20,
        // alignItems: "center",
    },
    modeButton: {
        // backgroundColor: "rgba(120, 240, 188, 0.2)",
        // paddingVertical: 16,
        // paddingHorizontal: 40,
        // borderRadius: 25,
        // borderWidth: 1,
        // borderColor: "#78F0BC",
        // marginVertical: 10,
        // width: "80%",
        // alignItems: "center",
    },
    modeButtonText: {
        // color: "#78F0BC",
        // fontSize: 20,
        // fontWeight: "bold",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    modeSelectButton: {
        backgroundColor: "rgba(120, 240, 188, 0.2)",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#78F0BC",
    },
});
