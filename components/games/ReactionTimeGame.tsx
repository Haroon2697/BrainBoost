"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { useEffect, useRef, useState } from "react"
import { Alert, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { LinearGradient } from "expo-linear-gradient"
import MultiplayerResultScreen from "./MultiplayerResultScreen"
import PlayerSetupScreen from "./PlayerSetupScreen"

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

const screenWidth = Dimensions.get("window").width

// Custom Button component with theme support
const CustomButton = ({ mode, onPress, style, children, textColor }: any) => {
  const buttonStyle = [
    styles.customButton,
    mode === "contained" && [styles.containedButton, { backgroundColor: theme.accent }],
    mode === "outlined" && [styles.outlinedButton, { borderColor: theme.border }],
    mode === "contained-tonal" && [styles.tonalButton, { backgroundColor: theme.cardBackground[0] }],
    style,
  ]

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Text
        style={[
          styles.buttonText,
          { color: textColor || theme.text },
          mode === "contained" && styles.containedButtonText,
          mode === "outlined" && [styles.outlinedButtonText, { color: theme.text }],
          mode === "contained-tonal" && [styles.tonalButtonText, { color: theme.text }],
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

interface Player {
  id: string
  name: string
  color: string
  times?: number[]
  wins?: number
  score?: number
  accuracy?: number
  reactionTimes?: number[]
  rank?: number
}

export default function ReactionTapGame() {
  const [gameState, setGameState] = useState<
    "idle" | "waiting" | "ready" | "result" | "history" | "multiplayer" | "setup" | "multiplayer-result"
  >("idle")
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [reactionHistory, setReactionHistory] = useState<number[]>([])
  const [averageTime, setAverageTime] = useState<number>(0)
  const [focusMode, setFocusMode] = useState(false)
  const [scaleAnim] = useState(new Animated.Value(1))
  const [difficulty, setDifficulty] = useState<"easy" | "hard" | "ultra">("easy")
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false)

  // Multiplayer state
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(3)
  const [roundResults, setRoundResults] = useState<number[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isPlayerTransition, setIsPlayerTransition] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimestamp = useRef<number>(0)

  useEffect(() => {
    loadHighScore()
    loadHistory()
  }, [])

  // Handle countdown for player transitions
  useEffect(() => {
    if (isPlayerTransition && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setIsPlayerTransition(false)
        setCountdown(null)
        startGame()
      }
    }
  }, [countdown, isPlayerTransition])

  const [feedbackMessage, setFeedbackMessage] = useState("")
  const motivationalMessages = [
    "⚡ Blazing fast!",
    "🔥 You're on fire!",
    "👀 Eyes like a hawk!",
    "💪 Strong reaction!",
    "🚀 Lightning reflexes!",
    "🎯 Nailed it!",
  ]

  const getRandomDelay = () => {
    switch (difficulty) {
      case "easy":
        return Math.floor(Math.random() * 3000) + 2000 // 2–5s
      case "hard":
        return Math.floor(Math.random() * 2000) + 500 // 0.5–2.5s
      case "ultra":
        return Math.floor(Math.random() * 2000) + 1000 // 1–3s + fake flash
      default:
        return 3000
    }
  }

  const loadHighScore = async () => {
    const storedBest = await AsyncStorage.getItem("bestReactionTime")
    if (storedBest) setBestTime(Number(storedBest))
  }

  const saveHighScore = async (time: number) => {
    await AsyncStorage.setItem("bestReactionTime", time.toString())
  }

  const saveHistory = async (updated: number[]) => {
    await AsyncStorage.setItem("reactionHistory", JSON.stringify(updated))
  }

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem("reactionHistory")
    if (stored) {
      const parsed = JSON.parse(stored)
      setReactionHistory(parsed)
      updateAverage(parsed)
    }
  }

  const updateAverage = (times: number[]) => {
    if (times.length === 0) return
    const sum = times.reduce((a, b) => a + b, 0)
    setAverageTime(Math.round(sum / times.length))
  }

  const startRealSignal = () => {
    startTimestamp.current = Date.now()
    setGameState("ready")
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
      ]),
    ).start()
  }

  const startGame = () => {
    setReactionTime(null)
    setGameState("waiting")

    const delay = getRandomDelay()

    if (difficulty === "ultra") {
      const fakeFlashCount = Math.floor(Math.random() * 2) + 1 // 1 or 2 fake flashes

      let flashes = 0
      const fakeFlashInterval = setInterval(() => {
        if (flashes < fakeFlashCount) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          flashes++
        } else {
          clearInterval(fakeFlashInterval)
          timeoutRef.current = setTimeout(startRealSignal, delay)
        }
      }, 500)
    } else {
      timeoutRef.current = setTimeout(startRealSignal, delay)
    }
  }

  const startMultiplayerGame = (players: Player[], selectedDifficulty: "easy" | "hard" | "ultra", rounds: number) => {
    setMultiplayerPlayers(players.map((p) => ({ 
      ...p, 
      times: [], 
      wins: 0,
      score: 0,
      accuracy: 0,
      reactionTimes: [],
      rank: 0
    })))
    setDifficulty(selectedDifficulty)
    setTotalRounds(rounds)
    setCurrentPlayerIndex(0)
    setCurrentRound(1)
    setRoundResults([])
    setCountdown(null)
    setIsPlayerTransition(false)
    setIsMultiplayerMode(true)
    setGameState("multiplayer")
    startGame()
  }

  const handleMultiplayerRoundComplete = (reaction: number) => {
    const updatedPlayers = [...multiplayerPlayers]
    if (updatedPlayers[currentPlayerIndex].times) {
      updatedPlayers[currentPlayerIndex].times!.push(reaction)
    }
    setMultiplayerPlayers(updatedPlayers)

    // Check if current player has completed all their rounds
    if (currentRound === totalRounds) {
      // Current player is done, check if all players are done
      if (currentPlayerIndex === multiplayerPlayers.length - 1) {
        // All players have completed all rounds, calculate final results
        calculateFinalResults(updatedPlayers)
      } else {
        // Start countdown for next player
        setIsPlayerTransition(true)
        setCountdown(3)
        setCurrentPlayerIndex(currentPlayerIndex + 1)
        setCurrentRound(1)
      }
    } else {
      // Continue with next round for current player
      setCurrentRound(currentRound + 1)
      startGame()
    }
  }

  const calculateFinalResults = (players: Player[]) => {
    // Calculate wins for each player based on their best times
    const updatedPlayers = [...players]

    for (let round = 0; round < totalRounds; round++) {
      const roundTimes = updatedPlayers.map((p) => p.times?.[round] || 0)
      const fastestTime = Math.min(...roundTimes)
      const roundWinnerIndex = roundTimes.indexOf(fastestTime)
      if (updatedPlayers[roundWinnerIndex].wins !== undefined) {
        updatedPlayers[roundWinnerIndex].wins!++
      }
    }

    setMultiplayerPlayers(updatedPlayers)
    setGameState("multiplayer-result")
  }

  const handleTap = () => {
    if (gameState === "waiting") {
      clearTimeout(timeoutRef.current!)
      Alert.alert("Too Soon!", "Wait for the signal.")
      setGameState("idle")
      setIsMultiplayerMode(false)
      return
    }

    if (gameState === "ready") {
      Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }).stop()
      const reaction = Date.now() - startTimestamp.current
      Haptics.selectionAsync()
      setReactionTime(reaction)

      const randomIndex = Math.floor(Math.random() * motivationalMessages.length)
      setFeedbackMessage(motivationalMessages[randomIndex])

      if (isMultiplayerMode) {
        handleMultiplayerRoundComplete(reaction)
      } else {
        const updatedHistory = [...reactionHistory, reaction].slice(-20)
        setReactionHistory(updatedHistory)
        updateAverage(updatedHistory)
        saveHistory(updatedHistory)
        setGameState("result")

        if (bestTime === null || reaction < bestTime) {
          setBestTime(reaction)
          saveHighScore(reaction)
        }
      }
    }
  }

  const getBackgroundColor = () => {
    if (gameState === "ready") return theme.success
    if (gameState === "waiting") return theme.textSecondary
    if (gameState === "result") return theme.cardBackground[0]
    return theme.background[0]
  }

  // Render different screens based on game state
  if (gameState === "setup") {
    return <PlayerSetupScreen onStartGame={startMultiplayerGame} onBack={() => setGameState("idle")} />
  }

  if (gameState === "multiplayer-result") {
    const result = {
      gameType: "Reaction Time",
      players: multiplayerPlayers.map(p => ({
        id: p.id.toString(),
        name: p.name,
        score: p.wins || 0,
        accuracy: 0,
        reactionTimes: p.times || [],
        rank: 0
      })),
      duration: totalRounds,
      winner: (() => {
        const winner = multiplayerPlayers.reduce((prev, curr) => 
          (curr.wins || 0) > (prev.wins || 0) ? curr : prev
        )
        return {
          id: winner.id.toString(),
          name: winner.name,
          score: winner.wins || 0,
          accuracy: 0,
          reactionTimes: winner.times || [],
          rank: 0
        }
      })(),
      timestamp: new Date()
    }
    
    return (
      <MultiplayerResultScreen
        result={result}
        onPlayAgain={() => setGameState("setup")}
        onBackToMenu={() => setGameState("idle")}
      />
    )
  }

  return (
    <LinearGradient colors={theme.background} style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.container, { backgroundColor: getBackgroundColor() }]}
        onPress={handleTap}
      >
        {gameState === "idle" && (
          <View style={styles.menu}>
            <View style={styles.difficultyContainer}>
              <Text style={[styles.text, { color: theme.text }]}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                <CustomButton
                  mode={difficulty === "easy" ? "contained" : "outlined"}
                  onPress={() => setDifficulty("easy")}
                  style={[styles.difficultyButton, difficulty === "easy" && { backgroundColor: theme.success }]}
                  textColor={theme.text}
                >
                  🟢 Easy
                </CustomButton>
                <CustomButton
                  mode={difficulty === "hard" ? "contained" : "outlined"}
                  onPress={() => setDifficulty("hard")}
                  style={[styles.difficultyButton, difficulty === "hard" && { backgroundColor: theme.warning }]}
                  textColor={theme.text}
                >
                  🔶 Hard
                </CustomButton>
                <CustomButton
                  mode={difficulty === "ultra" ? "contained" : "outlined"}
                  onPress={() => setDifficulty("ultra")}
                  style={[styles.difficultyButton, difficulty === "ultra" && { backgroundColor: theme.error }]}
                  textColor={theme.text}
                >
                  🔴 Ultra
                </CustomButton>
              </View>
            </View>
            <CustomButton
              mode="contained"
              onPress={startGame}
              style={[styles.button, { backgroundColor: theme.accent }]}
              textColor={theme.text}
            >
              🎯 Start Reaction Test
            </CustomButton>
            <CustomButton
              mode="contained"
              onPress={() => setGameState("history")}
              style={[styles.button, { backgroundColor: theme.accent }]}
              textColor={theme.text}
            >
              📈 View Stats
            </CustomButton>
            <CustomButton
              mode="contained-tonal"
              onPress={() => setFocusMode(!focusMode)}
              style={[styles.button, { backgroundColor: theme.cardBackground[0] }]}
              textColor={theme.text}
            >
              {focusMode ? "👁️ Show Stats" : "🧠 Focus Mode"}
            </CustomButton>
            <CustomButton
              mode="contained"
              onPress={() => setGameState("setup")}
              style={[styles.button, { backgroundColor: theme.accent }]}
              textColor={theme.text}
            >
              👥 Multiplayer Mode
            </CustomButton>
          </View>
        )}

        {gameState === "waiting" && (
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.text, { color: theme.text }]}>⏳ Wait for green...</Text>
            {isMultiplayerMode && (
              <View style={[styles.multiplayerInfo, { backgroundColor: theme.cardBackground[0] }]}>
                <Text style={[styles.multiplayerText, { color: theme.text }]}>
                  {multiplayerPlayers[currentPlayerIndex]?.name}'s turn
                </Text>
                <Text style={[styles.multiplayerText, { color: theme.text }]}>
                  Round {currentRound}/{totalRounds}
                </Text>
                <Text style={[styles.multiplayerText, { color: theme.text }]}>
                  Player {currentPlayerIndex + 1} of {multiplayerPlayers.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {isPlayerTransition && countdown !== null && (
          <View style={[styles.countdownContainer, { backgroundColor: theme.cardBackground[0] }]}>
            <Text style={[styles.countdownText, { color: theme.text }]}>Next Player in...</Text>
            <Text style={[styles.countdownNumber, { color: theme.warning }]}>{countdown}</Text>
            <Text style={[styles.nextPlayerText, { color: theme.text }]}>
              {multiplayerPlayers[currentPlayerIndex]?.name}'s turn
            </Text>
          </View>
        )}

        {gameState === "ready" && (
          <Animated.Text style={[styles.text, { color: theme.text, transform: [{ scale: scaleAnim }] }]}>
            ⚡ TAP NOW!
          </Animated.Text>
        )}

        {gameState === "result" && (
          <View style={{ alignItems: "center" }}>
            {feedbackMessage !== "" && (
              <Text style={[styles.feedback, { color: theme.warning }]}>{feedbackMessage}</Text>
            )}
            <Text style={[styles.scoreText, { color: theme.text }]}>🎉 Your Reaction Time: {reactionTime} ms</Text>
            {!focusMode && bestTime && (
              <Text style={[styles.scoreText, { color: theme.text }]}>🏆 Best Time: {bestTime} ms</Text>
            )}
            {!focusMode && reactionHistory.length > 0 && (
              <Text style={[styles.scoreText, { color: theme.text }]}>📊 Average Time: {averageTime} ms</Text>
            )}
            <View style={{ alignItems: "center", width: "100%", marginTop: 24 }}>
              <CustomButton
                mode="contained"
                onPress={startGame}
                style={[styles.button, { alignSelf: "center", backgroundColor: theme.accent }]}
                textColor={theme.text}
              >
                🔁 Try Again
              </CustomButton>
            </View>
          </View>
        )}

        {gameState === "history" && (
          <View style={styles.chartContainer}>
            <Text style={[styles.text, { color: theme.text }]}>📊 Reaction Time History</Text>
            <LineChart
              data={{
                labels: reactionHistory.map((_, i) => (i + 1).toString()),
                datasets: [{ data: reactionHistory }],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="ms"
              chartConfig={{
                backgroundGradientFrom: theme.background[0],
                backgroundGradientTo: theme.background[1],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: () => theme.text,
              }}
              style={{ borderRadius: 16 }}
            />
            <CustomButton
              mode="outlined"
              onPress={() => setGameState("idle")}
              style={{ borderColor: theme.border }}
              textColor={theme.text}
            >
              Back
            </CustomButton>
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    marginVertical: 8,
    width: 240,
    borderRadius: 16,
  },
  menu: {
    gap: 10,
    alignItems: "center",
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  containedButton: {
    // backgroundColor set dynamically
  },
  containedButtonText: {
    color: "white",
  },
  outlinedButton: {
    borderWidth: 2,
  },
  outlinedButtonText: {
    // color set dynamically
  },
  tonalButton: {
    // backgroundColor set dynamically
  },
  tonalButtonText: {
    // color set dynamically
  },
  scoreText: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  feedback: {
    fontSize: 22,
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
  },
  difficultyContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
  },
  multiplayerInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  multiplayerText: {
    fontSize: 18,
  },
  countdownContainer: {
    position: "absolute",
    top: "30%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  countdownText: {
    fontSize: 24,
    marginBottom: 10,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: "bold",
  },
  nextPlayerText: {
    fontSize: 20,
    marginTop: 10,
  },
})
