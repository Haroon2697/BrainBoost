"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

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

  const handleTilePress = async (row: number, col: number) => {
    if (flashing || status !== "playing") return

    const key = keyFromCoord(row, col)
    const correct = sequence[currentStep]

    if (correct.row === row && correct.col === col) {
      // Success pulse animation (subtle)
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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.menuContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Memory Tiles</Text>
            <Text style={styles.subtitle}>Test your memory with flashing tiles</Text>
          </View>

          <View style={styles.difficultyContainer}>
            {renderDifficultyButton("easy", 3, 20, "#10b981", "🎯")}
            {renderDifficultyButton("medium", 4, 40, "#f59e0b", "⚡")}
            {renderDifficultyButton("hard", 5, 50, "#ef4444", "🔥")}
          </View>
        </View>
      </View>
    )
  }

  const progress = Math.min(round / maxRounds, 1)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.gameTitle}>Memory Tiles</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Round</Text>
            <Text style={styles.statValue}>
              {round}/{maxRounds}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lives</Text>
            <Text style={styles.statValue}>{"❤️".repeat(lives)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
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
        <View style={styles.grid}>
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
            <Text style={styles.successTitle}>🏆 Amazing!</Text>
            <Text style={styles.successText}>You completed all {maxRounds} rounds!</Text>
          </View>
        )}

        {status === "fail" && (
          <View style={styles.failContainer}>
            <Text style={styles.failTitle}>💥 Game Over</Text>
            <Text style={styles.failText}>You reached round {round}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => resetGame(gridSize)} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "idle" && flashing && <Text style={styles.watchText}>👀 Watch the sequence...</Text>}

        {status === "playing" && (
          <Text style={styles.playText}>
            ✨ Repeat the sequence! ({currentStep + 1}/{sequence.length})
          </Text>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => setDifficulty(null)} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
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
    color: "#00d4ff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
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
  gameTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00d4ff",
    textAlign: "center",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00d4ff",
    borderRadius: 4,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    backgroundColor: "#1e293b",
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
    backgroundColor: "#334155",
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
    backgroundColor: "#00d4ff",
    shadowColor: "#00d4ff",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  tappedTile: {
    backgroundColor: "#0ea5e9",
    opacity: 0.8,
  },
  glowEffect: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: "#00d4ff",
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
    color: "#10b981",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  failContainer: {
    alignItems: "center",
  },
  failTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 8,
  },
  failText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  watchText: {
    fontSize: 18,
    color: "#00d4ff",
    textAlign: "center",
  },
  playText: {
    fontSize: 18,
    color: "#10b981",
    textAlign: "center",
  },
  backButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 30,
  },
  backButtonText: {
    color: "#94a3b8",
    fontSize: 16,
  },
})
