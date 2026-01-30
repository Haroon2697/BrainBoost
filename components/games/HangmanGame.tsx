"use client"

import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Clock, Lightbulb, RotateCcw, Trophy, Brain, ChevronLeft, Zap, TrendingUp, Home } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, StyleSheet, Text, Pressable, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { Theme } from "../../constants/Theme"

const { width } = Dimensions.get("window")

// Constants
const MAX_GUESSES = 6
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const hangmanStages = ["😊", "😐", "😕", "😟", "😰", "😵", "💀"]

const WORD_CATEGORIES = {
  easy: ['APPLE', 'DOG', 'CAT', 'FISH', 'TREE', 'BOOK', 'CAKE', 'SUN', 'MOON', 'STAR'],
  medium: ['BOTTLE', 'GUITAR', 'PLANT', 'ORANGE', 'WINDOW', 'RIVER', 'BRIDGE', 'DREAMS'],
  hard: ['ALGORITHM', 'JAVASCRIPT', 'REACT', 'GEOMETRY', 'PLATYPUS', 'QUARTZ', 'ZODIAC']
}

type Difficulty = "easy" | "medium" | "hard" | null

export default function HangmanGame() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<Difficulty>(null)
  const [word, setWord] = useState("")
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [timer, setTimer] = useState(0)
  const [wins, setWins] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hangmanScale = useSharedValue(1)
  const wordShake = useSharedValue(0)
  const gameOverScale = useSharedValue(0)

  const hangmanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hangmanScale.value }],
  }))

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wordShake.value }],
  }))

  const gameOverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverScale.value,
  }))

  const animateHangman = () => {
    hangmanScale.value = withSequence(withSpring(1.3), withSpring(1))
  }

  const animateWrongGuess = () => {
    wordShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    )
  }

  const loadWord = (diff?: Difficulty) => {
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)

    gameOverScale.value = withTiming(0)
    wordShake.value = 0
    hangmanScale.value = 1

    const words = WORD_CATEGORIES[diff || difficulty || 'easy']
    const newWord = words[Math.floor(Math.random() * words.length)]
    setWord(newWord.toUpperCase())

    setGuessedLetters([])
    setWrongGuesses(0)
    setGameOver(false)
    setUsedHint(false)
    setTimer(0)
    setLoading(false)

    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
  }

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return

    const updatedGuesses = [...guessedLetters, letter]
    setGuessedLetters(updatedGuesses)

    if (!word.includes(letter)) {
      const nextWrong = wrongGuesses + 1
      setWrongGuesses(nextWrong)
      animateWrongGuess()
      animateHangman()

      if (nextWrong >= MAX_GUESSES) {
        setGameOver(true)
        if (timerRef.current) clearInterval(timerRef.current)
        gameOverScale.value = withSpring(1)
      }
    }

    const allCorrect = word.split("").every(char => updatedGuesses.includes(char))
    if (allCorrect) {
      setGameOver(true)
      setWins(prev => prev + 1)
      if (timerRef.current) clearInterval(timerRef.current)
      gameOverScale.value = withSpring(1)
    }
  }

  const useHint = () => {
    if (usedHint || gameOver) return
    const unguessed = word.split("").filter(char => !guessedLetters.includes(char))
    if (unguessed.length > 0) {
      guessLetter(unguessed[Math.floor(Math.random() * unguessed.length)])
      setUsedHint(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!difficulty) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.content}>
          <View style={styles.iconCircle}>
            <Brain size={40} color={Theme.colors.primary} />
          </View>
          <Text style={styles.gameTitle}>Hangman Quiz</Text>
          <Text style={styles.gameDesc}>Save the emoji by guessing the hidden word correctly. Be smart, use hints wisely!</Text>

          <View style={styles.diffList}>
            {[
              { id: 'easy', l: 'Novice', c: Theme.colors.success, desc: 'Short simple words' },
              { id: 'medium', l: 'scholar', c: Theme.colors.warning, desc: 'Common longer words' },
              { id: 'hard', l: 'Sage', c: Theme.colors.error, desc: 'Rare complex terms' }
            ].map(d => (
              <Pressable key={d.id} onPress={() => { setDifficulty(d.id as any); loadWord(d.id as any); }}>
                <LinearGradient colors={Theme.colors.gradients.glass} style={styles.diffCard}>
                  <View style={[styles.diffIcon, { backgroundColor: `${d.c}20` }]}>
                    <Zap size={20} color={d.c} />
                  </View>
                  <View style={styles.diffInfo}>
                    <Text style={styles.diffLabel}>{d.l}</Text>
                    <Text style={styles.diffSub}>{d.desc}</Text>
                  </View>
                  <ChevronLeft size={20} color={Theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.backToTraining} onPress={() => router.back()}>
            <Text style={styles.backText}>Return to Dashboard</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    )
  }

  const isWin = word.length > 0 && word.split("").every(char => guessedLetters.includes(char))

  return (
    <View style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.gameSafe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setDifficulty(null)} style={styles.backButton}>
            <Home size={20} color={Theme.colors.textMuted} />
          </Pressable>
          <View style={styles.statList}>
            <View style={styles.statIconBadge}>
              <Trophy size={16} color={Theme.colors.warning} />
              <Text style={styles.statText}>{wins}</Text>
            </View>
            <View style={[styles.statIconBadge, { borderColor: Theme.colors.accent }]}>
              <Clock size={16} color={Theme.colors.accent} />
              <Text style={styles.statText}>{formatTime(timer)}</Text>
            </View>
          </View>
          <Pressable style={[styles.hintBtn, usedHint && { opacity: 0.5 }]} onPress={useHint} disabled={usedHint || gameOver}>
            <Lightbulb size={20} color={usedHint ? Theme.colors.textMuted : Theme.colors.warning} />
          </Pressable>
        </View>

        <View style={styles.gameArea}>
          <Animated.View style={[styles.hangmanBox, hangmanAnimatedStyle]}>
            <Text style={styles.hangmanEmoji}>{hangmanStages[wrongGuesses]}</Text>
            <View style={styles.guessTrack}>
              {[...Array(MAX_GUESSES)].map((_, i) => (
                <View key={i} style={[styles.guessDot, i < wrongGuesses && { backgroundColor: Theme.colors.error, elevation: 5 }]} />
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.wordWrapper, wordAnimatedStyle]}>
            {word.split("").map((char, i) => (
              <View key={i} style={styles.letterSlot}>
                <Text style={styles.letterText}>
                  {guessedLetters.includes(char) ? char : ""}
                </Text>
                <View style={[styles.letterUnderline, guessedLetters.includes(char) && { backgroundColor: Theme.colors.primary }]} />
              </View>
            ))}
          </Animated.View>

          <View style={styles.keyboardGrid}>
            {ALPHABET.map(letter => {
              const isGuessed = guessedLetters.includes(letter)
              const isCorrect = word.includes(letter)
              return (
                <Pressable
                  key={letter}
                  onPress={() => guessLetter(letter)}
                  disabled={isGuessed || gameOver}
                  style={({ pressed }) => [
                    styles.keyBox,
                    isGuessed && {
                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      borderColor: isCorrect ? Theme.colors.success : Theme.colors.error
                    },
                    pressed && !isGuessed && { transform: [{ scale: 0.9 }], opacity: 0.7 }
                  ]}
                >
                  <Text style={[styles.keyChar, isGuessed && { color: isCorrect ? Theme.colors.success : Theme.colors.error }]}>{letter}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {gameOver && (
          <Animated.View style={[styles.overlay, gameOverAnimatedStyle]}>
            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
              <View style={styles.resultIconCircle}>
                <Text style={styles.overEmojiText}>{isWin ? "🌸" : "💀"}</Text>
              </View>
              <Text style={styles.overTitle}>{isWin ? "Wordsmith!" : "Defeated"}</Text>
              <Text style={styles.overSubtitle}>The hidden word was:</Text>
              <Text style={styles.correctWordText}>{word}</Text>

              <View style={styles.overActions}>
                <Pressable style={styles.mainButton} onPress={() => loadWord()}>
                  <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                    <RotateCcw size={18} color="white" />
                    <Text style={styles.buttonText}>New Word</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setDifficulty(null)}>
                  <Text style={styles.secondaryButtonText}>Difficulty Menu</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    fontSize: 32,
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  diffList: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  diffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  diffIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  diffInfo: {
    flex: 1,
  },
  diffLabel: {
    fontSize: 18,
    color: Theme.colors.text,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  diffSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  backToTraining: {
    padding: 16,
  },
  backText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  gameSafe: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statList: {
    flexDirection: 'row',
    gap: 12,
  },
  statIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },
  hintBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
  },
  hangmanBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  hangmanEmoji: {
    fontSize: 100,
  },
  guessTrack: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  guessDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  wordWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 60,
  },
  letterSlot: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  letterUnderline: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  keyboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keyBox: {
    width: (width - 100) / 7,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  keyChar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  gameOverCard: {
    width: '100%',
    padding: 32,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  overEmojiText: {
    fontSize: 44,
  },
  overTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: Theme.fonts.primary,
    marginBottom: 12,
  },
  overSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  correctWordText: {
    fontSize: 24,
    color: Theme.colors.primary,
    fontWeight: '900',
    marginBottom: 40,
    letterSpacing: 2,
  },
  overActions: {
    width: '100%',
    gap: 12,
  },
  mainButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
