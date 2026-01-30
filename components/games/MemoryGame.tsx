"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Theme } from "../../constants/Theme"
import { Brain, RotateCcw, ChevronLeft, Heart, Trophy, Zap } from "lucide-react-native"

const { width } = Dimensions.get("window")

const getFlashTime = (round: number) => {
  return Math.max(600 - (round - 1) * 20, 250)
}

type Difficulty = "easy" | "medium" | "hard" | null
type GameStatus = "idle" | "playing" | "success" | "fail"

function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>(null)
  const [gridSize, setGridSize] = useState(3)
  const [sequence, setSequence] = useState<{ row: number; col: number }[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [activeTile, setActiveTile] = useState<string | null>(null)
  const [selectedTiles, setSelectedTiles] = useState<string[]>([])
  const [status, setStatus] = useState<GameStatus>("idle")
  const [round, setRound] = useState(1)
  const [lives, setLives] = useState(3)
  const [highScore, setHighScore] = useState(0)

  const shakeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const tileAnimations = useRef<{ [key: string]: Animated.Value }>({}).current

  const maxRounds = difficulty === "medium" ? 40 : difficulty === "hard" ? 50 : 20
  const tileSize = (width - 60) / gridSize - 8

  const keyFromCoord = (r: number, c: number) => `${r}-${c}`

  const getRandomCoord = (): { row: number; col: number } => ({
    row: Math.floor(Math.random() * gridSize),
    col: Math.floor(Math.random() * gridSize),
  })

  const resetGame = async (size: number = gridSize) => {
    const first = getRandomCoord()
    setSequence([first])
    setStatus("idle")
    setRound(1)
    setLives(3)
    setSelectedTiles([])
    setCurrentStep(0)
    setGridSize(size)

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const key = keyFromCoord(r, c)
        if (!tileAnimations[key]) tileAnimations[key] = new Animated.Value(1)
      }
    }

    const savedScore = await AsyncStorage.getItem("memoryGameHighScore")
    if (savedScore) setHighScore(Number(savedScore))

    setTimeout(() => flashSequence([first]), 600)
  }

  const flashSequence = async (seq: { row: number; col: number }[]) => {
    setFlashing(true)
    setStatus("idle")
    for (let i = 0; i < seq.length; i++) {
      const { row, col } = seq[i]
      setActiveTile(keyFromCoord(row, col))
      await new Promise(res => setTimeout(res, getFlashTime(round)))
      setActiveTile(null)
      await new Promise(res => setTimeout(res, 200))
    }
    setFlashing(false)
    setStatus("playing")
  }

  const handleTilePress = async (row: number, col: number) => {
    if (flashing || status !== "playing") return
    const key = keyFromCoord(row, col)
    const correct = sequence[currentStep]

    if (correct.row === row && correct.col === col) {
      Animated.sequence([
        Animated.timing(tileAnimations[key], { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(tileAnimations[key], { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start()

      const newSelected = [...selectedTiles, key]
      setSelectedTiles(newSelected)

      if (currentStep + 1 === sequence.length) {
        if (sequence.length >= maxRounds) {
          setStatus("success")
          if (sequence.length > highScore) await AsyncStorage.setItem("memoryGameHighScore", sequence.length.toString())
          return
        }
        const next = [...sequence, getRandomCoord()]
        setRound(r => r + 1)
        setSelectedTiles([])
        setCurrentStep(0)
        setSequence(next)
        setTimeout(() => flashSequence(next), 800)
      } else {
        setCurrentStep(s => s + 1)
      }
    } else {
      triggerShake()
      if (lives > 1) {
        setLives(l => l - 1)
        setSelectedTiles([])
        setCurrentStep(0)
        setTimeout(() => flashSequence(sequence), 800)
      } else {
        setStatus("fail")
        if (sequence.length > highScore) await AsyncStorage.setItem("memoryGameHighScore", sequence.length.toString())
      }
    }
  }

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  if (!difficulty) {
    return (
      <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
        <View style={styles.menu}>
          <Brain size={80} color={Theme.colors.primary} />
          <Text style={styles.menuTitle}>Memory Tiles</Text>
          <Text style={styles.menuSubtitle}>Follow the pattern if you can...</Text>
          <View style={styles.diffList}>
            {[
              { id: 'easy', l: 'EASY', s: 3, c: Theme.colors.success },
              { id: 'medium', l: 'MEDIUM', s: 4, c: Theme.colors.warning },
              { id: 'hard', l: 'HARD', s: 5, c: Theme.colors.error }
            ].map(d => (
              <TouchableOpacity key={d.id} style={[styles.diffCard, { borderColor: d.c }]} onPress={() => { setDifficulty(d.id as any); resetGame(d.s); }}>
                <Text style={[styles.diffLabel, { color: d.c }]}>{d.l}</Text>
                <Text style={styles.diffInfo}>{d.s}x{d.s} Grid</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.gameSafe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => setDifficulty(null)} style={styles.iconBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.statGroup}>
            <Heart size={18} color={Theme.colors.error} fill={Theme.colors.error} />
            <Text style={styles.statText}>{lives}</Text>
          </View>
          <View style={styles.statGroup}>
            <Zap size={18} color={Theme.colors.warning} />
            <Text style={styles.statText}>{round}/{maxRounds}</Text>
          </View>
          <View style={styles.statGroup}>
            <Trophy size={18} color={Theme.colors.accent} />
            <Text style={styles.statText}>{highScore}</Text>
          </View>
        </View>

        <Animated.View style={[styles.gridArea, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.grid}>
            {Array.from({ length: gridSize }).map((_, r) => (
              <View key={r} style={styles.row}>
                {Array.from({ length: gridSize }).map((_, c) => {
                  const key = keyFromCoord(r, c)
                  return (
                    <Animated.View key={key} style={{ transform: [{ scale: tileAnimations[key] || 1 }] }}>
                      <TouchableOpacity
                        onPress={() => handleTilePress(r, c)}
                        disabled={flashing || status !== 'playing'}
                        style={[
                          styles.tile,
                          { width: tileSize, height: tileSize },
                          activeTile === key && styles.tileActive,
                          selectedTiles.includes(key) && styles.tileSelected,
                        ]}
                      />
                    </Animated.View>
                  )
                })}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          {status === 'success' ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>MASTERMIND!</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => resetGame()}><RotateCcw size={20} color="#fff" /><Text style={styles.retryText}>AGAIN</Text></TouchableOpacity>
            </View>
          ) : status === 'fail' ? (
            <View style={styles.resultBox}>
              <Text style={[styles.resultTitle, { color: Theme.colors.error }]}>MEMORY FULL</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => resetGame()}><RotateCcw size={20} color="#fff" /><Text style={styles.retryText}>RETRY</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{flashing ? "WATCH CLOSELY..." : "YOUR TURN!"}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${(currentStep / sequence.length) * 100}%` }]} />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameSafe: { flex: 1, padding: 20 },
  menu: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  menuTitle: { fontSize: 48, fontWeight: '900', color: '#fff', marginTop: 20 },
  menuSubtitle: { fontSize: 18, color: Theme.colors.textMuted, marginBottom: 50 },
  diffList: { width: '100%', gap: 15 },
  diffCard: { backgroundColor: Theme.colors.card, padding: 20, borderRadius: 24, borderWidth: 2, alignItems: 'center' },
  diffLabel: { fontSize: 24, fontWeight: '900' },
  diffInfo: { color: Theme.colors.textMuted, marginTop: 5 },

  gameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  statGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.card, padding: 8, borderRadius: 12 },
  statText: { color: '#fff', fontWeight: 'bold' },

  gridArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  tile: { backgroundColor: Theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tileActive: { backgroundColor: Theme.colors.primary, borderColor: '#fff' },
  tileSelected: { backgroundColor: 'rgba(99, 102, 241, 0.4)', borderColor: Theme.colors.primary },

  footer: { height: 150, justifyContent: 'center' },
  hintContainer: { alignItems: 'center' },
  hintText: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary, marginBottom: 20 },
  progressTrack: { width: '80%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Theme.colors.primary },

  resultBox: { alignItems: 'center', gap: 20 },
  resultTitle: { fontSize: 32, fontWeight: '900', color: Theme.colors.success },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Theme.colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  retryText: { color: '#fff', fontWeight: 'bold' },
})

export default MemoryGame
