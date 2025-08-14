"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ScrollView, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

// Local theme object to replace ThemeContext
const theme = {
  background: ["#1A1A1A", "#2A2A2A"] as const,
  cardBackground: ["#333333", "#444444"] as const,
  accent: "#10b981",
  text: "white",
  textSecondary: "rgba(255,255,255,0.7)",
  border: "#555555",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",
  isDark: true
}

// Type definitions
interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

interface GameState {
  board: Cell[][]
  gameOver: boolean
  gameWon: boolean
  mines: number
  flags: number
  revealed: number
  startTime: number | null
  endTime: number | null
  difficulty: "Easy" | "Medium" | "Hard"
}

interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
}

const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  Easy: { rows: 8, cols: 8, mines: 10 },
  Medium: { rows: 12, cols: 12, mines: 30 },
  Hard: { rows: 16, cols: 16, mines: 60 },
}

const COLORS = {
  1: "#2196F3",
  2: "#4CAF50",
  3: "#FF9800",
  4: "#F44336",
  5: "#9C27B0",
  6: "#00BCD4",
  7: "#795548",
  8: "#607D8B",
}

export default function MineSweeperGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    gameOver: false,
    gameWon: false,
    mines: 10,
    flags: 0,
    revealed: 0,
    startTime: null,
    endTime: null,
    difficulty: "Easy",
  })

  // Initialize board
  const initializeBoard = useCallback((rows: number, cols: number, mines: number) => {
    const board: Cell[][] = []

    // Create empty board
    for (let r = 0; r < rows; r++) {
      board[r] = []
      for (let c = 0; c < cols; c++) {
        board[r][c] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }
      }
    }

    // Place mines randomly
    let minesPlaced = 0
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows)
      const c = Math.floor(Math.random() * cols)
      if (!board[r][c].isMine) {
        board[r][c].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                count++
              }
            }
          }
          board[r][c].neighborMines = count
        }
      }
    }

    return board
  }, [])

  // Reveal cell
  const revealCell = useCallback((board: Cell[][], r: number, c: number) => {
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return
    if (board[r][c].isRevealed || board[r][c].isFlagged) return

    board[r][c].isRevealed = true

    if (board[r][c].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(board, r + dr, c + dc)
        }
      }
    }
  }, [])

  // Start new game
  const startNewGame = useCallback(
    (difficulty: "Easy" | "Medium" | "Hard" = "Easy") => {
      const config = DIFFICULTY_CONFIGS[difficulty]
      const board = initializeBoard(config.rows, config.cols, config.mines)

      setGameState({
        board,
        gameOver: false,
        gameWon: false,
        mines: config.mines,
        flags: 0,
        revealed: 0,
        startTime: Date.now(),
        endTime: null,
        difficulty,
      })
    },
    [initializeBoard],
  )

  // Handle cell press
  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.gameWon) return

      const newBoard = gameState.board.map((row) => row.map((cell) => ({ ...cell })))
      const cell = newBoard[row][col]

      if (cell.isFlagged) return

      if (cell.isMine) {
        // Game over - reveal all mines
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard[0].length; c++) {
            if (newBoard[r][c].isMine) {
              newBoard[r][c].isRevealed = true
            }
          }
        }

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          gameOver: true,
          endTime: Date.now(),
        }))

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        Alert.alert("Game Over!", "You hit a mine!", [
          { text: "New Game", onPress: () => startNewGame(gameState.difficulty) },
        ])
      } else {
        // Reveal cell
        revealCell(newBoard, row, col)

        // Count revealed cells
        let revealedCount = 0
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard[0].length; c++) {
            if (newBoard[r][c].isRevealed) revealedCount++
          }
        }

        const totalCells = newBoard.length * newBoard[0].length
        const gameWon = revealedCount === totalCells - gameState.mines

        if (gameWon) {
          setGameState((prev) => ({
            ...prev,
            board: newBoard,
            gameWon: true,
            endTime: Date.now(),
          }))

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          Alert.alert("Congratulations!", "You won!", [
            { text: "New Game", onPress: () => startNewGame(gameState.difficulty) },
          ])
        } else {
          setGameState((prev) => ({
            ...prev,
            board: newBoard,
            revealed: revealedCount,
          }))
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    },
    [gameState, revealCell, startNewGame],
  )

  // Handle flag placement
  const handleFlagPress = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.gameWon) return

      const newBoard = gameState.board.map((row) => row.map((cell) => ({ ...cell })))
      const cell = newBoard[row][col]

      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged
        const newFlags = gameState.flags + (cell.isFlagged ? 1 : -1)

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          flags: newFlags,
        }))

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }
    },
    [gameState],
  )

  // Get game time
  const getGameTime = useCallback(() => {
    if (!gameState.startTime) return 0
    const endTime = gameState.endTime || Date.now()
    return Math.floor((endTime - gameState.startTime) / 1000)
  }, [gameState.startTime, gameState.endTime])

  // Initialize game on mount
  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  // Render cell
  const renderCell = (row: number, col: number) => {
    const cell = gameState.board[row][col]
    const cellSize = Math.min((Dimensions.get("window").width - 40) / gameState.board[0].length, 40)

    let cellStyle: {
      width: number
      height: number
      backgroundColor: string
      borderRadius: number
      alignItems: "center"
      justifyContent: "center"
      borderWidth: number
      borderColor: string
    } = {
      width: cellSize,
      height: cellSize,
      backgroundColor: "#e0e0e0",
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#333333", // Hardcoded border color
    }

    if (cell.isRevealed) {
      if (cell.isMine) {
        cellStyle = { ...cellStyle, backgroundColor: "#FF6B6B" } // Hardcoded mine color
      } else if (cell.neighborMines > 0) {
        cellStyle = { ...cellStyle, backgroundColor: "#4CAF50" } // Hardcoded neighbor mine color
      } else {
        cellStyle = { ...cellStyle, backgroundColor: "#E0E0E0" } // Hardcoded empty cell color
      }
    } else if (cell.isFlagged) {
      cellStyle = { ...cellStyle, backgroundColor: "#FFD700" } // Hardcoded flag color
    }

    let cellContent = null
    if (cell.isRevealed) {
      if (cell.isMine) {
        cellContent = <Text style={styles.mineText}>💣</Text>
      } else if (cell.neighborMines > 0) {
        cellContent = (
          <Text style={[styles.numberText, { color: COLORS[cell.neighborMines as keyof typeof COLORS] || "#333333" }]}>
            {cell.neighborMines}
          </Text>
        )
      }
    } else if (cell.isFlagged) {
      cellContent = <Text style={styles.flagText}>🚩</Text>
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={cellStyle}
        onPress={() => handleCellPress(row, col)}
        onLongPress={() => handleFlagPress(row, col)}
        activeOpacity={0.7}
      >
        {cellContent}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1A1A1A", "#2A2A2A"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>MineSweeper</Text>
            <Text style={[styles.subtitle, { color: "#B0B0B0" }]}>Brain Training Game</Text>
          </View>

          {/* Game Info */}
          <View style={[styles.gameInfo, { backgroundColor: "#333333" }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: "#B0B0B0" }]}>Mines</Text>
                <Text style={[styles.infoValue, { color: "#FFFFFF" }]}>{gameState.mines - gameState.flags}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: "#B0B0B0" }]}>Time</Text>
                <Text style={[styles.infoValue, { color: "#FFFFFF" }]}>{getGameTime()}s</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: "#B0B0B0" }]}>Difficulty</Text>
                <Text style={[styles.infoValue, { color: "#FFFFFF" }]}>{gameState.difficulty}</Text>
              </View>
            </View>
          </View>

          {/* Game Board */}
          <View style={styles.boardContainer}>
            {gameState.board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
              </View>
            ))}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#333333", borderColor: "#555555" }]}
              onPress={() => startNewGame(gameState.difficulty)}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>New Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#333333", borderColor: "#555555" }]}
              onPress={() => {
                const difficulties: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"]
                const currentIndex = difficulties.indexOf(gameState.difficulty)
                const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length]
                startNewGame(nextDifficulty)
              }}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Change Difficulty</Text>
            </TouchableOpacity>
          </View>

          {/* Game Status */}
          {(gameState.gameOver || gameState.gameWon) && (
            <View style={styles.gameStatus}>
              <Text style={[styles.statusText, { color: gameState.gameWon ? "#4CAF50" : "#FF6B6B" }]}>
                {gameState.gameWon ? "🎉 You Won! 🎉" : "💥 Game Over! 💥"}
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  gameInfo: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  boardContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  gameStatus: {
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  mineText: {
    fontSize: 20,
  },
  flagText: {
    fontSize: 20,
  },
  numberText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})
