"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, Pressable, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Theme } from "../../constants/Theme"
import { Brain, RotateCcw, ChevronLeft, Heart, Trophy, Zap, Clock, TrendingUp } from "lucide-react-native"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

const getFlashTime = (round: number) => {
  return Math.max(600 - (round - 1) * 20, 250)
}

type Difficulty = "easy" | "medium" | "hard" | null
type GameStatus = "idle" | "playing" | "success" | "fail"

function MemoryGame() {
  const router = useRouter()
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
  const tileAnimations = useRef<{ [key: string]: Animated.Value }>({}).current

  const maxRounds = difficulty === "medium" ? 40 : difficulty === "hard" ? 50 : 20
  const tileSize = (width - 72) / gridSize - 8

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

    setTimeout(() => flashSequence([first]), 800)
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
        Animated.timing(tileAnimations[key], { toValue: 1.15, duration: 100, useNativeDriver: true }),
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
        setTimeout(() => flashSequence(next), 1000)
      } else {
        setCurrentStep(s => s + 1)
      }
    } else {
      triggerShake()
      if (lives > 1) {
        setLives(l => l - 1)
        setSelectedTiles([])
        setCurrentStep(0)
        setTimeout(() => flashSequence(sequence), 1000)
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
      <View style={styles.container}>
        <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.content}>
          <View style={styles.iconCircle}>
            <Brain size={40} color={Theme.colors.primary} />
          </View>
          <Text style={styles.gameTitle}>Memory Tiles</Text>
          <Text style={styles.gameDesc}>Challenge your visual recall capacity by following the sequence accurately.</Text>

          <View style={styles.diffList}>
            {[
              { id: 'easy', l: 'Apprentice', s: 3, c: Theme.colors.success, desc: '3x3 Grid' },
              { id: 'medium', l: 'Expert', s: 4, c: Theme.colors.warning, desc: '4x4 Grid' },
              { id: 'hard', l: 'Master', s: 5, c: Theme.colors.error, desc: '5x5 Grid' }
            ].map(d => (
              <Pressable key={d.id} onPress={() => { setDifficulty(d.id as any); resetGame(d.s); }}>
                <LinearGradient colors={Theme.colors.gradients.glass} style={styles.diffCard}>
                  <View style={[styles.diffIcon, { backgroundColor: `${d.c}20` }]}>
                    <Zap size={20} color={d.c} />
                  </View>
                  <View style={styles.diffInfo}>
                    <Text style={styles.diffLabel}>{d.l}</Text>
                    <Text style={styles.diffSub}>{d.desc}</Text>
                  </View>
                  <ChevronLeft size={20} color={Theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.backToTraining} onPress={() => router.back()}>
            <Text style={styles.backText}>Back to Training Center</Text>
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
            <ChevronLeft size={20} color={Theme.colors.textMuted} />
          </Pressable>
          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={20} color={i < lives ? Theme.colors.error : 'rgba(255,255,255,0.1)'} fill={i < lives ? Theme.colors.error : 'transparent'} />
            ))}
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{round}/{maxRounds}</Text>
          </View>
        </View>

        <View style={styles.timerBarContainer}>
          <Text style={styles.hintText}>{flashing ? "WATCHING..." : "YOUR TURN!"}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${(currentStep / sequence.length) * 100}%` }]} />
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
                      <Pressable
                        onPress={() => handleTilePress(r, c)}
                        disabled={flashing || status !== 'playing'}
                        style={[
                          styles.tile,
                          { width: tileSize, height: tileSize },
                          activeTile === key && styles.tileActive,
                          selectedTiles.includes(key) && styles.tileSelected,
                        ]}
                      >
                        <LinearGradient
                          colors={activeTile === key ? [Theme.colors.primary, '#818cf8'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                          style={StyleSheet.absoluteFill}
                        />
                      </Pressable>
                    </Animated.View>
                  )
                })}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          {status !== 'playing' && status !== 'idle' && (
            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
              <Trophy size={50} color={status === 'success' ? Theme.colors.warning : Theme.colors.error} />
              <Text style={styles.overTitle}>{status === 'success' ? 'EXCELLENT!' : 'MEMORY FULL'}</Text>

              <View style={styles.resultDetails}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>ROUND</Text>
                  <Text style={styles.resultValue}>{round}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>BEST</Text>
                  <Text style={styles.resultValue}>{highScore}</Text>
                </View>
              </View>

              <Pressable style={styles.mainButton} onPress={() => resetGame()}>
                <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                  <RotateCcw size={20} color="white" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    padding: 20,
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
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
  },
  scoreBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  scoreBadgeText: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '800',
  },
  timerBarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  hintText: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.primary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  gridArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tileActive: {
    borderColor: '#fff',
    elevation: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  tileSelected: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  footer: {
    minHeight: 180,
    justifyContent: 'center',
  },
  gameOverCard: {
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overTitle: {
    fontSize: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginVertical: 16,
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  resultItem: {
    alignItems: 'center',
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
    color: Theme.colors.text,
    fontWeight: '900',
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
    paddingVertical: 14,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MemoryGame;
