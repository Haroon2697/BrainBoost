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
import { Play, RotateCcw, Check, X, BrainCircuit, Lightbulb } from 'lucide-react-native';

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
        question: "What's the next number in the sequence?",
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
        question: "If 2 , 3 → 8 and 3 , 4 → 15. What is this?",
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
      <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.gameCard}>
        <BrainCircuit size={48} color="#fff" />
        <Text style={styles.gameTitle}>Logic Puzzle</Text>
        <Text style={styles.gameDesc}>Test your IQ with pattern recognition and sequence puzzles. One mistake costs a life!</Text>
        <TouchableOpacity style={styles.mainButton} onPress={startGame}>
          <Play size={24} color={Theme.colors.secondary} fill={Theme.colors.secondary} />
          <Text style={[styles.buttonText, { color: Theme.colors.secondary }]}>Challenge Brain</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={styles.livesContainer}>
          {[...Array(3)].map((_, i) => (
            <X key={i} size={24} color={i < lives ? Theme.colors.error : 'rgba(255,255,255,0.1)'} fill={i < lives ? Theme.colors.error : 'transparent'} />
          ))}
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>

      <Animated.View style={[styles.puzzleArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {currentPuzzle && (
          <>
            <View style={styles.questionCard}>
              <Lightbulb size={24} color={Theme.colors.warning} />
              <Text style={styles.questionText}>{currentPuzzle.question}</Text>
            </View>

            <View style={styles.sequenceContainer}>
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
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionButton,
                    feedback === 'correct' && opt === currentPuzzle.answer && styles.correctOption,
                    feedback === 'wrong' && opt !== currentPuzzle.answer && styles.wrongOption,
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
            <Check size={100} color={Theme.colors.success} strokeWidth={3} />
          ) : (
            <X size={100} color={Theme.colors.error} strokeWidth={3} />
          )}
        </View>
      )}
    </View>
  );

  const renderGameOver = () => (
    <View style={styles.content}>
      <View style={styles.gameOverCard}>
        <Text style={styles.overTitle}>Gained Knowledge</Text>
        <View style={styles.finalStats}>
          <View style={styles.finalBox}>
            <Text style={styles.finalLabel}>IQ SCORE</Text>
            <Text style={styles.finalValue}>{score}</Text>
          </View>
          <View style={styles.finalBox}>
            <Text style={styles.finalLabel}>PUZZLES</Text>
            <Text style={styles.finalValue}>{level - 1}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.retryBtn} onPress={startGame}>
          <RotateCcw size={24} color="#fff" />
          <Text style={styles.retryText}>Solve More</Text>
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
  gameCard: { padding: 40, borderRadius: 32, width: '100%', alignItems: 'center', gap: 20 },
  gameTitle: { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center' },
  gameDesc: { fontSize: 16, color: '#fff', opacity: 0.9, textAlign: 'center', lineHeight: 24 },
  mainButton: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 50, gap: 12 },
  buttonText: { fontSize: 20, fontWeight: 'bold' },

  playingContainer: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 40 },
  statBox: { backgroundColor: Theme.colors.card, padding: 12, borderRadius: 16, minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { fontSize: 10, color: Theme.colors.textMuted, fontWeight: 'bold', marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900', color: Theme.colors.text },
  livesContainer: { flexDirection: 'row', gap: 8 },

  puzzleArea: { flex: 1, alignItems: 'center' },
  questionCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40, width: '100%' },
  questionText: { color: Theme.colors.text, fontSize: 18, fontWeight: '600', flex: 1 },

  sequenceContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 60 },
  seqItem: { width: 60, height: 60, backgroundColor: Theme.colors.card, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  seqText: { color: Theme.colors.text, fontSize: 24, fontWeight: 'bold' },
  targetItem: { backgroundColor: Theme.colors.card, borderColor: Theme.colors.accent, borderWidth: 2 },
  targetText: { color: Theme.colors.accent, fontSize: 24, fontWeight: '900' },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
  optionButton: { width: (width - 70) / 2, height: 70, backgroundColor: Theme.colors.card, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)' },
  optionText: { color: Theme.colors.text, fontSize: 24, fontWeight: 'bold' },
  correctOption: { borderColor: Theme.colors.success, backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  wrongOption: { borderColor: Theme.colors.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' },

  feedbackOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' },

  gameOverCard: { backgroundColor: Theme.colors.card, padding: 40, borderRadius: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  overTitle: { fontSize: 32, fontWeight: '900', color: Theme.colors.text, marginBottom: 30, textAlign: 'center' },
  finalStats: { flexDirection: 'row', gap: 20, marginBottom: 40 },
  finalBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 24, alignItems: 'center', flex: 1 },
  finalLabel: { fontSize: 12, color: Theme.colors.textMuted, fontWeight: 'bold', marginBottom: 5 },
  finalValue: { fontSize: 28, fontWeight: '900', color: Theme.colors.accent },
  retryBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20, gap: 12 },
  retryText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

export default LogicPuzzleGame;