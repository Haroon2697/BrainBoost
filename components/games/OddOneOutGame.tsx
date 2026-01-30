"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, Pressable, View } from "react-native"
import { Theme } from "../../constants/Theme"
import { Brain, RotateCcw, ChevronLeft, Target, Zap, Clock, Trophy, Home, Play } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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

function OddOneOutGame() {
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
    if (timerRef.current) clearInterval(timerRef.current)
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

  const renderIdle = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameCard}>
        <View style={styles.iconCircle}>
          <Target size={40} color={Theme.colors.secondary} />
        </View>
        <Text style={styles.gameTitle}>Odd One Out</Text>
        <Text style={styles.gameDesc}>Sharp detection is required. Identify the item that doesn't belong in the group as fast as possible!</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Zap size={16} color={Theme.colors.accent} />
            <Text style={styles.featureText}>Logic Based</Text>
          </View>
          <View style={styles.featureItem}>
            <Trophy size={16} color={Theme.colors.warning} />
            <Text style={styles.featureText}>Daily Best: {highScore}</Text>
          </View>
        </View>

        <Pressable style={styles.mainButton} onPress={startGame}>
          <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
            <Play size={20} color="white" fill="white" />
            <Text style={styles.buttonText}>Start Mission</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  )

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setGameState('idle')} style={styles.backButton}>
          <Home size={20} color={Theme.colors.textMuted} />
        </Pressable>
        <View style={styles.timerBadge}>
          <Clock size={16} color={Theme.colors.accent} />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score} XP</Text>
        </View>
      </View>

      <Animated.View style={[styles.questionArea, { opacity: fadeAnim }]}>
        {currentQuestion && (
          <>
            <View style={styles.promptLabel}>
              <Text style={styles.promptText}>FIND THE IMPOSTER</Text>
            </View>
            <View style={styles.optionsGrid}>
              {currentQuestion.items.map((item, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.optionCard,
                    pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
                  ]}
                  onPress={() => handleAnswer(item)}
                >
                  <LinearGradient colors={Theme.colors.gradients.glass} style={StyleSheet.absoluteFill} />
                  <Text style={styles.optionName}>{item.name}</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </Animated.View>
    </View>
  )

  const renderResult = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
        <Trophy size={60} color={Theme.colors.warning} />
        <Text style={styles.overTitle}>Mission Complete!</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>SCORE</Text>
            <Text style={styles.resultValue}>{score}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>BEST</Text>
            <Text style={styles.resultValue}>{highScore}</Text>
          </View>
        </View>

        <View style={styles.overActions}>
          <Pressable style={styles.mainButton} onPress={startGame}>
            <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
              <RotateCcw size={18} color="white" />
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setGameState('idle')}>
            <Text style={styles.secondaryButtonText}>Difficulty Menu</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        {gameState === 'idle' && renderIdle()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'result' && renderResult()}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
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
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
  playingContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBadge: {
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
  timerText: {
    color: Theme.colors.accent,
    fontWeight: '800',
    fontSize: 16,
  },
  scoreBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  scoreText: {
    color: Theme.colors.secondary,
    fontWeight: '800',
    fontSize: 14,
  },
  questionArea: {
    flex: 1,
    alignItems: 'center',
  },
  promptLabel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    marginBottom: 40,
  },
  promptText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  optionsGrid: {
    width: '100%',
    gap: 16,
  },
  optionCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  optionName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800',
    marginBottom: 8,
    zIndex: 1,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    zIndex: 1,
  },
  categoryText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  gameOverCard: {
    padding: 32,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: Theme.fonts.primary,
    marginVertical: 24,
    textAlign: 'center',
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
    fontSize: 32,
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
})

export default OddOneOutGame
