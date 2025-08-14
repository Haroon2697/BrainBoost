"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Users, Play, ArrowLeft, UserPlus, Trash2 } from "lucide-react-native"

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

interface Player {
  id: string
  name: string
  color: string
}

interface PlayerSetupScreenProps {
  onStartGame: (players: Player[], selectedDifficulty: "easy" | "hard" | "ultra", rounds: number) => void
  onBack: () => void
}

export default function PlayerSetupScreen({ onStartGame, onBack }: PlayerSetupScreenProps) {
  const router = useRouter()

  const [playerCount, setPlayerCount] = useState(2)
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Player 1", color: "#10b981" },
    { id: "2", name: "Player 2", color: "#fbbf24" },
  ])
  const [difficulty, setDifficulty] = useState<"easy" | "hard" | "ultra">("easy")
  const [rounds, setRounds] = useState(3)

  const updatePlayerCount = (count: number) => {
    if (count < 2 || count > 4) return

    setPlayerCount(count)
    const newPlayers: Player[] = []

    for (let i = 1; i <= count; i++) {
      newPlayers.push({
        id: i.toString(),
        name: `Player ${i}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Generate random color
      })
    }

    setPlayers(newPlayers)
  }

  const updatePlayerName = (id: string, name: string) => {
    const updatedPlayers = players.map((player) =>
      player.id === id ? { ...player, name } : player,
    )
    setPlayers(updatedPlayers)
  }

  const handleStartGame = () => {
    // Validate player names
    const emptyNames = players.filter((p) => p.name.trim() === "")
    if (emptyNames.length > 0) {
      Alert.alert("Error", "All players must have names!")
      return
    }

    // Check for duplicate names
    const names = players.map((p) => p.name.trim().toLowerCase())
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
      Alert.alert("Error", "All players must have unique names!")
      return
    }

    onStartGame(players, difficulty, rounds)
  }

  return (
    <LinearGradient colors={theme.background} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.text }]}>👥 Multiplayer Setup</Text>

          {/* Player Count */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Number of Players</Text>
            <View style={styles.buttonRow}>
              {[2, 3, 4].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    { backgroundColor: playerCount === count ? theme.accent : theme.cardBackground[0] },
                  ]}
                  onPress={() => updatePlayerCount(count)}
                >
                  <Text style={[styles.countButtonText, { color: theme.text }]}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Player Names */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Player Names</Text>
            {players.map((player) => (
              <View key={player.id} style={styles.playerInput}>
                <Text style={[styles.playerLabel, { color: theme.text }]}>Player {player.id}:</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text, backgroundColor: theme.cardBackground[0] },
                  ]}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName(player.id, text)}
                  placeholder={`Player ${player.id}`}
                  placeholderTextColor={theme.textSecondary}
                  maxLength={12}
                />
              </View>
            ))}
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Difficulty</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  { backgroundColor: difficulty === "easy" ? theme.success : theme.cardBackground[0] },
                ]}
                onPress={() => setDifficulty("easy")}
              >
                <Text style={[styles.difficultyButtonText, { color: theme.text }]}>🟢 Easy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  { backgroundColor: difficulty === "hard" ? theme.warning : theme.cardBackground[0] },
                ]}
                onPress={() => setDifficulty("hard")}
              >
                <Text style={[styles.difficultyButtonText, { color: theme.text }]}>🔶 Hard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  { backgroundColor: difficulty === "ultra" ? theme.error : theme.cardBackground[0] },
                ]}
                onPress={() => setDifficulty("ultra")}
              >
                <Text style={[styles.difficultyButtonText, { color: theme.text }]}>🔴 Ultra</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rounds */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Rounds (Best of)</Text>
            <View style={styles.buttonRow}>
              {[3, 5, 7].map((roundCount) => (
                <TouchableOpacity
                  key={roundCount}
                  style={[
                    styles.roundButton,
                    { backgroundColor: rounds === roundCount ? theme.accent : theme.cardBackground[0] },
                  ]}
                  onPress={() => setRounds(roundCount)}
                >
                  <Text style={[styles.roundButtonText, { color: theme.text }]}>{roundCount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.cardBackground[0] }]} onPress={onBack}>
              <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.accent }]} onPress={handleStartGame}>
              <Text style={[styles.startButtonText, { color: theme.text }]}>🎮 Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  countButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  countButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  playerInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playerLabel: {
    fontSize: 16,
    width: 80,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  roundButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 18,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})
