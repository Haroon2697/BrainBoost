import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import wordBank from '../../assets/words.json';

const MAX_GUESSES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
type Difficulty = 'easy' | 'medium' | 'hard';

export default function HangmanGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateWord = (diff: Difficulty) => {
    const words = wordBank[diff];
    const random = words[Math.floor(Math.random() * words.length)];
    return random.toUpperCase();
  };

  useEffect(() => {
    setWord(generateWord(difficulty));
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
  }, [difficulty]);

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;

    const updatedGuesses = [...guessedLetters, letter];
    setGuessedLetters(updatedGuesses);

    if (!word.includes(letter)) {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= MAX_GUESSES) setGameOver(true);
    }

    const allCorrect = word.split('').every((char) => updatedGuesses.includes(char));
    if (allCorrect) setGameOver(true);
  };

  const resetGame = () => {
    setWord(generateWord(difficulty));
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
  };

  const displayWord = word
    .split('')
    .map((char) => (guessedLetters.includes(char) ? char : '_'))
    .join(' ');

  const isWin = word.split('').every((char) => guessedLetters.includes(char));

  return (
    <View style={styles.container}>
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

      <Text style={styles.word}>{displayWord}</Text>
      <Text style={styles.status}>
        Wrong guesses: {wrongGuesses} / {MAX_GUESSES}
      </Text>

      <View style={styles.keyboard}>
        {ALPHABET.map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => guessLetter(letter)}
            disabled={guessedLetters.includes(letter) || gameOver}
            style={[
              styles.key,
              guessedLetters.includes(letter) && { backgroundColor: '#ccc' }
            ]}
          >
            <Text>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {gameOver && (
        <View style={styles.footer}>
          <Text style={styles.status}>
            {isWin ? '🎉 You Win!' : `💀 You Lost! Word was: ${word}`}
          </Text>
          <Button title="Play Again" onPress={resetGame} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  label: { fontSize: 16, marginTop: 10 },
  picker: {
    width: 150,
    height: 40,
    marginVertical: 10,
    ...Platform.select({
      android: { color: '#000' }
    })
  },
  word: { fontSize: 32, letterSpacing: 4, marginVertical: 20 },
  status: { fontSize: 16, marginBottom: 10 },
  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: {
    padding: 8,
    margin: 4,
    width: 35,
    height: 35,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  footer: { marginTop: 20, alignItems: 'center' }
});
