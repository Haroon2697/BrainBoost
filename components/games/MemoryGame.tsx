import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getFlashTime = (round: number) => {
  return Math.max(600 - (round - 1) * 20, 200);
};

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'custom' | null>(null);
  const [gridSize, setGridSize] = useState(3);
  const [sequence, setSequence] = useState<{ row: number; col: number }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const maxRounds = difficulty === 'medium' ? 40 : difficulty === 'custom' ? 50 : 20;
  const tileSize = Dimensions.get('window').width / gridSize - 20;

  const keyFromCoord = (r: number, c: number) => `${r}-${c}`;

  const getRandomCoord = (): { row: number; col: number } => {
    return {
      row: Math.floor(Math.random() * gridSize),
      col: Math.floor(Math.random() * gridSize),
    };
  };

  const resetGame = async (size: number = gridSize) => {
    const first = getRandomCoord();
    setSequence([first]);
    setStatus('idle');
    setRound(1);
    setLives(3);
    setSelectedTiles([]);
    setCurrentStep(0);
    setGridSize(size);
    flashSequence([first]);

    const savedScore = await AsyncStorage.getItem('highScore');
    if (savedScore) setHighScore(Number(savedScore));
  };

  const flashSequence = async (seq: { row: number; col: number }[]) => {
    setFlashing(true);
    for (let i = 0; i < seq.length; i++) {
      const { row, col } = seq[i];
      setActiveTile(keyFromCoord(row, col));
      await new Promise(res => setTimeout(res, getFlashTime(round)));
      setActiveTile(null);
      await new Promise(res => setTimeout(res, 300));
    }
    setFlashing(false);
    setStatus('playing');
  };

  const handleTilePress = async (row: number, col: number) => {
    if (flashing || status !== 'playing') return;

    const key = keyFromCoord(row, col);
    const correct = sequence[currentStep];

    if (correct.row === row && correct.col === col) {
      const newSelected = [...selectedTiles, key];
      setSelectedTiles(newSelected);

      if (currentStep + 1 === sequence.length) {
        if (sequence.length >= maxRounds) {
          setStatus('success');
          if (round > highScore) {
            await AsyncStorage.setItem('highScore', round.toString());
            setHighScore(round);
          }
          return;
        }

        const next = [...sequence, getRandomCoord()];
        setStatus('idle');
        setRound(prev => prev + 1);
        setSelectedTiles([]);
        setCurrentStep(0);
        setSequence(next);
        flashSequence(next);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      triggerShake();
      if (lives > 1) {
        setLives(prev => prev - 1);
        setSelectedTiles([]);
        setCurrentStep(0);
      } else {
        setStatus('fail');
      }
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const renderTile = (row: number, col: number) => {
    const key = keyFromCoord(row, col);
    const isActive = activeTile === key;
    const wasTapped = selectedTiles.includes(key);
    return (
      <TouchableOpacity
        key={key}
        onPress={() => handleTilePress(row, col)}
        style={[
          styles.tile,
          { width: tileSize, height: tileSize },
          isActive && styles.activeTile,
          wasTapped && styles.tappedTile,
        ]}
        disabled={flashing}
      />
    );
  };

  if (!difficulty) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Difficulty</Text>
        <TouchableOpacity style={styles.button} onPress={() => { setDifficulty('easy'); resetGame(3); }}>
          <Text style={styles.buttonText}>🟢 Easy (3x3)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setDifficulty('medium'); resetGame(4); }}>
          <Text style={styles.buttonText}>🟡 Medium (4x4)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setDifficulty('custom'); resetGame(5); }}>
          <Text style={styles.buttonText}>🔧 Hard (5x5)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = Math.min(round / maxRounds, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Tile Game</Text>
      <Text style={styles.message}>Round: {round} / {maxRounds}</Text>
      <Text style={styles.message}>Lives: {'❤️'.repeat(lives)}</Text>
      <Text style={styles.message}>High Score: {highScore}</Text>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View style={[styles.grid, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: gridSize }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: gridSize }).map((_, col) => renderTile(row, col))}
          </View>
        ))}
      </Animated.View>

      <Text style={styles.message}>
        {status === 'success'
          ? '🏆 You completed all rounds!'
          : status === 'fail'
          ? '❌ Game Over'
          : ''}
      </Text>

      {status === 'fail' && (
        <TouchableOpacity style={styles.button} onPress={() => resetGame(gridSize)}>
          <Text style={styles.buttonText}>🔁 Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  message: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 5,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00f6ff',
    borderRadius: 5,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    margin: 5,
    backgroundColor: '#444',
    borderRadius: 10,
  },
  activeTile: {
    backgroundColor: '#00f6ff',
  },
  tappedTile: {
    backgroundColor: '#00f6ff99',
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e90ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
