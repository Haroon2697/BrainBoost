"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Trophy, Users, Clock, Target, ArrowLeft } from "lucide-react-native"

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
  score: number
  accuracy: number
  reactionTimes: number[]
  rank: number
}

interface GameResult {
  gameType: string
  players: Player[]
  duration: number
  winner: Player
  timestamp: Date
}

interface MultiplayerResultScreenProps {
  result: GameResult
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export default function MultiplayerResultScreen({ result, onPlayAgain, onBackToMenu }: MultiplayerResultScreenProps) {
  const router = useRouter()

  const calculateStats = () => {
         const stats = result.players.map((player) => {
       const times = player.reactionTimes.filter((time: number) => time > 0)
       const average = times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length) : 0
       const fastest = times.length > 0 ? Math.min(...times) : 0
       const winRate = Math.round((player.score / result.duration) * 100)

      return {
        ...player,
        average,
        fastest,
        winRate,
      }
    })

    return stats
  }

  const getWinner = () => {
    const stats = calculateStats()
    return stats.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
  }

  const getBestAverage = () => {
    const stats = calculateStats()
    return stats.reduce((prev, curr) => (curr.average > 0 && curr.average < prev.average ? curr : prev))
  }

  const getFastestTime = () => {
    const stats = calculateStats()
    return stats.reduce((prev, curr) => (curr.fastest > 0 && curr.fastest < prev.fastest ? curr : prev))
  }

  const stats = calculateStats()
  const winner = getWinner()
  const bestAverage = getBestAverage()
  const fastestTime = getFastestTime()

  return (
    <LinearGradient colors={theme.background} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContent}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}
              onPress={onBackToMenu}
            >
              <Text style={[styles.backArrow, { color: theme.textSecondary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>🏆 Tournament Results</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Champion */}
          <View style={[styles.championSection, { backgroundColor: theme.cardBackground[0] }]}>
            <Text style={[styles.championTitle, { color: theme.warning }]}>👑 Champion</Text>
            <Text style={[styles.championName, { color: theme.warning }]}>{winner.name}</Text>
            <Text style={[styles.championStats, { color: theme.textSecondary }]}>
              {winner.score} wins • {winner.winRate}% win rate
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground[0] }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Average</Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>{bestAverage.average}ms</Text>
              <Text style={[styles.statPlayer, { color: theme.textSecondary }]}>{bestAverage.name}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground[0] }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Fastest Time</Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>{fastestTime.fastest}ms</Text>
              <Text style={[styles.statPlayer, { color: theme.textSecondary }]}>{fastestTime.name}</Text>
            </View>
          </View>

          {/* Play Again Button - Positioned above player statistics */}
          <View style={styles.playAgainContainer}>
            <TouchableOpacity style={[styles.playAgainButton, { backgroundColor: theme.accent }]} onPress={onPlayAgain}>
              <Text style={[styles.playAgainButtonText, { color: theme.text }]}>🔄 Play Again</Text>
            </TouchableOpacity>
          </View>

          {/* Player Details */}
          <View style={styles.playerSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Player Statistics</Text>
            {stats.map((player, index) => (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  { backgroundColor: theme.cardBackground[0] },
                  player.id === winner.id && { borderColor: theme.warning, borderWidth: 2 },
                ]}
              >
                <View style={styles.playerHeader}>
                  <Text style={[styles.playerName, { color: theme.text }]}>
                    {player.id === winner.id ? "👑 " : ""}
                    {player.name}
                  </Text>
                  <Text style={[styles.playerRank, { color: theme.warning }]}>#{index + 1}</Text>
                </View>

                <View style={styles.playerStats}>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>Wins:</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>
                      {player.score}/{result.duration}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>Win Rate:</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>{player.winRate}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>Average:</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>{player.average}ms</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>Best:</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>{player.fastest}ms</Text>
                  </View>
                </View>

                {/* Round Times */}
                <View style={[styles.roundTimes, { borderTopColor: theme.border }]}>
                  <Text style={[styles.roundTitle, { color: theme.textSecondary }]}>Round Times:</Text>
                  <View style={styles.timeList}>
                    {player.reactionTimes.map((time: number, roundIndex: number) => (
                      <Text
                        key={roundIndex}
                        style={[
                          styles.timeItem,
                          { color: theme.textSecondary },
                          time === player.fastest && { color: theme.success, fontWeight: "bold" },
                        ]}
                      >
                        R{roundIndex + 1}: {time}ms
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 34,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  header: {
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 50,
  },
  championSection: {
    alignItems: "center",
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
  },
  championTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  championName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  championStats: {
    fontSize: 16,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statPlayer: {
    fontSize: 12,
  },
  playerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  playerCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  playerRank: {
    fontSize: 16,
    fontWeight: "bold",
  },
  playerStats: {
    marginBottom: 15,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
  },
  roundTimes: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  roundTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeItem: {
    fontSize: 12,
    marginRight: 15,
    marginBottom: 5,
  },
  playAgainContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  playAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
})
