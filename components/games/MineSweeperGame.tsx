"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable, Vibration } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Theme } from "../../constants/Theme"
import { Flag, Bomb, RotateCcw, ChevronLeft, Timer, Target, Zap, Home, Trophy } from "lucide-react-native"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const DIFFICULTY_CONFIGS = {
  Easy: { rows: 8, cols: 8, mines: 10, label: 'Novice' },
  Medium: { rows: 12, cols: 9, mines: 25, label: 'Expert' },
  Hard: { rows: 15, cols: 10, mines: 45, label: 'Master' },
}

const MineSweeperGame = () => {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_CONFIGS | null>(null)
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [minesLeft, setMinesLeft] = useState(0)
  const [time, setTime] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const initBoard = useCallback((diffKey?: keyof typeof DIFFICULTY_CONFIGS) => {
    const activeDiff = diffKey || difficulty || 'Easy'
    const { rows, cols, mines } = DIFFICULTY_CONFIGS[activeDiff]
    let newBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    )

    let minesPlaced = 0
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows)
      const c = Math.floor(Math.random() * cols)
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true
        minesPlaced++
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < rows && c + j >= 0 && c + j < cols) {
                if (newBoard[r + i][c + j].isMine) count++
              }
            }
          }
          newBoard[r][c].neighborMines = count
        }
      }
    }

    setBoard(newBoard)
    setGameOver(false)
    setGameWon(false)
    setMinesLeft(mines)
    setTime(0)
    setIsActive(false)
  }, [difficulty])

  useEffect(() => {
    let interval: any
    if (isActive && !gameOver && !gameWon) {
      interval = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, gameOver, gameWon])

  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon || board[r][c].isRevealed || board[r][c].isFlagged) return
    if (!isActive) setIsActive(true)

    const newBoard = [...board.map(row => [...row])]

    if (newBoard[r][c].isMine) {
      setGameOver(true)
      Vibration.vibrate(500)
      return
    }

    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= newBoard.length || col < 0 || col >= newBoard[0].length || newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) return
      newBoard[row][col].isRevealed = true
      if (newBoard[row][col].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            floodFill(row + i, col + j)
          }
        }
      }
    }

    floodFill(r, c)
    setBoard(newBoard)

    const { rows, cols, mines } = DIFFICULTY_CONFIGS[difficulty || 'Easy']
    const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length
    if (revealedCount === rows * cols - mines) {
      setGameWon(true)
      setIsActive(false)
    }
  }

  const toggleFlag = (r: number, c: number) => {
    if (gameOver || gameWon || board[r][c].isRevealed) return
    const newBoard = [...board.map(row => [...row])]
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged
    setBoard(newBoard)
    setMinesLeft(prev => newBoard[r][c].isFlagged ? prev - 1 : prev + 1)
  }

  if (!difficulty) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.content}>
          <View style={styles.iconCircle}>
            <Bomb size={40} color={Theme.colors.primary} />
          </View>
          <Text style={styles.gameTitle}>MineSweeper</Text>
          <Text style={styles.gameDesc}>Clear the minefield without detonating any bombs. Logic and patience are keys to survival.</Text>

          <View style={styles.diffList}>
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <Pressable key={d} onPress={() => { setDifficulty(d); initBoard(d); }}>
                <LinearGradient colors={Theme.colors.gradients.glass} style={styles.diffCard}>
                  <View style={[styles.diffIcon, { backgroundColor: d === 'Easy' ? `${Theme.colors.success}20` : d === 'Medium' ? `${Theme.colors.warning}20` : `${Theme.colors.error}20` }]}>
                    <Zap size={20} color={d === 'Easy' ? Theme.colors.success : d === 'Medium' ? Theme.colors.warning : Theme.colors.error} />
                  </View>
                  <View style={styles.diffInfo}>
                    <Text style={styles.diffLabel}>{DIFFICULTY_CONFIGS[d].label}</Text>
                    <Text style={styles.diffSub}>{DIFFICULTY_CONFIGS[d].rows}x{DIFFICULTY_CONFIGS[d].cols} • {DIFFICULTY_CONFIGS[d].mines} Mines</Text>
                  </View>
                  <ChevronLeft size={20} color={Theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.backToTraining} onPress={() => router.back()}>
            <Text style={styles.backText}>Return to HQ</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.gameSafe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setDifficulty(null)} style={styles.backButton}>
            <Home size={20} color={Theme.colors.textMuted} />
          </Pressable>
          <View style={styles.statList}>
            <View style={styles.statBadge}>
              <Target size={16} color={Theme.colors.secondary} />
              <Text style={styles.statText}>{minesLeft}</Text>
            </View>
            <View style={[styles.statBadge, { borderColor: Theme.colors.accent }]}>
              <Timer size={16} color={Theme.colors.accent} />
              <Text style={styles.statText}>{time}s</Text>
            </View>
          </View>
          <Pressable style={styles.backButton} onPress={() => initBoard()}>
            <RotateCcw size={20} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.boardContainer} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardHorizontal}>
            <View style={styles.board}>
              {board.map((row, r) => (
                <View key={r} style={styles.row}>
                  {row.map((cell, c) => (
                    <Pressable
                      key={`${r}-${c}`}
                      onPress={() => revealCell(r, c)}
                      onLongPress={() => toggleFlag(r, c)}
                      style={[
                        styles.cell,
                        cell.isRevealed && styles.cellRevealed,
                        gameOver && cell.isMine && styles.cellMine,
                      ]}
                    >
                      {cell.isRevealed ? (
                        cell.neighborMines > 0 ? (
                          <Text style={[styles.cellText, { color: getNumberColor(cell.neighborMines) }]}>{cell.neighborMines}</Text>
                        ) : null
                      ) : cell.isFlagged ? (
                        <Flag size={14} color={Theme.colors.secondary} fill={Theme.colors.secondary} />
                      ) : gameOver && cell.isMine ? (
                        <Bomb size={16} color="#fff" />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        {(gameOver || gameWon) && (
          <View style={styles.overlay}>
            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
              <Trophy size={60} color={gameWon ? Theme.colors.success : Theme.colors.error} />
              <Text style={[styles.overTitle, { color: gameWon ? Theme.colors.success : '#fff' }]}>
                {gameWon ? 'AREA SECURED' : 'DETONATED'}
              </Text>
              <View style={styles.resultDetails}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>TIME</Text>
                  <Text style={styles.resultValue}>{time}s</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>DIFF</Text>
                  <Text style={styles.resultValue}>{difficulty}</Text>
                </View>
              </View>

              <View style={styles.overActions}>
                <Pressable style={styles.mainButton} onPress={() => initBoard()}>
                  <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                    <RotateCcw size={18} color="white" />
                    <Text style={styles.buttonText}>Deploy Again</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setDifficulty(null)}>
                  <Text style={styles.secondaryButtonText}>Difficulty Menu</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        )}
      </SafeAreaView>
    </View>
  )
}

const getNumberColor = (num: number) => {
  const colors = ['#6366f1', '#10b981', '#f43f5e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#94a3b8']
  return colors[num - 1] || '#fff'
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  gameDesc: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  diffList: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  diffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  diffIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  diffInfo: {
    flex: 1,
  },
  diffLabel: {
    fontSize: 18,
    color: Theme.colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  diffSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  backToTraining: {
    padding: 16,
  },
  backText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  gameSafe: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statList: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },
  boardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  boardHorizontal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: { flexDirection: 'row' },
  cell: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cellRevealed: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: 'rgba(255,255,255,0.01)',
  },
  cellMine: {
    backgroundColor: Theme.colors.error,
    borderColor: '#fff',
  },
  cellText: { fontSize: 16, fontWeight: '900' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  gameOverCard: {
    width: '100%',
    padding: 32,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: Theme.fonts.primary,
    marginVertical: 20,
    textAlign: 'center',
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '900',
  },
  overActions: {
    width: '100%',
    gap: 12,
  },
  mainButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '700',
  },
})

export default MineSweeperGame
