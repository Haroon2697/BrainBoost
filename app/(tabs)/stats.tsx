"use client"

import { LinearGradient } from "expo-linear-gradient"
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react-native"
import { Dimensions, ScrollView, StyleSheet, Text, View, SafeAreaView } from "react-native"
import { Theme } from "../../constants/Theme"

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
  { name: "Sudoku Expert", played: 12, bestScore: "95%", avgTime: "2m 15s" },
  { name: "2048 Master", played: 8, bestScore: "87%", avgTime: "1m 45s" },
  { name: "Math Challenge", played: 15, bestScore: "100%", avgTime: "3m 30s" },
  { name: "Logic Master", played: 6, bestScore: "82%", avgTime: "4m 12s" },
  { name: "Slide Master", played: 10, bestScore: "98%", avgTime: "45s" },
]

export default function StatsScreen() {
  const maxGames = Math.max(...weeklyData.map((d) => d.games))

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Performance</Text>
          <Text style={styles.headerSubtitle}>Your cognitive data insights</Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Snapshot</Text>
          <View style={styles.overviewGrid}>
            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.overviewCard}>
              <BarChart3 size={24} color={Theme.colors.success} strokeWidth={2} />
              <Text style={styles.overviewValue}>30</Text>
              <Text style={styles.overviewLabel}>Games Played</Text>
            </LinearGradient>

            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.overviewCard}>
              <TrendingUp size={24} color={Theme.colors.warning} strokeWidth={2} />
              <Text style={styles.overviewValue}>89%</Text>
              <Text style={styles.overviewLabel}>Avg Score</Text>
            </LinearGradient>

            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.overviewCard}>
              <Clock size={24} color={Theme.colors.primary} strokeWidth={2} />
              <Text style={styles.overviewValue}>2m 45s</Text>
              <Text style={styles.overviewLabel}>Avg Time</Text>
            </LinearGradient>

            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.overviewCard}>
              <Target size={24} color={Theme.colors.secondary} strokeWidth={2} />
              <Text style={styles.overviewValue}>12</Text>
              <Text style={styles.overviewLabel}>Best Streak</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Activity</Text>
          <LinearGradient colors={Theme.colors.gradients.glass} style={styles.chartContainer}>
            <View style={styles.chart}>
              {weeklyData.map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={Theme.colors.gradients.primary}
                      style={[
                        styles.bar,
                        {
                          height: (data.games / maxGames) * 80,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.day}</Text>
                  <Text style={styles.barValue}>{data.games}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Game Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training History</Text>
          {gameStats.map((game, index) => (
            <LinearGradient key={index} colors={Theme.colors.gradients.glass} style={styles.gameStatCard}>
              <View style={styles.gameStatHeader}>
                <Text style={styles.gameStatName}>{game.name}</Text>
                <Text style={styles.gameStatPlayed}>{game.played} sessions</Text>
              </View>
              <View style={styles.gameStatDetails}>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatLabel}>Best Accuracy</Text>
                  <Text style={styles.gameStatValue}>{game.bestScore}</Text>
                </View>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatLabel}>Median Speed</Text>
                  <Text style={styles.gameStatValue}>{game.avgTime}</Text>
                </View>
              </View>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 24,
    paddingTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
    width: (width - 64) / 2,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  overviewValue: {
    fontSize: 24,
    color: Theme.colors.text,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: "center",
    fontWeight: "600",
  },
  chartContainer: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    marginBottom: 12,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: "700",
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: "600",
  },
  gameStatCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gameStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  gameStatName: {
    fontSize: 18,
    color: Theme.colors.text,
    fontWeight: "700",
  },
  gameStatPlayed: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: "600",
  },
  gameStatDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  gameStatItem: {
    flex: 1,
  },
  gameStatLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gameStatValue: {
    fontSize: 18,
    color: Theme.colors.text,
    fontWeight: "800",
  },
})
