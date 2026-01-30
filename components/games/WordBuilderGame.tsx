import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Vibration,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  RotateCcw,
  Home,
  Check,
  X,
  SpellCheck,
  Eraser,
  Trophy,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const WORD_LIST = [
  'REACT', 'MOBILE', 'BRAIN', 'PUZZLE', 'LOGIC', 'MEMORY', 'SMART', 'GENIUS',
  'STREAM', 'CODING', 'WIDGET', 'BUTTON', 'SCREEN', 'SOURCE', 'GITHUB', 'PLANET',
  'SYSTEM', 'ENERGY', 'FUTURE', 'DESIGN', 'OBJECT', 'STREET', 'MOUNTAIN', 'VALLEY'
];

const WordBuilderGame = () => {
  const insets = useSafeAreaInsets();
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
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const renderStart = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameCard}>
        <View style={styles.iconCircle}>
          <SpellCheck size={40} color={Theme.colors.primary} />
        </View>
        <Text style={styles.gameTitle}>Word Builder</Text>
        <Text style={styles.gameDesc}>Unscramble the letters to form correct words. Speed and vocabulary are your best friends!</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Zap size={16} color={Theme.colors.accent} />
            <Text style={styles.featureText}>Vocab Focus</Text>
          </View>
          <View style={styles.featureItem}>
            <TrendingUp size={16} color={Theme.colors.secondary} />
            <Text style={styles.featureText}>Time Rush</Text>
          </View>
        </View>

        <Pressable style={styles.mainButton} onPress={startGame}>
          <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Play size={20} color="white" fill="white" />
            <Text style={styles.buttonText}>Start Building</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
      <View style={{ height: insets.bottom }} />
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setGameState('start')} style={styles.backButton}>
          <Home size={20} color={Theme.colors.textMuted} />
        </Pressable>
        <View style={styles.timerBadge}>
          <Clock size={16} color={Theme.colors.primary} />
          <Text style={styles.timerBadgeText}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{score} XP</Text>
        </View>
      </View>

      <View style={styles.timerBarContainer}>
        <LinearGradient
          colors={Theme.colors.gradients.primary}
          style={[styles.timerBarFill, { width: `${(timeLeft / 60) * 100}%` }]}
        />
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
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.letterTile,
                selections.includes(i) && styles.tileUsed,
                pressed && !selections.includes(i) && { transform: [{ scale: 0.95 }], opacity: 0.8 }
              ]}
              onPress={() => selectLetter(i)}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.backspace} onPress={clearLast}>
          <Eraser size={20} color={Theme.colors.textMuted} />
          <Text style={styles.backspaceText}>CLEAR LAST</Text>
        </Pressable>
      </View>

      {feedback && (
        <View style={styles.feedbackOverlay}>
          {feedback === 'correct' ? (
            <Check size={90} color={Theme.colors.success} strokeWidth={4} />
          ) : (
            <X size={90} color={Theme.colors.error} strokeWidth={4} />
          )}
        </View>
      )}
    </View>
  );

  const renderGameOver = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
        <Trophy size={60} color={Theme.colors.warning} style={styles.overIcon} />
        <Text style={styles.overTitle}>Time's Up!</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>FINAL SCORE</Text>
            <Text style={styles.resultValue}>{score}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>XP EARNED</Text>
            <Text style={styles.resultValue}>+{score}</Text>
          </View>
        </View>

        <View style={styles.overActions}>
          <Pressable style={styles.mainButton} onPress={startGame}>
            <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
            <Text style={styles.secondaryButtonText}>Return to Training</Text>
          </Pressable>
        </View>
      </LinearGradient>
      <View style={{ height: insets.bottom }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill}>
        {gameState === 'start' && renderStart()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'gameOver' && renderGameOver()}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    marginBottom: 24,
  },
  featureList: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
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
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginBottom: 24,
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  timerBadgeText: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '800',
  },
  scoreBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  scoreBadgeText: {
    fontSize: 14,
    color: Theme.colors.accent,
    fontWeight: '800',
  },
  timerBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 40,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordDisplay: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 80,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  displaySlot: {
    width: 40,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  slotActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  displayText: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  scrambledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 40,
  },
  letterTile: {
    width: 54,
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tileUsed: {
    opacity: 0.2,
    transform: [{ scale: 0.9 }],
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  letterText: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  backspace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  backspaceText: {
    color: Theme.colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  gameOverCard: {
    padding: 32,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overIcon: {
    marginBottom: 20,
  },
  overTitle: {
    fontSize: 32,
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
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    color: Theme.colors.text,
    fontWeight: '900',
  },
  overActions: {
    width: '100%',
    gap: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    fontWeight: '700',
  },
});

export default WordBuilderGame;