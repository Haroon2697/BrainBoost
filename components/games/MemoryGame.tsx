import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';

const GRID_SIZE = 3;
const TILE_FLASH_TIME = 600;
const MAX_SEQUENCE = 20;

const tileSize = Dimensions.get('window').width / GRID_SIZE - 20;

const getRandomCoord = (): { row: number; col: number } => {
  return {
    row: Math.floor(Math.random() * GRID_SIZE),
    col: Math.floor(Math.random() * GRID_SIZE),
  };
};

export default function MemoryGame() {
  const [sequence, setSequence] = useState<{ row: number; col: number }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'success' | 'fail' | 'won'>('idle');
  const [round, setRound] = useState(1);

  const keyFromCoord = (r: number, c: number) => `${r}-${c}`;

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const first = getRandomCoord();
    setSequence([first]);
    setStatus('idle');
    setRound(1);
    setSelectedTiles([]);
    setCurrentStep(0);
    flashSequence([first]);
  };

  const flashSequence = async (seq: { row: number; col: number }[]) => {
    setFlashing(true);
    setSelectedTiles([]);
    for (let i = 0; i < seq.length; i++) {
      const { row, col } = seq[i];
      setActiveTile(keyFromCoord(row, col));
      await new Promise(res => setTimeout(res, TILE_FLASH_TIME));
      setActiveTile(null);
      await new Promise(res => setTimeout(res, 300));
    }
    setFlashing(false);
    setStatus('playing');
  };

  const handleTilePress = (row: number, col: number) => {
    if (flashing || status !== 'playing') return;

    const key = keyFromCoord(row, col);
    setSelectedTiles(prev => [...prev, key]);

    const correct = sequence[currentStep];
    if (correct.row === row && correct.col === col) {
      if (currentStep + 1 === sequence.length) {
        if (sequence.length === MAX_SEQUENCE) {
          setStatus('won');
          return;
        }
        setStatus('success');
        const nextCoord = getRandomCoord();
        const newSeq = [...sequence, nextCoord];
        setTimeout(() => {
          setSequence(newSeq);
          setCurrentStep(0);
          setRound(newSeq.length);
          flashSequence(newSeq);
        }, 1000);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setStatus('fail');
    }
  };

  const renderTile = (row: number, col: number) => {
    const key = keyFromCoord(row, col);
    const isActive = activeTile === key;
    const isSelected = selectedTiles.includes(key);

    return (
      <TouchableOpacity
        key={key}
        onPress={() => handleTilePress(row, col)}
        style={[
          styles.tile,
          isActive && styles.activeTile,
          isSelected && styles.selectedTile,
          status === 'fail' && styles.wrongTile,
        ]}
        disabled={flashing || status !== 'playing'}
      />
    );
  };

  return (
    <View>
      <Text style={styles.title}>Memory Challenge</Text>
      <Text style={styles.round}>🧠 Round: {round}/20</Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: GRID_SIZE }).map((_, col) =>
              renderTile(row, col)
            )}
          </View>
        ))}
      </View>

      <Text style={styles.message}>
        {status === 'success'
          ? '✅ Good job!'
          : status === 'fail'
          ? '❌ Oops! Try again'
          : status === 'won'
          ? '🏆 You completed all 20 rounds!'
          : ''}
      </Text>

      {status === 'fail' && (
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      )}

      {status === 'won' && (
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#fff',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
  },
  round: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    width: tileSize,
    height: tileSize,
    margin: 5,
    backgroundColor: '#444',
    borderRadius: 10,
  },
  activeTile: {
    backgroundColor: '#00f6ff',
  },
  selectedTile: {
    backgroundColor: '#00f6ff55',
  },
  wrongTile: {
    backgroundColor: '#ff3b3b',
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00f6ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
