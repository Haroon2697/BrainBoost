"use client"

import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Brain, TrendingUp, Clock, Target, Zap } from "lucide-react-native"
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

const { width } = Dimensions.get("window")

const quickStats = [
  { label: "Games Won", value: "23", icon: Target, color: "#10b981" },
  { label: "Best Streak", value: "8", icon: Zap, color: "#f59e0b" },
  { label: "Total Time", value: "4.2h", icon: Clock, color: "#3b82f6" },
  { label: "Accuracy", value: "89%", icon: TrendingUp, color: "#8b5cf6" },
]

const recentGames = [
  { name: "Memory Match", score: "95%", time: "2:34", difficulty: "Medium" },
  { name: "Math Challenge", score: "87%", time: "1:45", difficulty: "Hard" },
  { name: "Reaction Time", score: "92%", time: "0:58", difficulty: "Easy" },
]

export default function HomeScreen() {
  const router = useRouter()

  return (
    <LinearGradient colors={["#1a1a1a", "#000000"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: "rgba(255,255,255,0.7)" }]}>Welcome back!</Text>
          <Text style={[styles.appName, { color: "white" }]}>BrainBoost</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <LinearGradient key={index} colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <IconComponent size={20} color="white" strokeWidth={2} />
                  </View>
                  <Text style={[styles.statValue, { color: "white" }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.7)" }]}>{stat.label}</Text>
                </LinearGradient>
              )
            })}
          </View>
        </View>

        {/* Quick Play */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Quick Play</Text>
          <Pressable
            style={styles.quickPlayButton}
            onPress={() => router.push("/games")}
            android_ripple={{ color: "rgba(255,255,255,0.1)" }}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.quickPlayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Brain size={24} color="white" strokeWidth={2} />
              <Text style={styles.quickPlayText}>Start Playing</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Recent Games */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Recent Games</Text>
          {recentGames.map((game, index) => (
            <LinearGradient key={index} colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.recentGameCard}>
              <View style={styles.recentGameInfo}>
                <Text style={[styles.recentGameName, { color: "white" }]}>{game.name}</Text>
                <Text style={[styles.recentGameDetails, { color: "rgba(255,255,255,0.7)" }]}>
                  Score: {game.score} • Time: {game.time}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      game.difficulty === "Easy" ? "#10b981" : game.difficulty === "Medium" ? "#f59e0b" : "#ef4444",
                  },
                ]}
              >
                <Text style={styles.difficultyText}>{game.difficulty}</Text>
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
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  quickPlayButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  quickPlayGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  quickPlayText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  recentGameCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentGameInfo: {
    flex: 1,
  },
  recentGameName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recentGameDetails: {
    fontSize: 13,
    fontWeight: "500",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
  },
})
