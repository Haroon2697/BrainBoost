import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Brain, Clock, RotateCcw, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Sample data for Odd One Out game
const sampleData = [
  {
    id: 1,
    question: "Which one doesn't belong?",
    options: [
      { id: 1, text: "Apple", category: "fruit", isCorrect: false },
      { id: 2, text: "Banana", category: "fruit", isCorrect: false },
      { id: 3, text: "Carrot", category: "vegetable", isCorrect: true },
      { id: 4, text: "Orange", category: "fruit", isCorrect: false },
    ],
    explanation: "Carrot is a vegetable, while the others are fruits."
  },
  {
    id: 2,
    question: "Find the odd one out:",
    options: [
      { id: 1, text: "Dog", category: "domestic", isCorrect: false },
      { id: 2, text: "Cat", category: "domestic", isCorrect: false },
      { id: 3, text: "Lion", category: "wild", isCorrect: true },
      { id: 4, text: "Horse", category: "domestic", isCorrect: false },
    ],
    explanation: "Lion is a wild animal, while the others are domestic animals."
  },
  {
    id: 3,
    question: "Which is different?",
    options: [
      { id: 1, text: "Red", category: "color", isCorrect: false },
      { id: 2, text: "Blue", category: "color", isCorrect: false },
      { id: 3, text: "Happy", category: "emotion", isCorrect: true },
      { id: 4, text: "Green", category: "color", isCorrect: false },
    ],
    explanation: "Happy is an emotion, while the others are colors."
  },
  {
    id: 4,
    question: "Pick the odd one:",
    options: [
      { id: 1, text: "Earth", category: "planet", isCorrect: false },
      { id: 2, text: "Mars", category: "planet", isCorrect: false },
      { id: 3, text: "Moon", category: "satellite", isCorrect: true },
      { id: 4, text: "Venus", category: "planet", isCorrect: false },
    ],
    explanation: "Moon is a satellite, while the others are planets."
  },
  {
    id: 5,
    question: "Which doesn't fit?",
    options: [
      { id: 1, text: "Piano", category: "instrument", isCorrect: false },
      { id: 2, text: "Guitar", category: "instrument", isCorrect: false },
      { id: 3, text: "Microphone", category: "equipment", isCorrect: true },
      { id: 4, text: "Violin", category: "instrument", isCorrect: false },
    ],
    explanation: "Microphone is audio equipment, while the others are musical instruments."
  },
  {
    id: 6,
    question: "Find the different one:",
    options: [
      { id: 1, text: "Winter", category: "season", isCorrect: false },
      { id: 2, text: "Summer", category: "season", isCorrect: false },
      { id: 3, text: "Rain", category: "weather", isCorrect: true },
      { id: 4, text: "Spring", category: "season", isCorrect: false },
    ],
    explanation: "Rain is a weather condition, while the others are seasons."
  },
  {
    id: 7,
    question: "Which is the odd one?",
    options: [
      { id: 1, text: "Book", category: "reading", isCorrect: false },
      { id: 2, text: "Magazine", category: "reading", isCorrect: false },
      { id: 3, text: "Television", category: "media", isCorrect: true },
      { id: 4, text: "Newspaper", category: "reading", isCorrect: false },
    ],
    explanation: "Television is electronic media, while the others are reading materials."
  },
  {
    id: 8,
    question: "Pick the different item:",
    options: [
      { id: 1, text: "Coffee", category: "beverage", isCorrect: false },
      { id: 2, text: "Tea", category: "beverage", isCorrect: false },
      { id: 3, text: "Bread", category: "food", isCorrect: true },
      { id: 4, text: "Juice", category: "beverage", isCorrect: false },
    ],
    explanation: "Bread is solid food, while the others are beverages."
  },
  {
    id: 9,
    question: "Which one is different?",
    options: [
      { id: 1, text: "Doctor", category: "profession", isCorrect: false },
      { id: 2, text: "Teacher", category: "profession", isCorrect: false },
      { id: 3, text: "Hospital", category: "place", isCorrect: true },
      { id: 4, text: "Engineer", category: "profession", isCorrect: false },
    ],
    explanation: "Hospital is a place, while the others are professions."
  },
  {
    id: 10,
    question: "Find the odd one out:",
    options: [
      { id: 1, text: "Car", category: "vehicle", isCorrect: false },
      { id: 2, text: "Bike", category: "vehicle", isCorrect: false },
      { id: 3, text: "Road", category: "infrastructure", isCorrect: true },
      { id: 4, text: "Bus", category: "vehicle", isCorrect: false },
    ],
    explanation: "Road is infrastructure, while the others are vehicles."
  }
];

export default function OddOneOutGame() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const currentQuestion = sampleData[currentQuestionIndex];

  useEffect(() => {
    if (timer > 0 && !showResult && !gameCompleted) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !showResult) {
      handleAnswer(null);
    }
  }, [timer, showResult, gameCompleted]);

  const handleAnswer = (selectedId: number | null) => {
    setSelectedAnswer(selectedId);
    setShowResult(true);

    const correctAnswer = currentQuestion.options.find(option => option.isCorrect);
    
    if (selectedId === correctAnswer?.id) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < sampleData.length - 1) {
        nextQuestion();
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimer(30);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setTimer(30);
    setStreak(0);
    setMaxStreak(0);
  };

  const getOptionStyle = (optionId: number) => {
    if (!showResult) {
      return selectedAnswer === optionId ? styles.selectedOption : styles.option;
    }

    const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect;
    const isSelected = selectedAnswer === optionId;

    if (isCorrect) {
      return styles.correctOption;
    } else if (isSelected && !isCorrect) {
      return styles.incorrectOption;
    } else {
      return styles.option;
    }
  };

  if (gameCompleted) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>🎉 Game Complete!</Text>
            <Text style={styles.scoreText}>Final Score: {score}</Text>
            <Text style={styles.streakText}>Best Streak: {maxStreak}</Text>
            <Text style={styles.accuracyText}>
              Accuracy: {Math.round((score / (sampleData.length * 10)) * 100)}%
            </Text>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back to Games</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Odd One Out</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Bar */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={20} color="#ffd700" />
            <Text style={styles.statText}>{score}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color="#ffffff" />
            <Text style={styles.statText}>{timer}s</Text>
          </View>
          <View style={styles.statItem}>
            <Brain size={20} color="#4ade80" />
            <Text style={styles.statText}>{streak}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {sampleData.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / sampleData.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={getOptionStyle(option.id)}
              onPress={() => !showResult && handleAnswer(option.id)}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation */}
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  correctOption: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  incorrectOption: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80',
  },
  explanationText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  streakText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  accuracyText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 30,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
    marginBottom: 15,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
