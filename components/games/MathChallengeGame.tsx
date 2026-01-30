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
import { Play, RotateCcw, Home, Check, X, Timer } from 'lucide-react-native';

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
        colors={Theme.colors.gradients.primary}
        style={styles.gameCard}
      >
        <Text style={styles.gameTitle}>Math Challenge</Text>
        <Text style={styles.gameDesc}>Solve basic arithmetic problems as fast as you can! Speed and accuracy are key.</Text>
        <TouchableOpacity style={styles.mainButton} onPress={startGame}>
          <Play size={24} color="#000" fill="#000" />
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Timer size={18} color={Theme.colors.textMuted} />
          <Text style={styles.statText}>{timeLeft}s</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statText}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statText}>{level}</Text>
        </View>
      </View>

      <Animated.View style={[styles.questionArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {currentQuestion && (
          <>
            <View style={styles.equation}>
              <Text style={styles.numberText}>{currentQuestion.num1}</Text>
              <Text style={styles.opText}>{currentQuestion.operation}</Text>
              <Text style={styles.numberText}>{currentQuestion.num2}</Text>
              <Text style={styles.opText}>=</Text>
              <Text style={styles.numberText}>?</Text>
            </View>

            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionButton,
                    feedback === 'correct' && opt === currentQuestion.answer && styles.correctOption,
                    feedback === 'wrong' && opt !== currentQuestion.answer && styles.wrongOption,
                  ]}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
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
      <View style={styles.gameOverCard}>
        <Text style={styles.overTitle}>Time's Up!</Text>
        <Text style={styles.finalScore}>Score: {score}</Text>
        <Text style={styles.levelReached}>Level reached: {level}</Text>

        <View style={styles.overActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={startGame}>
            <RotateCcw size={20} color={Theme.colors.text} />
            <Text style={styles.actionText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
    gap: 16,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  gameDesc: {
    fontSize: 16,
    color: '#000',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  mainButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    gap: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  playingContainer: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginBottom: 40,
  },
  statBox: {
    backgroundColor: Theme.colors.card,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.text,
  },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 50,
  },
  numberText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  opText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.accent,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    width: '100%',
  },
  optionButton: {
    width: (width - 70) / 2,
    height: 80,
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  gameOverCard: {
    backgroundColor: Theme.colors.card,
    padding: 40,
    borderRadius: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: Theme.colors.text,
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    color: Theme.colors.accent,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelReached: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 30,
  },
  overActions: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
});

export default MathChallengeGame;