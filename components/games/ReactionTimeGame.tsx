"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Theme } from "../../constants/Theme"
import { Timer, Zap, Trophy, History, Play, RotateCcw, Target } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

const ReactionTapGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'active' | 'result'>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [attempts, setAttempts] = useState<number[]>([])
  const [bestTime, setBestTime] = useState<number | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

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

  const resetGame = () => {
    setGameState('idle')
    setReactionTime(null)
  }

  const getBackgroundColor = () => {
    if (gameState === 'waiting') return '#f59e0b'
    if (gameState === 'active') return Theme.colors.success
    return Theme.colors.card
  }

  return (
    <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Trophy size={18} color={Theme.colors.warning} />
            <Text style={styles.statValue}>{bestTime ? `${bestTime}ms` : '---'}</Text>
          </View>
          <View style={styles.statBox}>
            <History size={18} color={Theme.colors.accent} />
            <Text style={styles.statValue}>{attempts.length > 0 ? `${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)}ms` : '---'}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTap}
          style={[styles.tapArea, { backgroundColor: getBackgroundColor() }]}
          disabled={gameState === 'idle' || gameState === 'result'}
        >
          {gameState === 'idle' && (
            <View style={styles.idleView}>
              <Zap size={60} color={Theme.colors.primary} />
              <Text style={styles.mainPrompt}>REACTION TEST</Text>
              <Text style={styles.subPrompt}>Tap the button below to start</Text>
              <TouchableOpacity style={styles.startBtn} onPress={startWaiting}>
                <Play size={20} color="#fff" fill="#fff" />
                <Text style={styles.startText}>GET READY</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'waiting' && (
            <Text style={styles.waitingText}>WAIT FOR GREEN...</Text>
          )}

          {gameState === 'active' && (
            <Text style={styles.activeText}>TAP NOW!</Text>
          )}

          {gameState === 'result' && (
            <View style={styles.resultView}>
              <Text style={styles.resultTime}>{reactionTime}ms</Text>
              <Text style={styles.resultRank}>{reactionTime && reactionTime < 250 ? 'FAST!' : 'COULD BE BETTER'}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startWaiting}>
                <RotateCcw size={20} color="#fff" />
                <Text style={styles.retryText}>TRY AGAIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.history}>
          <Text style={styles.historyTitle}>RECENT ATTEMPTS</Text>
          {attempts.map((t, i) => (
            <View key={i} style={styles.historyItem}>
              <Timer size={14} color={Theme.colors.textMuted} />
              <Text style={styles.historyText}>{t}ms</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  statBox: { backgroundColor: Theme.colors.card, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statValue: { color: '#fff', fontWeight: 'bold' },

  tapArea: { flex: 1, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  idleView: { alignItems: 'center' },
  mainPrompt: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 20 },
  subPrompt: { color: Theme.colors.textMuted, marginTop: 5, marginBottom: 40 },
  startBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20 },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  waitingText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  activeText: { fontSize: 48, fontWeight: '900', color: '#fff' },

  resultView: { alignItems: 'center' },
  resultTime: { fontSize: 72, fontWeight: '900', color: '#fff' },
  resultRank: { fontSize: 18, color: '#fff', opacity: 0.8, marginBottom: 40, fontWeight: 'bold' },
  retryBtn: { backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  history: { height: 150, padding: 10 },
  historyTitle: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  historyItem: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 5 },
  historyText: { color: '#fff', fontSize: 16, fontWeight: '500' }
})

import { Alert } from "react-native"

export default ReactionTapGame
