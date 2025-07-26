/**
 * ReactionTapGame.tsx
 * Advanced Reaction Tap Game with Offline Multiplayer, History, Stats, Focus Mode, and Animations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Custom Button component to replace react-native-paper Button
const CustomButton = ({ mode, onPress, style, children }: any) => {
  const buttonStyle = [
    styles.customButton,
    mode === 'contained' && styles.containedButton,
    mode === 'outlined' && styles.outlinedButton,
    mode === 'contained-tonal' && styles.tonalButton,
    style,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Text style={[
        styles.buttonText,
        mode === 'contained' && styles.containedButtonText,
        mode === 'outlined' && styles.outlinedButtonText,
        mode === 'contained-tonal' && styles.tonalButtonText,
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default function ReactionTapGame() {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'history' | 'multiplayer'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [reactionHistory, setReactionHistory] = useState<number[]>([]);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [focusMode, setFocusMode] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [players, setPlayers] = useState([{ name: 'Player 1', score: null as number | null }, { name: 'Player 2', score: null as number | null }]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimestamp = useRef<number>(0);

  useEffect(() => {
    loadHighScore();
    loadHistory();
  }, []);

  const getRandomDelay = () => Math.floor(Math.random() * 4000) + 1000;

  const loadHighScore = async () => {
    const storedBest = await AsyncStorage.getItem('bestReactionTime');
    if (storedBest) setBestTime(Number(storedBest));
  };

  const saveHighScore = async (time: number) => {
    await AsyncStorage.setItem('bestReactionTime', time.toString());
  };

  const saveHistory = async (updated: number[]) => {
    await AsyncStorage.setItem('reactionHistory', JSON.stringify(updated));
  };

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('reactionHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      setReactionHistory(parsed);
      updateAverage(parsed);
    }
  };

  const updateAverage = (times: number[]) => {
    if (times.length === 0) return;
    const sum = times.reduce((a, b) => a + b, 0);
    setAverageTime(Math.round(sum / times.length));
  };

  const startGame = () => {
    setReactionTime(null);
    setGameState('waiting');

    const delay = getRandomDelay();
    timeoutRef.current = setTimeout(() => {
      startTimestamp.current = Date.now();
      setGameState('ready');
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.4, duration: 250, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current!);
      Alert.alert('Too Soon!', 'Wait for the signal.');
      setGameState('idle');
      setIsMultiplayerMode(false);
      return;
    }

    if (gameState === 'ready') {
      Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }).stop();
      const reaction = Date.now() - startTimestamp.current;
      Haptics.selectionAsync();
      setReactionTime(reaction);

      const updatedHistory = [...reactionHistory, reaction].slice(-20);
      setReactionHistory(updatedHistory);
      updateAverage(updatedHistory);
      saveHistory(updatedHistory);
      setGameState('result');

      if (bestTime === null || reaction < bestTime) {
        setBestTime(reaction);
        saveHighScore(reaction);
      }

      // Check if we're in multiplayer mode
      if (isMultiplayerMode) {
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayer].score = reaction;
        setPlayers(updatedPlayers);

        if (currentPlayer === players.length - 1) {
          // Determine winner
          const winner = updatedPlayers.reduce((prev, curr) =>
            (prev.score !== null && curr.score !== null && prev.score < curr.score) ? prev : curr
          );
          Alert.alert(`${winner.name} wins!`, `With a time of ${winner.score} ms`);
          setGameState('idle');
          setIsMultiplayerMode(false);
          setPlayers([{ name: 'Player 1', score: null }, { name: 'Player 2', score: null }]);
        } else {
          setCurrentPlayer(currentPlayer + 1);
          startGame();
        }
      }
    }
  };

  const getBackgroundColor = () => {
    if (gameState === 'ready') return '#4CAF50';
    if (gameState === 'waiting') return '#888';
    if (gameState === 'result') return '#222';
    return '#121212';
  };

  const renderHistoryChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.text}>📊 Reaction Time History</Text>
      <LineChart
        data={{
          labels: reactionHistory.map((_, i) => (i + 1).toString()),
          datasets: [{ data: reactionHistory }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="ms"
        chartConfig={{
          backgroundGradientFrom: '#121212',
          backgroundGradientTo: '#121212',
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: () => '#fff',
        }}
        style={{ borderRadius: 16 }}
      />
      <CustomButton mode="outlined" onPress={() => setGameState('idle')}>
        Back
      </CustomButton>
    </View>
  );

  return (
    <TouchableOpacity activeOpacity={1} style={[styles.container, { backgroundColor: getBackgroundColor() }]} onPress={handleTap}>
      {gameState === 'idle' && (
        <View style={styles.menu}>
          <CustomButton mode="contained" onPress={startGame} style={styles.button}>
            🎯 Start Reaction Test
          </CustomButton>
          <CustomButton mode="contained" onPress={() => setGameState('history')} style={styles.button}>
            📈 View Stats
          </CustomButton>
          <CustomButton
            mode="contained-tonal"
            onPress={() => setFocusMode(!focusMode)}
            style={styles.button}
          >
            {focusMode ? '👁️ Show Stats' : '🧠 Focus Mode'}
          </CustomButton>
          <CustomButton mode="contained" onPress={() => {
            setCurrentPlayer(0);
            setIsMultiplayerMode(true);
            setGameState('multiplayer');
            startGame();
          }} style={styles.button}>
            👥 Multiplayer Mode
          </CustomButton>
        </View>
      )}

      {gameState === 'waiting' && <Text style={styles.text}>⏳ Wait for green...</Text>}

      {gameState === 'ready' && (
        <Animated.Text style={[styles.text, { transform: [{ scale: scaleAnim }] }]}>⚡ TAP NOW!</Animated.Text>
      )}

      {gameState === 'result' && (
        <View>
          <Text style={styles.text}>🎉 Your Reaction Time: {reactionTime} ms</Text>
          {!focusMode && bestTime && <Text style={styles.text}>🏆 Best Time: {bestTime} ms</Text>}
          {!focusMode && reactionHistory.length > 0 && (
            <Text style={styles.text}>📊 Average Time: {averageTime} ms</Text>
          )}
          <CustomButton mode="contained" onPress={startGame} style={styles.button}>
            🔁 Try Again
          </CustomButton>
        </View>
      )}

      {gameState === 'history' && renderHistoryChart()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    marginVertical: 8,
    width: 240,
    borderRadius: 16,
  },
  menu: {
    gap: 10,
    alignItems: 'center',
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  containedButton: {
    backgroundColor: '#4CAF50',
  },
  containedButtonText: {
    color: 'white',
  },
  outlinedButton: {
    borderColor: 'white',
    borderWidth: 2,
  },
  outlinedButtonText: {
    color: 'white',
  },
  tonalButton: {
    backgroundColor: '#888',
  },
  tonalButtonText: {
    color: 'white',
  },
});