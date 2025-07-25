import React, { useState, useEffect } from 'react';
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

const MAX_GUESSES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const hangmanStages = ['😃', '😐', '😕', '😣', '😖', '😭', '💀'];
type Difficulty = 'easy' | 'medium' | 'hard';

export default function HangmanGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWord = async () => {
    setLoading(true);
    const newWord = await fetchWord(difficulty);
    setWord(newWord.toUpperCase());
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setLoading(false);
  };

  useEffect(() => {
    loadWord();
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

  const isWin = word.split('').every((char) => guessedLetters.includes(char));

  const displayWord = word.split('').map((char, index) => (
    <Text key={index} style={styles.letter}>
      {guessedLetters.includes(char) ? char : '_'}
    </Text>
  ));

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

      <Text style={styles.hangman}>{hangmanStages[wrongGuesses]}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 30 }} />
      ) : (
        <>
          <View style={styles.wordContainer}>{displayWord}</View>

          <Text style={styles.status}>
            Wrong guesses: {wrongGuesses} / {MAX_GUESSES}
          </Text>

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  picker: {
    width: 150,
    height: 40,
    marginVertical: 10,
    ...Platform.select({
      android: { color: '#000' },
    }),
  },
  hangman: {
    fontSize: 48,
    marginVertical: 10,
  },
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
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
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
  keyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});
