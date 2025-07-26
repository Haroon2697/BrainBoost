import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface Player {
  id: number;
  name: string;
  initials: string;
  times: number[];
  wins: number;
}

interface PlayerSetupProps {
  onStartGame: (players: Player[], difficulty: 'easy' | 'hard' | 'ultra', rounds: number) => void;
  onBack: () => void;
}

export default function PlayerSetupScreen({ onStartGame, onBack }: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', initials: 'P1', times: [], wins: 0 },
    { id: 2, name: 'Player 2', initials: 'P2', times: [], wins: 0 },
  ]);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | 'ultra'>('easy');
  const [rounds, setRounds] = useState(3);

  const updatePlayerCount = (count: number) => {
    if (count < 2 || count > 4) return;
    
    setPlayerCount(count);
    const newPlayers: Player[] = [];
    
    for (let i = 1; i <= count; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i}`,
        initials: `P${i}`,
        times: [],
        wins: 0,
      });
    }
    
    setPlayers(newPlayers);
  };

  const updatePlayerName = (id: number, name: string) => {
    const updatedPlayers = players.map(player =>
      player.id === id ? { ...player, name, initials: name.substring(0, 2).toUpperCase() } : player
    );
    setPlayers(updatedPlayers);
  };

  const handleStartGame = () => {
    // Validate player names
    const emptyNames = players.filter(p => p.name.trim() === '');
    if (emptyNames.length > 0) {
      Alert.alert('Error', 'All players must have names!');
      return;
    }

    // Check for duplicate names
    const names = players.map(p => p.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      Alert.alert('Error', 'All players must have unique names!');
      return;
    }

    onStartGame(players, difficulty, rounds);
  };

  const getDifficultyColor = (diff: 'easy' | 'hard' | 'ultra') => {
    return difficulty === diff ? '#4CAF50' : '#666';
  };

  const getRoundsColor = (roundCount: number) => {
    return rounds === roundCount ? '#4CAF50' : '#666';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 Multiplayer Setup</Text>
      
      {/* Player Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Players</Text>
        <View style={styles.buttonRow}>
          {[2, 3, 4].map(count => (
            <Text
              key={count}
              style={[
                styles.countButton,
                { backgroundColor: playerCount === count ? '#4CAF50' : '#333' }
              ]}
              onPress={() => updatePlayerCount(count)}
            >
              {count}
            </Text>
          ))}
        </View>
      </View>

      {/* Player Names */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Names</Text>
        {players.map(player => (
          <View key={player.id} style={styles.playerInput}>
            <Text style={styles.playerLabel}>Player {player.id}:</Text>
            <TextInput
              style={styles.input}
              value={player.name}
              onChangeText={(text) => updatePlayerName(player.id, text)}
              placeholder={`Player ${player.id}`}
              placeholderTextColor="#666"
              maxLength={12}
            />
          </View>
        ))}
      </View>

      {/* Difficulty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.buttonRow}>
          <Text
            style={[styles.difficultyButton, { color: getDifficultyColor('easy') }]}
            onPress={() => setDifficulty('easy')}
          >
            🟢 Easy
          </Text>
          <Text
            style={[styles.difficultyButton, { color: getDifficultyColor('hard') }]}
            onPress={() => setDifficulty('hard')}
          >
            🔶 Hard
          </Text>
          <Text
            style={[styles.difficultyButton, { color: getDifficultyColor('ultra') }]}
            onPress={() => setDifficulty('ultra')}
          >
            🔴 Ultra
          </Text>
        </View>
      </View>

      {/* Rounds */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rounds (Best of)</Text>
        <View style={styles.buttonRow}>
          {[3, 5, 7].map(roundCount => (
            <Text
              key={roundCount}
              style={[
                styles.roundButton,
                { backgroundColor: getRoundsColor(roundCount) }
              ]}
              onPress={() => setRounds(roundCount)}
            >
              {roundCount}
            </Text>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Text style={styles.backButton} onPress={onBack}>
          ← Back
        </Text>
        <Text style={styles.startButton} onPress={handleStartGame}>
          🎮 Start Game
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  countButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    textAlign: 'center',
    lineHeight: 60,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  playerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerLabel: {
    fontSize: 16,
    color: 'white',
    width: 80,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  difficultyButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    fontSize: 18,
    color: '#888',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  startButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
}); 