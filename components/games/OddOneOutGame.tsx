"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Theme } from "../../constants/Theme"
import { Brain, RotateCcw, ChevronLeft, Target, Zap, Clock, Trophy } from "lucide-react-native"

const { width } = Dimensions.get("window")

interface GameItem {
  name: string
  category: string
  isOdd: boolean
}

interface GameQuestion {
  items: GameItem[]
  explanation: string
}

const QUESTION_DATABASE: GameQuestion[] = [
  {
    items: [
      { name: "Apple", category: "Fruit", isOdd: false },
      { name: "Banana", category: "Fruit", isOdd: false },
      { name: "Orange", category: "Fruit", isOdd: false },
      { name: "Carrot", category: "Vegetable", isOdd: true },
    ],
    explanation: "Carrot is a vegetable, others are fruits.",
  },
  {
    items: [
      { name: "Mars", category: "Planet", isOdd: false },
      { name: "Venus", category: "Planet", isOdd: false },
      { name: "Jupiter", category: "Planet", isOdd: false },
      { name: "Sun", category: "Star", isOdd: true },
    ],
    explanation: "Sun is a star, the rest are planets.",
  },
  {
    items: [
      { name: "Violin", category: "Strings", isOdd: false },
      { name: "Guitar", category: "Strings", isOdd: false },
      { name: "Cello", category: "Strings", isOdd: false },
      { name: "Flute", category: "Woodwind", isOdd: true },
    ],
    explanation: "Flute is a woodwind instrument.",
  }
];

export default function OddOneOutGame() {
  const router = useRouter()
  const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle")
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [highScore, setHighScore] = useState(0)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem("oddOneOutHighScore")
      if (saved) setHighScore(Number(saved))
    }
    loadData()
  }, [])

  const startNextQuestion = () => {
    const random = QUESTION_DATABASE[Math.floor(Math.random() * QUESTION_DATABASE.length)]
    setCurrentQuestion({
      ...random,
      items: [...random.items].sort(() => Math.random() - 0.5)
    })
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(30)
    startNextQuestion()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setGameState("result")
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const handleAnswer = (item: GameItem) => {
    if (item.isOdd) {
      setScore(s => s + 100)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      startNextQuestion()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setTimeLeft(t => Math.max(0, t - 5))
    }
  }

  useEffect(() => {
    if (gameState === 'result' && score > highScore) {
      setHighScore(score)
      AsyncStorage.setItem("oddOneOutHighScore", score.toString())
    }
    return () => clearInterval(timerRef.current)
  }, [gameState])

  if (gameState === "idle") {
    return (
      <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ChevronLeft size={24} color="#fff" /></TouchableOpacity>
          <View style={styles.menu}>
            <Target size={100} color={Theme.colors.secondary} />
            <Text style={styles.menuTitle}>Odd One Out</Text>
            <Text style={styles.menuSubtitle}>Find the imposter among items!</Text>
            <View style={styles.scoreRow}>
              <Trophy size={20} color={Theme.colors.warning} />
              <Text style={styles.highScoreText}>Best: {highScore}</Text>
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Play size={24} color="#fff" fill="#fff" />
              <Text style={styles.startBtnText}>START MISSION</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <View style={styles.headerStat}>
            <Clock size={18} color={Theme.colors.accent} />
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>
          <View style={styles.headerStat}>
            <Zap size={18} color={Theme.colors.warning} />
            <Text style={styles.statValue}>{score}</Text>
          </View>
        </View>

        <Animated.View style={[styles.questionArea, { opacity: fadeAnim }]}>
          {currentQuestion && (
            <>
              <Text style={styles.questionPrompt}>WHICH ONE IS ODD?</Text>
              <View style={styles.optionsGrid}>
                {currentQuestion.items.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.optionCard} onPress={() => handleAnswer(item)}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={styles.optionCat}>{item.category.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Animated.View>

        {gameState === 'result' && (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>TIME EXPIRED</Text>
              <Text style={styles.resultScore}>{score}</Text>
              <Text style={styles.resultLabel}>Points Earned</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startGame}>
                <RotateCcw size={20} color="#fff" />
                <Text style={styles.retryText}>TRY AGAIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeBtn} onPress={() => setGameState('idle')}>
                <Text style={styles.homeBtnText}>BACK TO MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menu: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 42, fontWeight: '900', color: '#fff', marginTop: 20 },
  menuSubtitle: { fontSize: 18, color: Theme.colors.textMuted, marginBottom: 30 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 50 },
  highScoreText: { color: Theme.colors.text, fontSize: 20, fontWeight: 'bold' },
  startBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 24, elevation: 10 },
  startBtnText: { color: '#fff', fontSize: 20, fontWeight: '900' },

  gameHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 50 },
  headerStat: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Theme.colors.card, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900' },

  questionArea: { flex: 1, alignItems: 'center' },
  questionPrompt: { fontSize: 24, fontWeight: '900', color: Theme.colors.textMuted, marginBottom: 40 },
  optionsGrid: { width: '100%', gap: 15 },
  optionCard: { backgroundColor: Theme.colors.card, padding: 25, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  optionName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  optionCat: { fontSize: 12, color: Theme.colors.textMuted, marginTop: 5, letterSpacing: 2 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  resultCard: { width: '85%', backgroundColor: Theme.colors.card, padding: 40, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resultTitle: { fontSize: 28, fontWeight: '900', color: Theme.colors.error, marginBottom: 20 },
  resultScore: { fontSize: 72, fontWeight: '900', color: '#fff' },
  resultLabel: { color: Theme.colors.textMuted, marginBottom: 40 },
  retryBtn: { width: '100%', backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 20, marginBottom: 15 },
  retryText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  homeBtn: { padding: 10 },
  homeBtnText: { color: Theme.colors.textMuted, fontWeight: 'bold' }
})

import { Play } from "lucide-react-native"
