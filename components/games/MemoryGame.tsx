"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

// Local theme object to replace ThemeContext
const theme = {
  background: ["#1a1a1a", "#000000"] as const,
  cardBackground: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"] as const,
  accent: "#10b981",
  text: "white",
  textSecondary: "rgba(255,255,255,0.7)",
  border: "rgba(255,255,255,0.1)",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",
  isDark: true
}

const getFlashTime = (round: number) => {
  return Math.max(600 - (round - 1) * 20, 200)
}

type Difficulty = "easy" | "medium" | "hard" | null
type GameStatus = "idle" | "playing" | "success" | "fail"

export default function MemoryGame() {
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
  const progressAnim = useRef(new Animated.Value(0)).current
  const [tileAnimations, setTileAnimations] = useState<{ [key: string]: Animated.Value }>({})

  const maxRounds = difficulty === "medium" ? 40 : difficulty === "hard" ? 50 : 20
  const screenWidth = Dimensions.get("window").width
  const tileSize = (screenWidth - 60) / gridSize - 8

  const keyFromCoord = (r: number, c: number) => `${r}-${c}`

  const getRandomCoord = (): { row: number; col: number } => {
    return {
      row: Math.floor(Math.random() * gridSize),
      col: Math.floor(Math.random() * gridSize),
    }
  }

  const resetGame = async (size: number = gridSize) => {
    const first = getRandomCoord()
    setSequence([first])
    setStatus("idle")
    setRound(1)
    setLives(3)
    setSelectedTiles([])
    setCurrentStep(0)
    setGridSize(size)

    // Reset animations
    shakeAnim.setValue(0)
    pulseAnim.setValue(1)
    progressAnim.setValue(0)
    // Initialize tile animations for the new grid size
    const newTileAnimations: { [key: string]: Animated.Value } = {}
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        newTileAnimations[keyFromCoord(row, col)] = new Animated.Value(1)
      }
    }
    setTileAnimations(newTileAnimations)

    const savedScore = await AsyncStorage.getItem("memoryGameHighScore")
    if (savedScore) setHighScore(Number(savedScore))

    setTimeout(() => flashSequence([first]), 500)
  }

  const flashSequence = async (seq: { row: number; col: number }[]) => {
    setFlashing(true)
    setStatus("idle")

    for (let i = 0; i < seq.length; i++) {
      const { row, col } = seq[i]
      setActiveTile(keyFromCoord(row, col))
      await new Promise((res) => setTimeout(res, getFlashTime(round)))
      setActiveTile(null)
      await new Promise((res) => setTimeout(res, 300))
    }

    setFlashing(false)
    setStatus("playing")
  }

  const animateTile = (key: string) => {
    if (difficulty === "easy") return // Keep full grid animation for easy

    const tileAnim = tileAnimations[key]
    if (tileAnim) {
      Animated.sequence([
        Animated.timing(tileAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tileAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }

  const handleTilePress = async (row: number, col: number) => {
    if (flashing || status !== "playing") return

    const key = keyFromCoord(row, col)
    const correct = sequence[currentStep]

    if (correct.row === row && correct.col === col) {
      // Success animation - individual tile for medium/hard, full grid for easy
      if (difficulty === "easy") {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start()
      } else {
        animateTile(key)
      }

      const newSelected = [...selectedTiles, key]
      setSelectedTiles(newSelected)

      if (currentStep + 1 === sequence.length) {
        if (sequence.length >= maxRounds) {
          setStatus("success")
          if (sequence.length > highScore) {
            await AsyncStorage.setItem("memoryGameHighScore", sequence.length.toString())
            setHighScore(sequence.length)
          }
          return
        }

        const next = [...sequence, getRandomCoord()]
        setRound((prev) => prev + 1)
        setSelectedTiles([])
        setCurrentStep(0)
        setSequence(next)

        setTimeout(() => flashSequence(next), 800)
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    } else {
      triggerShake()
      if (lives > 1) {
        setLives((prev) => prev - 1)
        setSelectedTiles([])
        setCurrentStep(0)
      } else {
        setStatus("fail")
        if (sequence.length > highScore) {
          await AsyncStorage.setItem("memoryGameHighScore", sequence.length.toString())
          setHighScore(sequence.length)
        }
      }
    }
  }

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Update progress animation
  useEffect(() => {
    const progress = Math.min(round / maxRounds, 1)
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [round, maxRounds])

  const renderTile = (row: number, col: number) => {
    const key = keyFromCoord(row, col)
    const isActive = activeTile === key
    const wasTapped = selectedTiles.includes(key)
    const tileAnim = tileAnimations[key]

    if (difficulty === "easy") {
      return (
        <TouchableOpacity
          key={key}
          onPress={() => handleTilePress(row, col)}
          style={[
            styles.tile,
            { width: tileSize, height: tileSize },
            isActive && styles.activeTile,
            wasTapped && styles.tappedTile,
          ]}
          disabled={flashing}
          activeOpacity={0.8}
        >
          {isActive && <View style={styles.glowEffect} />}
        </TouchableOpacity>
      )
    }

    // For medium and hard difficulties, use Animated.View wrapper
    return (
      <Animated.View
        key={key}
        style={[
          tileAnim && {
            transform: [{ scale: tileAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleTilePress(row, col)}
          style={[
            styles.tile,
            { width: tileSize, height: tileSize },
            isActive && styles.activeTile,
            wasTapped && styles.tappedTile,
          ]}
          disabled={flashing}
          activeOpacity={0.8}
        >
          {isActive && <View style={styles.glowEffect} />}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderDifficultyButton = (
    diff: "easy" | "medium" | "hard",
    size: number,
    rounds: number,
    color: string,
    emoji: string,
  ) => (
    <TouchableOpacity
      style={[styles.difficultyButton, { backgroundColor: color }]}
      onPress={() => {
        setDifficulty(diff)
        resetGame(size)
      }}
      activeOpacity={0.8}
    >
      <Text style={styles.difficultyEmoji}>{emoji}</Text>
      <Text style={styles.difficultyTitle}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</Text>
      <Text style={styles.difficultySubtitle}>
        {size}×{size} Grid • {rounds} Rounds
      </Text>
    </TouchableOpacity>
  )

  if (!difficulty) {
    return (
      <LinearGradient colors={theme.background} style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background[0]} />
          <View style={styles.menuContainer}>
            <View style={styles.titleContainer}>
              <Text style={[styles.mainTitle, { color: theme.accent }]}>Memory Tiles</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Test your memory with flashing tiles
              </Text>
            </View>

            <View style={styles.difficultyContainer}>
              {renderDifficultyButton("easy", 3, 20, theme.success, "🎯")}
              {renderDifficultyButton("medium", 4, 40, theme.warning, "⚡")}
              {renderDifficultyButton("hard", 5, 50, theme.error, "🔥")}
            </View>
          </View>
        </View>
      </LinearGradient>
    )
  }

  const progress = Math.min(round / maxRounds, 1)

  return (
    <LinearGradient colors={theme.background} style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background[0]} />

        {/* Header */}
        <View style={styles.header}>
          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}
              onPress={() => setDifficulty(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.backArrow, { color: theme.textSecondary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.gameTitle, { color: theme.accent }]}>Memory Tiles</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0] }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Round</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {round}/{maxRounds}
              </Text>
            </View>

            <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0] }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lives</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{"❤️".repeat(lives)}</Text>
            </View>

            <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0] }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{highScore}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.cardBackground[0] }]}>
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: theme.accent },
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Game Grid */}
        <Animated.View
          style={[
            styles.gameContainer,
            {
              transform: [{ translateX: shakeAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <View style={[styles.grid, { backgroundColor: theme.cardBackground[0] }]}>
            {Array.from({ length: gridSize }).map((_, row) => (
              <View key={row} style={styles.row}>
                {Array.from({ length: gridSize }).map((_, col) => renderTile(row, col))}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Status Messages */}
        <View style={styles.statusContainer}>
          {status === "success" && (
            <View style={styles.successContainer}>
              <Text style={[styles.successTitle, { color: theme.success }]}>🏆 Amazing!</Text>
              <Text style={[styles.successText, { color: theme.textSecondary }]}>
                You completed all {maxRounds} rounds!
              </Text>
            </View>
          )}

          {status === "fail" && (
            <View style={styles.failContainer}>
              <Text style={[styles.failTitle, { color: theme.error }]}>💥 Game Over</Text>
              <Text style={[styles.failText, { color: theme.textSecondary }]}>You reached round {round}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.accent }]}
                onPress={() => resetGame(gridSize)}
                activeOpacity={0.8}
              >
                <Text style={[styles.retryButtonText, { color: theme.text }]}>🔄 Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === "idle" && flashing && (
            <Text style={[styles.watchText, { color: theme.accent }]}>👀 Watch the sequence...</Text>
          )}

          {status === "playing" && (
            <Text style={[styles.playText, { color: theme.success }]}>
              ✨ Repeat the sequence! ({currentStep + 1}/{sequence.length})
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 70,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  difficultyContainer: {
    width: "100%",
    gap: 20,
  },
  difficultyButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  difficultySubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
  },
  placeholder: {
    width: 40,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
  },
  tile: {
    margin: 4,
    backgroundColor: "#333",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeTile: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  tappedTile: {
    backgroundColor: "#45a049",
    opacity: 0.8,
  },
  glowEffect: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    opacity: 0.3,
  },
  statusContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    minHeight: 120,
    justifyContent: "center",
  },
  successContainer: {
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
  },
  failContainer: {
    alignItems: "center",
  },
  failTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  failText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  watchText: {
    fontSize: 18,
    textAlign: "center",
  },
  playText: {
    fontSize: 18,
    textAlign: "center",
  },
})
