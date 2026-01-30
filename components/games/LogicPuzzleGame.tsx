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
import {
  Play,
  RotateCcw,
  Home,
  Check,
  X,
  BrainCircuit,
  Lightbulb,
  Trophy,
  Heart,
  TrendingUp,
  Zap
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type PuzzleType = 'sequence' | 'pattern' | 'missing_number';

interface LogicPuzzle {
  type: PuzzleType;
  sequence: (number | string)[];
  options: (number | string)[];
  answer: number | string;
  question: string;
}

const LogicPuzzleGame = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [currentPuzzle, setCurrentPuzzle] = useState<LogicPuzzle | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  const generatePuzzle = useCallback((currentLevel: number) => {
    const types: PuzzleType[] = ['sequence', 'pattern', 'missing_number'];
    const type = types[Math.floor(Math.random() * types.length)];
    let puzzle: LogicPuzzle;

    if (type === 'sequence') {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      const seq = [start, start + step, start + 2 * step, start + 3 * step];
      const ans = start + 4 * step;
      puzzle = {
        type: 'sequence',
        sequence: seq,
        options: [ans, ans + 2, ans - 2, ans + step + 1].sort(() => Math.random() - 0.5),
        answer: ans,
        question: "What's the next number?",
      };
    } else if (type === 'pattern') {
      const shapes = ['▲', '■', '●', '★'];
      const s1 = shapes[Math.floor(Math.random() * 4)];
      const s2 = shapes[Math.floor(Math.random() * 4)];
      const seq = [s1, s2, s1, s2, s1];
      const ans = s2;
      puzzle = {
        type: 'pattern',
        sequence: seq,
        options: shapes.sort(() => Math.random() - 0.5),
        answer: ans,
        question: "Complete the pattern!",
      };
    } else {
      const n1 = Math.floor(Math.random() * 5) + 1;
      const n2 = Math.floor(Math.random() * 5) + 1;
      const result = n1 * n2 + n1;
      puzzle = {
        type: 'missing_number',
        sequence: [n1, n2, result],
        options: [result, result + 1, result - 1, result + 5].sort(() => Math.random() - 0.5),
        answer: result,
        question: `If ${n1 - 1}, ${n2 - 1} → ${(n1 - 1) * (n2 - 1) + (n1 - 1)}. What is this?`,
      };
    }

    setCurrentPuzzle(puzzle);
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    generatePuzzle(1);
  };

  const handleAnswer = (selected: any) => {
    if (!currentPuzzle || feedback) return;

    if (selected === currentPuzzle.answer) {
      setFeedback('correct');
      setScore(s => s + 20);
      setTimeout(() => {
        setFeedback(null);
        setLevel(l => l + 1);
        generatePuzzle(level + 1);
      }, 800);
    } else {
      setFeedback('wrong');
      setLives(l => l - 1);
      Vibration.vibrate(200);
      if (lives <= 1) {
        setTimeout(() => {
          setFeedback(null);
          setGameState('gameOver');
        }, 800);
      } else {
        setTimeout(() => setFeedback(null), 800);
      }
    }
  };

  const renderStart = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameCard}>
        <View style={styles.iconCircle}>
          <BrainCircuit size={40} color={Theme.colors.secondary} />
        </View>
        <Text style={styles.gameTitle}>Logic Puzzle</Text>
        <Text style={styles.gameDesc}>Test your IQ with pattern recognition and complex sequence puzzles. Keep your focus sharp!</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Zap size={16} color={Theme.colors.accent} />
            <Text style={styles.featureText}>IQ Testing</Text>
          </View>
          <View style={styles.featureItem}>
            <TrendingUp size={16} color={Theme.colors.primary} />
            <Text style={styles.featureText}>Harder Puzzles</Text>
          </View>
        </View>

        <Pressable style={styles.mainButton} onPress={startGame}>
          <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Play size={20} color="white" fill="white" />
            <Text style={styles.buttonText}>Start Solving</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setGameState('start')} style={styles.backButton}>
          <Home size={20} color={Theme.colors.textMuted} />
        </Pressable>
        <View style={styles.livesContainer}>
          {[...Array(3)].map((_, i) => (
            <Heart key={i} size={20} color={i < lives ? Theme.colors.error : 'rgba(255,255,255,0.1)'} fill={i < lives ? Theme.colors.error : 'transparent'} />
          ))}
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{score} XP</Text>
        </View>
      </View>

      <Animated.View style={[styles.puzzleArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {currentPuzzle && (
          <>
            <View style={styles.questionBanner}>
              <Lightbulb size={20} color={Theme.colors.warning} />
              <Text style={styles.questionText}>{currentPuzzle.question}</Text>
            </View>

            <View style={styles.sequenceRow}>
              {currentPuzzle.sequence.map((item, i) => (
                <View key={i} style={styles.seqItem}>
                  <Text style={styles.seqText}>{item}</Text>
                </View>
              ))}
              <View style={[styles.seqItem, styles.targetItem]}>
                <Text style={styles.targetText}>?</Text>
              </View>
            </View>

            <View style={styles.optionsGrid}>
              {currentPuzzle.options.map((opt, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.optionButton,
                    feedback === 'correct' && opt === currentPuzzle.answer && styles.correctOption,
                    feedback === 'wrong' && opt !== currentPuzzle.answer && styles.wrongOption,
                    pressed && { opacity: 0.7, scale: 0.98 }
                  ]}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </Animated.View>

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
        <Text style={styles.overTitle}>Puzzle Solved!</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>TOTAL XP</Text>
            <Text style={styles.resultValue}>{score}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>PUZZLES</Text>
            <Text style={styles.resultValue}>{level - 1}</Text>
          </View>
        </View>

        <View style={styles.overActions}>
          <Pressable style={styles.mainButton} onPress={startGame}>
            <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
            <Text style={styles.secondaryButtonText}>Back to Training</Text>
          </Pressable>
        </View>
      </LinearGradient>
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
  livesContainer: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
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
  puzzleArea: {
    flex: 1,
  },
  questionBanner: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  questionText: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 60,
  },
  seqItem: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,192,203,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,192,203,0.1)',
  },
  seqText: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetItem: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: Theme.colors.secondary,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  targetText: {
    color: Theme.colors.secondary,
    fontSize: 24,
    fontWeight: '900',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  optionButton: {
    width: (width - 64) / 2,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    fontSize: 24,
    color: Theme.colors.text,
    fontWeight: '800',
  },
  correctOption: {
    borderColor: Theme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  wrongOption: {
    borderColor: Theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
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

export default LogicPuzzleGame;