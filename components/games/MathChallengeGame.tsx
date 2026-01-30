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
  Timer,
  Calculator,
  Zap,
  TrendingUp,
  Trophy
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Operation = '+' | '-' | '*' | '/';

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  options: number[];
  answer: number;
}

const MathChallengeGame = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const generateQuestion = useCallback((currentLevel: number) => {
    const operations: Operation[] = ['+', '-', '*'];
    if (currentLevel > 3) operations.push('/');

    const op = operations[Math.floor(Math.random() * operations.length)];
    let n1, n2, ans;

    switch (op) {
      case '+':
        n1 = Math.floor(Math.random() * (10 * currentLevel)) + 1;
        n2 = Math.floor(Math.random() * (10 * currentLevel)) + 1;
        ans = n1 + n2;
        break;
      case '-':
        n1 = Math.floor(Math.random() * (10 * currentLevel)) + 10;
        n2 = Math.floor(Math.random() * n1) + 1;
        ans = n1 - n2;
        break;
      case '*':
        n1 = Math.floor(Math.random() * (5 + currentLevel)) + 2;
        n2 = Math.floor(Math.random() * (5 + Math.floor(currentLevel / 2))) + 2;
        ans = n1 * n2;
        break;
      case '/':
        ans = Math.floor(Math.random() * (5 + currentLevel)) + 2;
        n2 = Math.floor(Math.random() * 10) + 2;
        n1 = ans * n2;
        break;
      default:
        n1 = 1; n2 = 1; ans = 2;
    }

    const options = [ans];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAns = ans + (offset === 0 ? 3 : offset);
      if (!options.includes(wrongAns) && wrongAns >= 0) {
        options.push(wrongAns);
      }
    }

    setCurrentQuestion({
      num1: n1,
      num2: n2,
      operation: op,
      options: options.sort(() => Math.random() - 0.5),
      answer: ans,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setLevel(1);
    generateQuestion(1);
  };

  const handleAnswer = (selected: number) => {
    if (!currentQuestion || feedback) return;

    if (selected === currentQuestion.answer) {
      setFeedback('correct');
      setScore(s => s + 10);
      if ((score + 10) % 50 === 0) setLevel(l => l + 1);

      setTimeout(() => {
        setFeedback(null);
        generateQuestion(level);
      }, 600);
    } else {
      setFeedback('wrong');
      Vibration.vibrate(200);
      setTimeout(() => {
        setFeedback(null);
      }, 600);
    }
  };

  useEffect(() => {
    let timer: any;
    const isActive = gameState === 'playing';
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setGameState('gameOver');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const renderStart = () => (
    <View style={styles.content}>
      <LinearGradient
        colors={Theme.colors.gradients.glass}
        style={styles.gameCard}
      >
        <View style={styles.iconCircle}>
          <Calculator size={40} color={Theme.colors.primary} />
        </View>
        <Text style={styles.gameTitle}>Math Challenge</Text>
        <Text style={styles.gameDesc}>Enhance your mental agility with rapid arithmetic problems. How many can you solve in 30 seconds?</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Zap size={16} color={Theme.colors.accent} />
            <Text style={styles.featureText}>Instant Feedback</Text>
          </View>
          <View style={styles.featureItem}>
            <TrendingUp size={16} color={Theme.colors.secondary} />
            <Text style={styles.featureText}>Scaling Difficulty</Text>
          </View>
        </View>

        <Pressable style={styles.mainButton} onPress={startGame}>
          <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Play size={20} color="white" fill="white" />
            <Text style={styles.buttonText}>Begin Training</Text>
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
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{score} XP</Text>
        </View>
      </View>

      <View style={styles.timerBarContainer}>
        <LinearGradient
          colors={Theme.colors.gradients.primary}
          style={[styles.timerBarFill, { width: `${(timeLeft / 30) * 100}%` }]}
        />
      </View>

      <Animated.View style={[styles.questionArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {currentQuestion && (
          <>
            <View style={styles.equation}>
              <Text style={styles.numberText}>{currentQuestion.num1}</Text>
              <Text style={styles.opText}>{currentQuestion.operation}</Text>
              <Text style={styles.numberText}>{currentQuestion.num2}</Text>
              <Text style={styles.equalText}>=</Text>
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>?</Text>
              </View>
            </View>

            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((opt, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.optionButton,
                    feedback === 'correct' && opt === currentQuestion.answer && styles.correctOption,
                    feedback === 'wrong' && opt !== currentQuestion.answer && styles.wrongOption,
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
            <Check size={80} color={Theme.colors.success} strokeWidth={3} />
          ) : (
            <X size={80} color={Theme.colors.error} strokeWidth={3} />
          )}
        </View>
      )}
    </View>
  );

  const renderGameOver = () => (
    <View style={styles.content}>
      <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
        <Trophy size={60} color={Theme.colors.warning} style={styles.overIcon} />
        <Text style={styles.overTitle}>Excellent Work!</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>SCORE</Text>
            <Text style={styles.resultValue}>{score}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>MAX LEVEL</Text>
            <Text style={styles.resultValue}>{level}</Text>
          </View>
        </View>

        <View style={styles.overActions}>
          <Pressable style={styles.mainButton} onPress={startGame}>
            <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.buttonText}>Play Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
            <Text style={styles.secondaryButtonText}>Back to Hub</Text>
          </Pressable>
        </View>
      </LinearGradient>
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
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  gradient: {
    flex: 1,
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
  levelBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  levelBadgeText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
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
  questionArea: {
    flex: 1,
    justifyContent: 'center',
  },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 60,
  },
  numberText: {
    fontSize: 48,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
  },
  opText: {
    fontSize: 32,
    color: Theme.colors.secondary,
    fontWeight: '700',
  },
  equalText: {
    fontSize: 32,
    color: Theme.colors.textMuted,
    fontWeight: '700',
  },
  placeholderContainer: {
    width: 60,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 32,
    color: Theme.colors.primary,
    fontWeight: '800',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  optionButton: {
    width: (width - 64) / 2,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    fontSize: 32,
    color: Theme.colors.text,
    fontWeight: '800',
  },
  correctOption: {
    borderColor: Theme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  wrongOption: {
    borderColor: Theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
  },
  resultLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
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

export default MathChallengeGame;