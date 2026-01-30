"use client"

import { Creepster_400Regular } from "@expo-google-fonts/creepster"
import { FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one"
import { Picker } from "@react-native-picker/picker"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Clock, Lightbulb, RotateCcw, Trophy, Brain } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, {
  runOnJS,
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

type Difficulty = "easy" | "medium" | "hard"

export default function HangmanGame() {
  const router = useRouter()

  // Fonts are now loaded in the root _layout.tsx

  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
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

  const loadWord = () => {
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)

    gameOverScale.value = withTiming(0)
    wordShake.value = 0
    hangmanScale.value = 1

    const words = WORD_CATEGORIES[difficulty]
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

  useEffect(() => {
    loadWord()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [difficulty])

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

  if (loading) return <View style={styles.centered}><ActivityIndicator color={Theme.colors.primary} /></View>

  const isWin = word.length > 0 && word.split("").every(char => guessedLetters.includes(char))

  return (
    <LinearGradient colors={Theme.colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.statChip}>
            <Trophy size={18} color={Theme.colors.warning} />
            <Text style={styles.statText}>{wins}</Text>
          </View>
          <View style={styles.statChip}>
            <Clock size={18} color={Theme.colors.accent} />
            <Text style={styles.statText}>{formatTime(timer)}</Text>
          </View>
          <TouchableOpacity style={styles.hintChip} onPress={useHint} disabled={usedHint || gameOver}>
            <Lightbulb size={18} color={usedHint ? Theme.colors.textMuted : Theme.colors.warning} />
          </TouchableOpacity>
        </View>

        <View style={styles.diffPickerContainer}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setDifficulty(d)}
              style={[styles.diffBtn, difficulty === d && styles.diffBtnActive, { borderColor: d === 'easy' ? Theme.colors.success : d === 'medium' ? Theme.colors.warning : Theme.colors.error }]}
            >
              <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>{d.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.gameArea}>
          <Animated.View style={[styles.hangmanBox, hangmanAnimatedStyle]}>
            <Text style={styles.hangmanEmoji}>{hangmanStages[wrongGuesses]}</Text>
            <View style={styles.guessBar}>
              {[...Array(MAX_GUESSES)].map((_, i) => (
                <View key={i} style={[styles.guessDot, i < wrongGuesses && { backgroundColor: Theme.colors.error }]} />
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.wordDisplay, wordAnimatedStyle]}>
            {word.split("").map((char, i) => (
              <View key={i} style={styles.letterSlot}>
                <Text style={[styles.letterText, { fontFamily: 'FredokaOne_400Regular' }]}>
                  {guessedLetters.includes(char) ? char : "_"}
                </Text>
              </View>
            ))}
          </Animated.View>

          <View style={styles.keyboard}>
            {ALPHABET.map(letter => {
              const isGuessed = guessedLetters.includes(letter)
              const isCorrect = word.includes(letter)
              return (
                <TouchableOpacity
                  key={letter}
                  onPress={() => guessLetter(letter)}
                  disabled={isGuessed || gameOver}
                  style={[
                    styles.key,
                    isGuessed && { backgroundColor: isCorrect ? Theme.colors.success : Theme.colors.error, borderColor: 'transparent' }
                  ]}
                >
                  <Text style={[styles.keyText, isGuessed && { color: '#fff' }]}>{letter}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {gameOver && (
          <Animated.View style={[styles.overlay, gameOverAnimatedStyle]}>
            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
              <Text style={styles.overEmoji}>{isWin ? "🏆" : "🥀"}</Text>
              <Text style={styles.overTitle}>{isWin ? "VICTORY!" : "GAME OVER"}</Text>
              <Text style={styles.overWord}>The word was: <Text style={{ color: Theme.colors.primary }}>{word}</Text></Text>
              <TouchableOpacity style={styles.restartBtn} onPress={loadWord}>
                <RotateCcw size={20} color="#fff" />
                <Text style={styles.restartText}>PLAY AGAIN</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hintChip: { backgroundColor: Theme.colors.card, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  diffPickerContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  diffBtn: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 12, borderWidth: 2, backgroundColor: 'transparent' },
  diffBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  diffBtnText: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: '900' },
  diffBtnTextActive: { color: '#fff' },

  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hangmanBox: { alignItems: 'center', marginBottom: 40 },
  hangmanEmoji: { fontSize: 100 },
  guessBar: { flexDirection: 'row', gap: 6, marginTop: 10 },
  guessDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },

  wordDisplay: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 50 },
  letterSlot: { width: 35, height: 45, borderBottomWidth: 3, borderBottomColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  letterText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },

  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  key: { width: (width - 100) / 7, height: 40, backgroundColor: Theme.colors.card, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  keyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: 20 },
  gameOverCard: { width: '100%', padding: 40, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  overEmoji: { fontSize: 80, marginBottom: 20 },
  overTitle: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 10 },
  overWord: { fontSize: 18, color: Theme.colors.textMuted, marginBottom: 30 },
  restartBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20, gap: 12 },
  restartText: { color: '#fff', fontSize: 18, fontWeight: '900' },
})
