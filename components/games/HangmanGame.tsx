import { Creepster_400Regular, useFonts } from '@expo-google-fonts/creepster';
import { FredokaOne_400Regular } from '@expo-google-fonts/fredoka-one';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Lightbulb, RotateCcw, Trophy } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fetchWord } from '../../utils/fetchWords';

const { width, height } = Dimensions.get('window');

// Constants
const MAX_GUESSES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const hangmanStages = ['😊', '😐', '😕', '😟', '😰', '😵', '💀'];
type Difficulty = 'easy' | 'medium' | 'hard';

const difficultyColors = {
  easy: ['#4ade80', '#22c55e'],
  medium: ['#fbbf24', '#f59e0b'],
  hard: ['#ef4444', '#dc2626'],
};

export default function HangmanGame() {
  const router = useRouter();
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Creepster_400Regular,
    FredokaOne_400Regular,
  });

  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const hangmanScale = useSharedValue(1);
  const wordShake = useSharedValue(0);
  const keyboardOpacity = useSharedValue(1);
  const gameOverScale = useSharedValue(0);

  // Animated styles
  const hangmanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hangmanScale.value }],
  }));

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wordShake.value }],
  }));

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: keyboardOpacity.value,
  }));

  const gameOverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverScale.value,
  }));

  // Animation functions
  const animateHangman = () => {
    hangmanScale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
  };

  const animateWrongGuess = () => {
    wordShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animateGameOver = () => {
    keyboardOpacity.value = withTiming(0.3, { duration: 300 });
    gameOverScale.value = withSpring(1, { damping: 8 });
  };

  const resetAnimations = () => {
    keyboardOpacity.value = withTiming(1, { duration: 300 });
    gameOverScale.value = withTiming(0, { duration: 200 });
    wordShake.value = 0;
    hangmanScale.value = 1;
  };

  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Load a new word
  const loadWord = async () => {
    setLoading(true);
    stopTimer();
    resetAnimations();

    const newWord = await fetchWord(difficulty);
    setWord(newWord.toUpperCase());

    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setUsedHint(false);
    setTimer(0);

    setLoading(false);
    startTimer();
  };

  useEffect(() => {
    loadWord();
    return stopTimer;
  }, [difficulty]);

  // Handle letter guesses
  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;

    const updatedGuesses = [...guessedLetters, letter];
    setGuessedLetters(updatedGuesses);

    if (!word.includes(letter)) {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      
      // Animate wrong guess
      runOnJS(animateWrongGuess)();
      runOnJS(animateHangman)();

      if (nextWrong >= MAX_GUESSES) {
        setGameOver(true);
        setLosses((prev) => prev + 1);
        stopTimer();
        runOnJS(animateGameOver)();
      }
    }

    // Check win
    const allCorrect = word.split('').every((char) => updatedGuesses.includes(char));
    if (allCorrect) {
      setGameOver(true);
      setWins((prev) => prev + 1);
      stopTimer();
      runOnJS(animateGameOver)();
    }
  };

  // Use hint
  const useHint = () => {
    if (usedHint || gameOver) return;

    const unguessed = word.split('').filter((char) => !guessedLetters.includes(char));
    if (unguessed.length === 0) return;

    const randomLetter = unguessed[Math.floor(Math.random() * unguessed.length)];
    guessLetter(randomLetter);
    setUsedHint(true);
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWin = word.split('').every((char) => guessedLetters.includes(char));

  const displayWord = word.split('').map((char, index) => (
    <Animated.View key={index} style={styles.letterContainer}>
      <Text style={[styles.letter, fontsLoaded && { fontFamily: 'FredokaOne_400Regular' }]}>
        {guessedLetters.includes(char) ? char : '_'}
      </Text>
    </Animated.View>
  ));

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={[styles.title, { fontFamily: 'Creepster_400Regular' }]}>
          HANGMAN
        </Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Trophy size={20} color="#ffd700" />
          <Text style={styles.statText}>{wins}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Clock size={20} color="#ffffff" />
          <Text style={styles.statText}>{formatTime(timer)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>💀</Text>
          <Text style={styles.statText}>{losses}</Text>
        </View>
      </View>

      {/* Difficulty Selector */}
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>Difficulty</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => setDifficulty(itemValue as Difficulty)}
            style={styles.picker}
            dropdownIconColor="#ffffff"
            mode="dropdown"
          >
            <Picker.Item label="Easy" value="easy" color="white" />
            <Picker.Item label="Medium" value="medium" color="white" />
            <Picker.Item label="Hard" value="hard" color="white" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading new word...</Text>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          {/* Hangman Display */}
          <Animated.View style={[styles.hangmanContainer, hangmanAnimatedStyle]}>
            <Text style={styles.hangman}>{hangmanStages[wrongGuesses]}</Text>
            <Text style={styles.guessCounter}>
              {wrongGuesses} / {MAX_GUESSES} wrong
            </Text>
          </Animated.View>

          {/* Word Display */}
          <Animated.View style={[styles.wordContainer, wordAnimatedStyle]}>
            {displayWord}
          </Animated.View>

          {/* Keyboard */}
          <Animated.View style={[styles.keyboardContainer, keyboardAnimatedStyle]}>
            <View style={styles.keyboard}>
              {ALPHABET.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = word.includes(letter);
                return (
                  <TouchableOpacity
                    key={letter}
                    onPress={() => guessLetter(letter)}
                    disabled={isGuessed || gameOver}
                    style={[
                      styles.key,
                      isGuessed && {
                        backgroundColor: isCorrect ? '#22c55e' : '#ef4444',
                        transform: [{ scale: 0.9 }],
                      },
                    ]}
                  >
                    <Text style={[
                      styles.keyText,
                      isGuessed && { color: 'white' }
                    ]}>
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Hint Button */}
          <TouchableOpacity
            style={[
              styles.hintButton,
              usedHint && styles.hintButtonDisabled
            ]}
            onPress={useHint}
            disabled={usedHint || gameOver}
          >
            <Lightbulb size={20} color={usedHint ? '#94a3b8' : '#fbbf24'} />
            <Text style={[
              styles.hintText,
              usedHint && styles.hintTextDisabled
            ]}>
              {usedHint ? 'Hint Used' : 'Use Hint'}
            </Text>
          </TouchableOpacity>

          {/* Game Over Overlay */}
          {gameOver && (
            <Animated.View style={[styles.gameOverContainer, gameOverAnimatedStyle]}>
              <View style={styles.gameOverCard}>
                <Text style={styles.gameOverEmoji}>
                  {isWin ? '🎉' : '💀'}
                </Text>
                <Text style={styles.gameOverTitle}>
                  {isWin ? 'Victory!' : 'Game Over'}
                </Text>
                <Text style={styles.gameOverSubtitle}>
                  {isWin 
                    ? `You solved it in ${formatTime(timer)}!` 
                    : `The word was: ${word}`
                  }
                </Text>
                
                <TouchableOpacity
                  style={styles.playAgainButton}
                  onPress={loadWord}
                >
                  <RotateCcw size={20} color="white" />
                  <Text style={styles.playAgainText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerRight: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statEmoji: {
    fontSize: 20,
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    width: 150,
  },
  picker: {
    width: 150,
    height: 50,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hangmanContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  hangman: {
    fontSize: 80,
    marginBottom: 10,
  },
  guessCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginBottom: 40,
    paddingHorizontal: 10,
    minHeight: 50,
  },
  letterContainer: {
    marginHorizontal: 2,
    marginVertical: 4,
  },
  letter: {
    fontSize: 28,
    color: 'white',
    fontWeight: '700',
    width: 30,
    textAlign: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'white',
    paddingBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  keyboardContainer: {
    marginBottom: 20,
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  key: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hintButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hintTextDisabled: {
    color: '#94a3b8',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameOverCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minWidth: width * 0.8,
  },
  gameOverEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  gameOverSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});