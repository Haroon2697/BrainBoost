import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { Play, RotateCcw, Check, X, SpellCheck, Eraser } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const WORD_LIST = [
  'REACT', 'MOBILE', 'BRAIN', 'PUZZLE', 'LOGIC', 'MEMORY', 'SMART', 'GENIUS',
  'STREAM', 'CODING', 'WIDGET', 'BUTTON', 'SCREEN', 'SOURCE', 'GITHUB', 'PLANET',
  'SYSTEM', 'ENERGY', 'FUTURE', 'DESIGN', 'OBJECT', 'STREET', 'MOUNTAIN', 'VALLEY'
];

const WordBuilderGame = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [selections, setSelections] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const bounceAnim = useState(new Animated.Value(0))[0];

  const generateWord = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const letters = word.split('').sort(() => Math.random() - 0.5);
    setCurrentWord(word);
    setScrambled(letters);
    setSelections([]);

    Animated.spring(bounceAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start(() => {
      bounceAnim.setValue(0);
    });
  }, [bounceAnim]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    generateWord();
  };

  const selectLetter = (index: number) => {
    if (selections.includes(index) || feedback) return;
    const newSelections = [...selections, index];
    setSelections(newSelections);

    if (newSelections.length === currentWord.length) {
      const builtWord = newSelections.map(idx => scrambled[idx]).join('');
      if (builtWord === currentWord) {
        setFeedback('correct');
        setScore(s => s + 50);
        setTimeout(() => {
          setFeedback(null);
          generateWord();
        }, 800);
      } else {
        setFeedback('wrong');
        Vibration.vibrate(200);
        setTimeout(() => {
          setFeedback(null);
          setSelections([]);
        }, 800);
      }
    }
  };

  const clearLast = () => {
    if (selections.length > 0) {
      setSelections(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState('gameOver');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const renderStart = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.primary} style={styles.gameCard}>
        <SpellCheck size={60} color="#fff" />
        <Text style={styles.gameTitle}>Word Builder</Text>
        <Text style={styles.gameDesc}>Unscramble the letters to form the correct word. Be fast to earn bonus points!</Text>
        <TouchableOpacity style={styles.mainButton} onPress={startGame}>
          <Play size={24} color={Theme.colors.primary} fill={Theme.colors.primary} />
          <Text style={[styles.buttonText, { color: Theme.colors.primary }]}>Build Words</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>POINTS</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.wordDisplay}>
          {currentWord.split('').map((_, i) => (
            <View key={i} style={[styles.displaySlot, selections[i] !== undefined && styles.slotActive]}>
              <Text style={styles.displayText}>
                {selections[i] !== undefined ? scrambled[selections[i]] : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.scrambledGrid}>
          {scrambled.map((letter, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.letterTile,
                selections.includes(i) && styles.tileUsed,
              ]}
              onPress={() => selectLetter(i)}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.backspace} onPress={clearLast}>
          <Eraser size={24} color={Theme.colors.textMuted} />
          <Text style={styles.backspaceText}>CLEAR LAST</Text>
        </TouchableOpacity>
      </View>

      {feedback && (
        <View style={styles.feedbackOverlay}>
          {feedback === 'correct' ? (
            <Check size={120} color={Theme.colors.success} strokeWidth={3} />
          ) : (
            <X size={120} color={Theme.colors.error} strokeWidth={3} />
          )}
        </View>
      )}
    </View>
  );

  const renderGameOver = () => (
    <View style={styles.content}>
      <View style={styles.gameOverCard}>
        <Text style={styles.overTitle}>Vocabulary Mastery</Text>
        <Text style={styles.finalScore}>{score}</Text>
        <Text style={styles.finalLabel}>Total Score Earned</Text>

        <TouchableOpacity style={styles.retryBtn} onPress={startGame}>
          <RotateCcw size={24} color="#fff" />
          <Text style={styles.retryText}>New Challenge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={styles.gradient}>
        {gameState === 'start' && renderStart()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'gameOver' && renderGameOver()}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  gameCard: { padding: 40, borderRadius: 40, width: '100%', alignItems: 'center', gap: 20 },
  gameTitle: { fontSize: 36, fontWeight: '900', color: '#fff' },
  gameDesc: { fontSize: 16, color: '#fff', opacity: 0.9, textAlign: 'center', lineHeight: 24 },
  mainButton: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20, gap: 12 },
  buttonText: { fontSize: 20, fontWeight: 'bold' },

  playingContainer: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  timerContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50 },
  timerText: { color: Theme.colors.accent, fontSize: 22, fontWeight: 'bold' },
  scoreContainer: { alignItems: 'flex-end' },
  scoreLabel: { color: Theme.colors.textMuted, fontSize: 10, fontWeight: 'bold' },
  scoreValue: { color: Theme.colors.text, fontSize: 24, fontWeight: '900' },

  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  wordDisplay: { flexDirection: 'row', gap: 10, marginBottom: 80 },
  displaySlot: { width: 45, height: 55, borderBottomWidth: 3, borderBottomColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  slotActive: { borderBottomColor: Theme.colors.primary },
  displayText: { color: Theme.colors.text, fontSize: 32, fontWeight: '900' },

  scrambledGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 60 },
  letterTile: { width: 60, height: 60, backgroundColor: Theme.colors.card, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', elevation: 5 },
  tileUsed: { opacity: 0.3, transform: [{ scale: 0.9 }] },
  letterText: { color: Theme.colors.text, fontSize: 28, fontWeight: 'bold' },

  backspace: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  backspaceText: { color: Theme.colors.textMuted, fontWeight: 'bold', fontSize: 14 },

  feedbackOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' },

  gameOverCard: { backgroundColor: Theme.colors.card, padding: 40, borderRadius: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  overTitle: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, marginBottom: 10 },
  finalScore: { fontSize: 64, fontWeight: '900', color: Theme.colors.accent },
  finalLabel: { fontSize: 16, color: Theme.colors.textMuted, marginBottom: 40 },
  retryBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20, gap: 12 },
  retryText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

export default WordBuilderGame;