import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchWord } from '../../utils/fetchWords';

// Constants
const MAX_GUESSES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const hangmanStages = ['😃', '😐', '😕', '😣', '😖', '😭', '💀'];
type Difficulty = 'easy' | 'medium' | 'hard';

export default function HangmanGame() {
  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Enhancements
  const [usedHint, setUsedHint] = useState(false); // One-time hint
  const [timer, setTimer] = useState(0); // Seconds timer
  const [wins, setWins] = useState(0); // Win counter
  const [losses, setLosses] = useState(0); // Loss counter
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Starts the gameplay timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  // Stops the gameplay timer
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Load a new word from API (or fallback JSON)
  const loadWord = async () => {
    setLoading(true);
    stopTimer();

    const newWord = await fetchWord(difficulty); // API + fallback
    setWord(newWord.toUpperCase());

    // Reset state
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setUsedHint(false);
    setTimer(0);

    setLoading(false);
    startTimer(); // Start timer for new game
  };

  // Load a word on difficulty change
  useEffect(() => {
    loadWord();
    return stopTimer;
  }, [difficulty]);

  // Handles letter guesses
  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;

    const updatedGuesses = [...guessedLetters, letter];
    setGuessedLetters(updatedGuesses);

    // Incorrect guess
    if (!word.includes(letter)) {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);

      if (nextWrong >= MAX_GUESSES) {
        setGameOver(true);
        setLosses((prev) => prev + 1);
        stopTimer();
      }
    }

    // Check win
    const allCorrect = word.split('').every((char) => updatedGuesses.includes(char));
    if (allCorrect) {
      setGameOver(true);
      setWins((prev) => prev + 1);
      stopTimer();
    }
  };

  // Reveals one letter (hint feature, only once per game)
  const useHint = () => {
    if (usedHint || gameOver) return;

    const unguessed = word.split('').filter((char) => !guessedLetters.includes(char));
    if (unguessed.length === 0) return;

    const randomLetter = unguessed[Math.floor(Math.random() * unguessed.length)];
    guessLetter(randomLetter);
    setUsedHint(true);
  };

  // Check if player won
  const isWin = word.split('').every((char) => guessedLetters.includes(char));

  // Generate letter UI (underscores and revealed letters)
  const displayWord = word.split('').map((char, index) => (
    <Text key={index} style={styles.letter}>
      {guessedLetters.includes(char) ? char : '_'}
    </Text>
  ));

  return (
    <View style={styles.container}>
      {/* Difficulty Picker */}
      <Text style={styles.label}>Select Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => setDifficulty(itemValue as Difficulty)}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      {/* Score + Timer */}
      <Text style={styles.score}>🏆 Wins: {wins} | 💀 Losses: {losses}</Text>
      <Text style={styles.timer}>⏱️ Time: {timer}s</Text>

      {/* Hangman Emoji Progress */}
      <Text style={styles.hangman}>{hangmanStages[wrongGuesses]}</Text>

      {/* Loading Spinner */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 30 }} />
      ) : (
        <>
          {/* Word Display */}
          <View style={styles.wordContainer}>{displayWord}</View>
          <Text style={styles.status}>
            Wrong guesses: {wrongGuesses} / {MAX_GUESSES}
          </Text>

          {/* Keyboard UI */}
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
                      backgroundColor: isCorrect ? '#c0f5d2' : '#f5c0c0',
                    },
                  ]}
                >
                  <Text style={styles.keyText}>{letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hint Button */}
          <TouchableOpacity
            style={[styles.hintButton, usedHint && { backgroundColor: '#ccc' }]}
            onPress={useHint}
            disabled={usedHint || gameOver}
          >
            <Text style={styles.hintText}>
              {usedHint ? 'Hint Used' : '💡 Use Hint'}
            </Text>
          </TouchableOpacity>

          {/* Game Over UI */}
          {gameOver && (
            <View style={styles.footer}>
              <Text style={styles.resultText}>
                {isWin ? '🎉 You Win!' : `💀 You Lost! Word was: ${word}`}
              </Text>
              <Button title="Play Again" onPress={loadWord} />
            </View>
          )}
        </>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  label: { fontSize: 16, marginTop: 10 },
  picker: {
    width: 150,
    height: 40,
    marginVertical: 10,
    ...Platform.select({
      android: { color: '#000' },
    }),
  },
  hangman: { fontSize: 48, marginVertical: 10 },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    flexWrap: 'wrap',
  },
  letter: {
    fontSize: 32,
    width: 30,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: '#000',
    marginHorizontal: 4,
  },
  status: { fontSize: 16, marginBottom: 10 },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  key: {
    padding: 10,
    margin: 4,
    width: 40,
    height: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  keyText: { fontSize: 16, fontWeight: 'bold' },
  hintButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffe680',
    borderRadius: 6,
  },
  hintText: { fontWeight: 'bold', color: '#333' },
  footer: { marginTop: 20, alignItems: 'center' },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  timer: { fontSize: 16, marginVertical: 5 },
  score: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
});
