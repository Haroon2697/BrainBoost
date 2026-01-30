"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, Pressable, View, Alert, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Theme } from "../../constants/Theme"
import { Timer, Zap, Trophy, History, Play, RotateCcw, Home, Clock, TrendingUp } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

const ReactionTapGame = () => {
  const router = useRouter()
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'active' | 'result'>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [attempts, setAttempts] = useState<number[]>([])
  const [bestTime, setBestTime] = useState<number | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const savedBest = await AsyncStorage.getItem("reactionBest")
      if (savedBest) setBestTime(Number(savedBest))
    }
    loadStats()
  }, [])

  const startWaiting = () => {
    setGameState('waiting')
    setReactionTime(null)
    const delay = Math.random() * 3000 + 2000
    timerRef.current = setTimeout(() => {
      setGameState('active')
      setStartTime(Date.now())
    }, delay)
  }

  const handleTap = () => {
    if (gameState === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current)
      setGameState('idle')
      Alert.alert("Too Early!", "Wait for the color to change.")
      return
    }

    if (gameState === 'active') {
      const time = Date.now() - startTime
      setReactionTime(time)
      setAttempts(prev => [time, ...prev].slice(0, 5))
      if (!bestTime || time < bestTime) {
        setBestTime(time)
        AsyncStorage.setItem("reactionBest", time.toString())
      }
      setGameState('result')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const renderIdle = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameCard}>
        <View style={styles.iconCircle}>
          <Zap size={40} color={Theme.colors.primary} />
        </View>
        <Text style={styles.gameTitle}>Reaction Test</Text>
        <Text style={styles.gameDesc}>Test your neural response speed. When the screen turns green, tap as fast as you can!</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Clock size={16} color={Theme.colors.accent} />
            <Text style={styles.featureText}>Neural Speed</Text>
          </View>
          <View style={styles.featureItem}>
            <TrendingUp size={16} color={Theme.colors.secondary} />
            <Text style={styles.featureText}>Daily Best</Text>
          </View>
        </View>

        <Pressable style={styles.mainButton} onPress={startWaiting}>
          <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
            <Play size={20} color="white" fill="white" />
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  )

  const renderWaiting = () => (
    <Pressable style={styles.waitingArea} onPress={handleTap}>
      <LinearGradient colors={['#f59e0b', '#d97706']} style={StyleSheet.absoluteFill} />
      <View style={styles.overContent}>
        <Text style={styles.waitingText}>WAIT FOR IT...</Text>
        <ActivityIndicator color="white" size="large" style={{ marginTop: 20 }} />
      </View>
    </Pressable>
  )

  const renderActive = () => (
    <Pressable style={styles.activeArea} onPress={handleTap}>
      <LinearGradient colors={['#10b981', '#059669']} style={StyleSheet.absoluteFill} />
      <View style={styles.overContent}>
        <Text style={styles.tapNowText}>TAP NOW!</Text>
      </View>
    </Pressable>
  )

  const renderResult = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
        <View style={[styles.resultCircle, { borderColor: reactionTime && reactionTime < 250 ? Theme.colors.success : Theme.colors.warning }]}>
          <Text style={styles.resultMsText}>{reactionTime}ms</Text>
        </View>
        <Text style={styles.overTitle}>{reactionTime && reactionTime < 250 ? 'PHASED!' : 'NICE WORK'}</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>PERSONAL BEST</Text>
            <Text style={styles.resultValue}>{bestTime}ms</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>AVERAGE</Text>
            <Text style={styles.resultValue}>{attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : '---'}ms</Text>
          </View>
        </View>

        <View style={styles.overActions}>
          <Pressable style={styles.mainButton} onPress={startWaiting}>
            <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
              <RotateCcw size={18} color="white" />
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setGameState('idle')}>
            <Text style={styles.secondaryButtonText}>Main Menu</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        {gameState !== 'waiting' && gameState !== 'active' && (
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Home size={20} color={Theme.colors.textMuted} />
            </Pressable>
            <View style={styles.statChip}>
              <Trophy size={16} color={Theme.colors.warning} />
              <Text style={styles.statText}>{bestTime ? `${bestTime}ms` : '---'}</Text>
            </View>
          </View>
        )}

        {gameState === 'idle' && renderIdle()}
        {gameState === 'waiting' && renderWaiting()}
        {gameState === 'active' && renderActive()}
        {gameState === 'result' && renderResult()}

        {(gameState === 'idle' || gameState === 'result') && attempts.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>RECENT ATTEMPTS</Text>
            <View style={styles.historyList}>
              {attempts.map((t, i) => (
                <View key={i} style={styles.historyItem}>
                  <Timer size={14} color={Theme.colors.textMuted} />
                  <Text style={styles.historyValue}>{t}ms</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCard: {
    padding: 32,
    borderRadius: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  gameDesc: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  featureText: {
    fontSize: 12,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  mainButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  waitingArea: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeArea: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  overContent: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 32,
    color: 'white',
    fontFamily: Theme.fonts.primary,
    letterSpacing: 2,
  },
  tapNowText: {
    fontSize: 64,
    color: 'white',
    fontFamily: Theme.fonts.primary,
    letterSpacing: 4,
  },
  gameOverCard: {
    padding: 32,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resultMsText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '900',
  },
  overTitle: {
    fontSize: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 32,
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 40,
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '900',
  },
  overActions: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '700',
  },
  historySection: {
    marginTop: 32,
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  historyValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
})

export default ReactionTapGame
