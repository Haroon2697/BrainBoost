"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ScrollView, SafeAreaView, Vibration } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Theme } from "../../constants/Theme"
import { Flag, Bomb, RotateCcw, ChevronLeft, Timer, Target } from "lucide-react-native"

const { width } = Dimensions.get("window")

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const DIFFICULTY_CONFIGS = {
  Easy: { rows: 8, cols: 8, mines: 10 },
  Medium: { rows: 12, cols: 9, mines: 25 },
  Hard: { rows: 15, cols: 10, mines: 45 },
}

const MineSweeperGame = () => {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_CONFIGS>("Easy")
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [minesLeft, setMinesLeft] = useState(0)
  const [time, setTime] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const initBoard = useCallback(() => {
    const { rows, cols, mines } = DIFFICULTY_CONFIGS[difficulty]
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

  useEffect(() => { initBoard() }, [initBoard])

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

    const { rows, cols, mines } = DIFFICULTY_CONFIGS[difficulty]
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

  const renderCell = (r: number, c: number) => {
    const cell = board[r][c]
    return (
      <TouchableOpacity
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
      </TouchableOpacity>
    )
  }

  const getNumberColor = (num: number) => {
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#71717a']
    return colors[num - 1] || '#fff'
  }

  return (
    <LinearGradient colors={Theme.colors.gradients.background as any} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { }} style={styles.iconBtn}><ChevronLeft size={24} color="#fff" /></TouchableOpacity>
          <View style={styles.statGroup}>
            <Target size={18} color={Theme.colors.secondary} />
            <Text style={styles.statText}>{minesLeft}</Text>
          </View>
          <View style={styles.statGroup}>
            <Timer size={18} color={Theme.colors.accent} />
            <Text style={styles.statText}>{time}s</Text>
          </View>
          <TouchableOpacity onPress={initBoard} style={styles.iconBtn}><RotateCcw size={24} color="#fff" /></TouchableOpacity>
        </View>

        <View style={styles.difficultyBar}>
          {(['Easy', 'Medium', 'Hard'] as const).map(d => (
            <TouchableOpacity key={d} onPress={() => setDifficulty(d)} style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}>
              <Text style={[styles.diffText, difficulty === d && styles.diffTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.boardScroll} horizontal={false}>
          <ScrollView horizontal>
            <View style={styles.board}>
              {board.map((row, r) => (
                <View key={r} style={styles.row}>
                  {row.map((_, c) => renderCell(r, c))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        {(gameOver || gameWon) && (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>
              <Text style={[styles.resultTitle, { color: gameWon ? Theme.colors.success : Theme.colors.error }]}>
                {gameWon ? "AREA CLEARED!" : "MISSION FAILED"}
              </Text>
              <Text style={styles.resultStats}>Time taken: {time}s</Text>
              <TouchableOpacity style={styles.mainBtn} onPress={initBoard}>
                <RotateCcw size={20} color="#fff" />
                <Text style={styles.mainBtnText}>TRY AGAIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 12 },
  statGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.card, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15 },
  statText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  difficultyBar: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  diffBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  diffBtnActive: { backgroundColor: Theme.colors.primary, borderColor: 'transparent' },
  diffText: { color: Theme.colors.textMuted, fontWeight: 'bold' },
  diffTextActive: { color: '#fff' },

  boardScroll: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  board: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row' },
  cell: { width: 32, height: 32, backgroundColor: Theme.colors.card, margin: 1, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cellRevealed: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.02)' },
  cellMine: { backgroundColor: Theme.colors.error },
  cellText: { fontSize: 16, fontWeight: 'bold' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  resultCard: { backgroundColor: Theme.colors.card, padding: 40, borderRadius: 32, alignItems: 'center', width: '80%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resultTitle: { fontSize: 24, fontWeight: '900', marginBottom: 10 },
  resultStats: { color: Theme.colors.textMuted, marginBottom: 30 },
  mainBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Theme.colors.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15 },
  mainBtnText: { color: '#fff', fontWeight: 'bold' },
})

export default MineSweeperGame
