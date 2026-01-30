import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Brain, Clock, Target, Zap, ChevronRight, Trophy, Activity } from "lucide-react-native"
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View, SafeAreaView, StatusBar } from "react-native"
import { Theme } from "../../constants/Theme"

const { width } = Dimensions.get("window")

const quickStats = [
  { label: "Brain Power", value: "1,250", icon: Zap, color: Theme.colors.accent },
  { label: "Daily Goal", value: "85%", icon: Target, color: Theme.colors.primary },
  { label: "Focus Time", value: "45m", icon: Clock, color: Theme.colors.secondary },
  { label: "Global Rank", value: "#42", icon: Trophy, color: Theme.colors.warning },
]

const recentActivities = [
  { name: "Math Challenge", type: "Focus", score: "High Score!", date: "2m ago", icon: Activity },
  { name: "Memory Match", type: "Memory", score: "+45 XP", date: "1h ago", icon: Brain },
]

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Haroon</Text>
            </View>
            <Pressable style={styles.profileBadge}>
              <LinearGradient colors={Theme.colors.gradients.primary} style={styles.badgeGradient}>
                <Trophy size={16} color="white" />
              </LinearGradient>
            </Pressable>
          </View>

          <LinearGradient colors={Theme.colors.gradients.glass} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Level 12</Text>
                <Text style={styles.heroSubtitle}>Apprentice Master</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <LinearGradient colors={Theme.colors.gradients.primary} style={[styles.progressBarFill, { width: '65%' }]} />
                  </View>
                  <Text style={styles.progressText}>2,450 / 3,000 XP</Text>
                </View>
              </View>
              <View style={styles.brainIconContainer}>
                <Brain size={60} color={Theme.colors.primary} strokeWidth={1.5} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Insights</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <LinearGradient key={index} colors={Theme.colors.gradients.glass} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Quick Start Action */}
        <View style={styles.section}>
          <Pressable onPress={() => router.push("/games")} style={styles.actionCard}>
            <LinearGradient colors={Theme.colors.gradients.primary} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Continue Training</Text>
                <Text style={styles.actionSubtitle}>Your logic skills are peaking today!</Text>
              </View>
              <View style={styles.actionButton}>
                <ChevronRight size={24} color="white" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/stats")}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {recentActivities.map((activity, index) => (
            <LinearGradient key={index} colors={Theme.colors.gradients.glass} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <activity.icon size={22} color={Theme.colors.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityType}>{activity.type} • {activity.date}</Text>
              </View>
              <Text style={styles.activityScore}>{activity.score}</Text>
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
  hero: {
    padding: 24,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  brainIconContainer: {
    marginLeft: 10,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 16,
  },
  viewAllText: {
    color: Theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    color: Theme.colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  actionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityType: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  activityScore: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '800',
  },
})
