"use client"

import { LinearGradient } from "expo-linear-gradient"
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react-native"
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native"

const { width } = Dimensions.get("window")

const weeklyData = [
  { day: "Mon", games: 3, score: 85 },
  { day: "Tue", games: 5, score: 92 },
  { day: "Wed", games: 2, score: 78 },
  { day: "Thu", games: 7, score: 95 },
  { day: "Fri", games: 4, score: 88 },
  { day: "Sat", games: 6, score: 91 },
  { day: "Sun", games: 3, score: 87 },
]

const gameStats = [
  { name: "Memory Match", played: 12, bestScore: "95%", avgTime: "2m 15s" },
  { name: "Math Challenge", played: 8, bestScore: "87%", avgTime: "1m 45s" },
  { name: "Hangman", played: 15, bestScore: "100%", avgTime: "3m 30s" },
  { name: "Logic Puzzle", played: 6, bestScore: "82%", avgTime: "4m 12s" },
  { name: "Reaction Time", played: 10, bestScore: "98%", avgTime: "45s" },
]

export default function StatsScreen() {
  const maxGames = Math.max(...weeklyData.map((d) => d.games))

  return (
    <LinearGradient colors={["#1a1a1a", "#000000"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: "white" }]}>Stats & Progress</Text>
          <Text style={[styles.headerSubtitle, { color: "rgba(255,255,255,0.7)" }]}>Track your brain training journey</Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>This Week</Text>
          <View style={styles.overviewGrid}>
            <LinearGradient colors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.1)"]} style={styles.overviewCard}>
              <BarChart3 size={24} color="#10b981" strokeWidth={2} />
              <Text style={[styles.overviewValue, { color: "white" }]}>30</Text>
              <Text style={[styles.overviewLabel, { color: "rgba(255,255,255,0.7)" }]}>Games Played</Text>
            </LinearGradient>

            <LinearGradient colors={["rgba(245, 158, 11, 0.2)", "rgba(245, 158, 11, 0.1)"]} style={styles.overviewCard}>
              <TrendingUp size={24} color="#f59e0b" strokeWidth={2} />
              <Text style={[styles.overviewValue, { color: "white" }]}>89%</Text>
              <Text style={[styles.overviewLabel, { color: "rgba(255,255,255,0.7)" }]}>Avg Score</Text>
            </LinearGradient>

            <LinearGradient colors={["rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.1)"]} style={styles.overviewCard}>
              <Clock size={24} color="#8b5cf6" strokeWidth={2} />
              <Text style={[styles.overviewValue, { color: "white" }]}>2m 45s</Text>
              <Text style={[styles.overviewLabel, { color: "rgba(255,255,255,0.7)" }]}>Avg Time</Text>
            </LinearGradient>

            <LinearGradient colors={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]} style={styles.overviewCard}>
              <Target size={24} color="#ef4444" strokeWidth={2} />
              <Text style={[styles.overviewValue, { color: "white" }]}>12</Text>
              <Text style={[styles.overviewLabel, { color: "rgba(255,255,255,0.7)" }]}>Best Streak</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Daily Activity</Text>
          <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.chartContainer}>
            <View style={styles.chart}>
              {weeklyData.map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={["#10b981", "#059669"]}
                      style={[
                        styles.bar,
                        {
                          height: (data.games / maxGames) * 80,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: "rgba(255,255,255,0.7)" }]}>{data.day}</Text>
                  <Text style={[styles.barValue, { color: "rgba(255,255,255,0.7)" }]}>{data.games}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Game Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Game Breakdown</Text>
          {gameStats.map((game, index) => (
            <LinearGradient key={index} colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.gameStatCard}>
              <View style={styles.gameStatHeader}>
                <Text style={[styles.gameStatName, { color: "white" }]}>{game.name}</Text>
                <Text style={[styles.gameStatPlayed, { color: "rgba(255,255,255,0.7)" }]}>{game.played} played</Text>
              </View>
              <View style={styles.gameStatDetails}>
                <View style={styles.gameStatItem}>
                  <Text style={[styles.gameStatLabel, { color: "rgba(255,255,255,0.7)" }]}>Best Score</Text>
                  <Text style={[styles.gameStatValue, { color: "white" }]}>{game.bestScore}</Text>
                </View>
                <View style={styles.gameStatItem}>
                  <Text style={[styles.gameStatLabel, { color: "rgba(255,255,255,0.7)" }]}>Avg Time</Text>
                  <Text style={[styles.gameStatValue, { color: "white" }]}>{game.avgTime}</Text>
                </View>
              </View>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  chartContainer: {
    padding: 20,
    borderRadius: 16,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600",
  },
  gameStatCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  gameStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gameStatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  gameStatPlayed: {
    fontSize: 12,
    fontWeight: "500",
  },
  gameStatDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gameStatItem: {
    alignItems: "center",
  },
  gameStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  gameStatValue: {
    fontSize: 16,
    fontWeight: "700",
  },
})
