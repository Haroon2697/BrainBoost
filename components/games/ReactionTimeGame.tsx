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
import MultiplayerResultScreen from './MultiplayerResultScreen';
import PlayerSetupScreen from './PlayerSetupScreen';

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

interface Player {
  id: number;
  name: string;
  initials: string;
  times: number[];
  wins: number;
}

export default function ReactionTapGame() {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'history' | 'multiplayer' | 'setup' | 'multiplayer-result'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [reactionHistory, setReactionHistory] = useState<number[]>([]);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [focusMode, setFocusMode] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | 'ultra'>('easy');
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false);

  // Multiplayer state
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [roundResults, setRoundResults] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlayerTransition, setIsPlayerTransition] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimestamp = useRef<number>(0);

  useEffect(() => {
    loadHighScore();
    loadHistory();
  }, []);

  // Handle countdown for player transitions
  useEffect(() => {
    if (isPlayerTransition && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setIsPlayerTransition(false);
        setCountdown(null);
        startGame();
      }
    }
  }, [countdown, isPlayerTransition]);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const motivationalMessages = [
    "⚡ Blazing fast!",
    "🔥 You're on fire!",
    "👀 Eyes like a hawk!",
    "💪 Strong reaction!",
    "🚀 Lightning reflexes!",
    "🎯 Nailed it!",
  ];

  const getRandomDelay = () => {
    switch (difficulty) {
      case 'easy':
        return Math.floor(Math.random() * 3000) + 2000; // 2–5s
      case 'hard':
        return Math.floor(Math.random() * 2000) + 500;  // 0.5–2.5s
      case 'ultra':
        return Math.floor(Math.random() * 2000) + 1000; // 1–3s + fake flash
      default:
        return 3000;
    }
  };

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

  const startRealSignal = () => {
    startTimestamp.current = Date.now();
    setGameState('ready');
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
      ])
    ).start();
  };

  const startGame = () => {
    setReactionTime(null);
    setGameState('waiting');

    const delay = getRandomDelay();
    
    if (difficulty === 'ultra') {
      const fakeFlashCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 fake flashes

      let flashes = 0;
      const fakeFlashInterval = setInterval(() => {
        if (flashes < fakeFlashCount) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          flashes++;
        } else {
          clearInterval(fakeFlashInterval);
          timeoutRef.current = setTimeout(startRealSignal, delay);
        }
      }, 500);
    } else {
      timeoutRef.current = setTimeout(startRealSignal, delay);
    }
  };

  const startMultiplayerGame = (players: Player[], selectedDifficulty: 'easy' | 'hard' | 'ultra', rounds: number) => {
    setMultiplayerPlayers(players.map(p => ({ ...p, times: [], wins: 0 })));
    setDifficulty(selectedDifficulty);
    setTotalRounds(rounds);
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setRoundResults([]);
    setCountdown(null);
    setIsPlayerTransition(false);
    setIsMultiplayerMode(true);
    setGameState('multiplayer');
    startGame();
  };

  const handleMultiplayerRoundComplete = (reaction: number) => {
    const updatedPlayers = [...multiplayerPlayers];
    updatedPlayers[currentPlayerIndex].times.push(reaction);
    setMultiplayerPlayers(updatedPlayers);

    // Check if current player has completed all their rounds
    if (currentRound === totalRounds) {
      // Current player is done, check if all players are done
      if (currentPlayerIndex === multiplayerPlayers.length - 1) {
        // All players have completed all rounds, calculate final results
        calculateFinalResults(updatedPlayers);
      } else {
        // Start countdown for next player
        setIsPlayerTransition(true);
        setCountdown(3);
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setCurrentRound(1);
      }
    } else {
      // Continue with next round for current player
      setCurrentRound(currentRound + 1);
      startGame();
    }
  };

  const calculateFinalResults = (players: Player[]) => {
    // Calculate wins for each player based on their best times
    const updatedPlayers = [...players];
    
    for (let round = 0; round < totalRounds; round++) {
      const roundTimes = updatedPlayers.map(p => p.times[round]);
      const fastestTime = Math.min(...roundTimes);
      const roundWinnerIndex = roundTimes.indexOf(fastestTime);
      updatedPlayers[roundWinnerIndex].wins++;
    }
    
    setMultiplayerPlayers(updatedPlayers);
    setGameState('multiplayer-result');
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

      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setFeedbackMessage(motivationalMessages[randomIndex]);

      if (isMultiplayerMode) {
        handleMultiplayerRoundComplete(reaction);
      } else {
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

  // Render different screens based on game state
  if (gameState === 'setup') {
    return (
      <PlayerSetupScreen
        onStartGame={startMultiplayerGame}
        onBack={() => setGameState('idle')}
      />
    );
  }

  if (gameState === 'multiplayer-result') {
    return (
      <MultiplayerResultScreen
        players={multiplayerPlayers}
        totalRounds={totalRounds}
        onPlayAgain={() => setGameState('setup')}
        onBackToMenu={() => setGameState('idle')}
      />
    );
  }

  return (
    <TouchableOpacity activeOpacity={1} style={[styles.container, { backgroundColor: getBackgroundColor() }]} onPress={handleTap}>
      {gameState === 'idle' && (
        <View style={styles.menu}>
          <View style={styles.difficultyContainer}>
            <Text style={styles.text}>Difficulty</Text>
            <View style={styles.difficultyButtons}>
              <CustomButton 
                mode={difficulty === 'easy' ? 'contained' : 'outlined'} 
                onPress={() => setDifficulty('easy')} 
                style={[styles.difficultyButton, difficulty === 'easy' && styles.easyButton]}
              >
                🟢 Easy
              </CustomButton>
              <CustomButton 
                mode={difficulty === 'hard' ? 'contained' : 'outlined'} 
                onPress={() => setDifficulty('hard')} 
                style={[styles.difficultyButton, difficulty === 'hard' && styles.hardButton]}
              >
                🔶 Hard
              </CustomButton>
              <CustomButton 
                mode={difficulty === 'ultra' ? 'contained' : 'outlined'} 
                onPress={() => setDifficulty('ultra')} 
                style={[styles.difficultyButton, difficulty === 'ultra' && styles.ultraButton]}
              >
                🔴 Ultra
              </CustomButton>
            </View>
          </View>
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
          <CustomButton mode="contained" onPress={() => setGameState('setup')} style={styles.button}>
            👥 Multiplayer Mode
          </CustomButton>
        </View>
      )}

      {gameState === 'waiting' && (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.text}>⏳ Wait for green...</Text>
          {isMultiplayerMode && (
            <View style={styles.multiplayerInfo}>
              <Text style={styles.multiplayerText}>
                {multiplayerPlayers[currentPlayerIndex]?.name}'s turn
              </Text>
              <Text style={styles.multiplayerText}>
                Round {currentRound}/{totalRounds}
              </Text>
              <Text style={styles.multiplayerText}>
                Player {currentPlayerIndex + 1} of {multiplayerPlayers.length}
              </Text>
            </View>
          )}
        </View>
      )}

      {isPlayerTransition && countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>Next Player in...</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.nextPlayerText}>
            {multiplayerPlayers[currentPlayerIndex]?.name}'s turn
          </Text>
        </View>
      )}

      {gameState === 'ready' && (
        <Animated.Text style={[styles.text, { transform: [{ scale: scaleAnim }] }]}>⚡ TAP NOW!</Animated.Text>
      )}

      {gameState === 'result' && (
        <View style={{ alignItems: 'center' }}>
          {feedbackMessage !== '' && <Text style={styles.feedback}>{feedbackMessage}</Text>}
          <Text style={styles.scoreText}>🎉 Your Reaction Time: {reactionTime} ms</Text>
          {!focusMode && bestTime && <Text style={styles.scoreText}>🏆 Best Time: {bestTime} ms</Text>}
          {!focusMode && reactionHistory.length > 0 && (
            <Text style={styles.scoreText}>📊 Average Time: {averageTime} ms</Text>
          )}
          <View style={{ alignItems: 'center', width: '100%', marginTop: 24 }}>
            <CustomButton mode="contained" onPress={startGame} style={[styles.button, { alignSelf: 'center' }]}>🔁 Try Again</CustomButton>
          </View>
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
  scoreText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },

  feedback: {
    color: '#FFD700',
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
   
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  hardButton: {
    backgroundColor: '#FFD700',
  },
  ultraButton: {
    backgroundColor: '#FF4444',
  },
  multiplayerInfo: {
    marginTop: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
  },
  multiplayerText: {
    color: 'white',
    fontSize: 18,
  },
  countdownContainer: {
    position: 'absolute',
    top: '30%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 10,
  },
  countdownNumber: {
    color: '#FFD700',
    fontSize: 60,
    fontWeight: 'bold',
  },
  nextPlayerText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
});