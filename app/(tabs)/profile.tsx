"use client"

import { LinearGradient } from "expo-linear-gradient"
import { User, Trophy, Target, Calendar, Award, Settings, Moon, Sun } from "lucide-react-native"
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
const { width } = Dimensions.get("window")

const achievements = [
  { name: "First Win", description: "Complete your first game", earned: true },
  { name: "Speed Demon", description: "Complete a game in under 1 minute", earned: true },
  { name: "Perfect Score", description: "Get 100% on any game", earned: true },
  { name: "Streak Master", description: "Win 10 games in a row", earned: false },
  { name: "Brain Champion", description: "Complete all game types", earned: false },
]

const stats = [
  { label: "Total Games", value: "47", icon: Target },
  { label: "Win Rate", value: "89%", icon: Trophy },
  { label: "Best Streak", value: "12", icon: Award },
  { label: "Days Active", value: "23", icon: Calendar },
]

export default function ProfileScreen() {

  return (
    <LinearGradient colors={["#1a1a1a", "#000000"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.profileCard}>
            <View style={[styles.avatarContainer, { backgroundColor: "#10b981" }]}>
              <User size={40} color="white" strokeWidth={2} />
            </View>
            <Text style={[styles.playerName, { color: "white" }]}>Brain Master</Text>
            <Text style={[styles.playerLevel, { color: "rgba(255,255,255,0.8)" }]}>Level 8 • 2,340 XP</Text>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <LinearGradient key={index} colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
                    <IconComponent size={20} color="#10b981" strokeWidth={2} />
                  </View>
                  <Text style={[styles.statValue, { color: "white" }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.7)" }]}>{stat.label}</Text>
                </LinearGradient>
              )
            })}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>Achievements</Text>
          {achievements.map((achievement, index) => (
            <LinearGradient
              key={index}
              colors={achievement.earned ? ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.1)"] : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.achievementCard}
            >
              <View
                style={[
                  styles.achievementIcon,
                  {
                    backgroundColor: achievement.earned ? "#10b981" : "#374151",
                  },
                ]}
              >
                <Trophy size={16} color="white" strokeWidth={2} />
              </View>
              <View style={styles.achievementInfo}>
                <Text
                  style={[
                    styles.achievementName,
                    {
                      color: achievement.earned ? "white" : "rgba(255,255,255,0.7)",
                    },
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    {
                      color: achievement.earned ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)",
                    },
                  ]}
                >
                  {achievement.description}
                </Text>
              </View>
              {achievement.earned && (
                <View style={[styles.earnedBadge, { backgroundColor: "#10b981" }]}>
                  <Text style={styles.earnedText}>✓</Text>
                </View>
              )}
            </LinearGradient>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Pressable style={styles.settingsButton} android_ripple={{ color: "rgba(255,255,255,0.1)" }}>
            <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.settingsGradient}>
              <Settings size={20} color="white" strokeWidth={2} />
              <Text style={[styles.settingsText, { color: "white" }]}>Settings</Text>
            </LinearGradient>
          </Pressable>
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
    alignItems: "center",
  },
  profileCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  playerName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
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
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    fontWeight: "500",
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  earnedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  settingsButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  settingsGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
