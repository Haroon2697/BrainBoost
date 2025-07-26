import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ReactionTapGame() {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'history'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [reactionHistory, setReactionHistory] = useState<number[]>([]);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [focusMode, setFocusMode] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

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
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 250, useNativeDriver: true })
        ])
      ).start();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current!);
      Alert.alert('Too Soon!', 'Wait for the signal.');
      setGameState('idle');
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
    }
  };

  const getBackgroundColor = () => {
    if (gameState === 'ready') return '#4CAF50';
    if (gameState === 'waiting') return '#888';
    if (gameState === 'result') return '#222';
    return '#000';
  };

  const renderHistoryChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.text}>Reaction Time History</Text>
      <LineChart
        data={{
          labels: reactionHistory.map((_, i) => (i + 1).toString()),
          datasets: [{ data: reactionHistory }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="ms"
        chartConfig={{
          backgroundGradientFrom: '#000',
          backgroundGradientTo: '#000',
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: () => '#fff',
        }}
        style={{ borderRadius: 16 }}
      />
      <Button title="Back" onPress={() => setGameState('idle')} />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
        {gameState === 'idle' && (
          <>
            <Button title="Start Reaction Test" onPress={startGame} />
            <Button title="View Stats" onPress={() => setGameState('history')} />
            <Button
              title={focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
              onPress={() => setFocusMode(!focusMode)}
            />
          </>
        )}

        {gameState === 'waiting' && <Text style={styles.text}>Wait for green...</Text>}

        {gameState === 'ready' && (
          <Animated.Text style={[styles.text, { transform: [{ scale: scaleAnim }] }]}>TAP NOW!</Animated.Text>
        )}

        {gameState === 'result' && (
          <>
            <Text style={styles.text}>Your Reaction Time: {reactionTime} ms</Text>
            {!focusMode && bestTime && <Text style={styles.text}>Best Time: {bestTime} ms</Text>}
            {!focusMode && reactionHistory.length > 0 && (
              <Text style={styles.text}>Average Time: {averageTime} ms</Text>
            )}
            <Button title="Try Again" onPress={startGame} />
          </>
        )}

        {gameState === 'history' && renderHistoryChart()}
      </View>
    </TouchableWithoutFeedback>
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
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
