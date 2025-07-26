import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Player {
  id: number;
  name: string;
  initials: string;
  times: number[];
  wins: number;
}

interface MultiplayerResultProps {
  players: Player[];
  totalRounds: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function MultiplayerResultScreen({ 
  players, 
  totalRounds, 
  onPlayAgain, 
  onBackToMenu 
}: MultiplayerResultProps) {
  
  const calculateStats = () => {
    const stats = players.map(player => {
      const times = player.times.filter(time => time > 0);
      const average = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      const fastest = times.length > 0 ? Math.min(...times) : 0;
      const winRate = Math.round((player.wins / totalRounds) * 100);
      
      return {
        ...player,
        average,
        fastest,
        winRate,
      };
    });

    return stats;
  };

  const getWinner = () => {
    const stats = calculateStats();
    return stats.reduce((prev, curr) => 
      curr.wins > prev.wins ? curr : prev
    );
  };

  const getBestAverage = () => {
    const stats = calculateStats();
    return stats.reduce((prev, curr) => 
      (curr.average > 0 && curr.average < prev.average) ? curr : prev
    );
  };

  const getFastestTime = () => {
    const stats = calculateStats();
    return stats.reduce((prev, curr) => 
      (curr.fastest > 0 && curr.fastest < prev.fastest) ? curr : prev
    );
  };

  const stats = calculateStats();
  const winner = getWinner();
  const bestAverage = getBestAverage();
  const fastestTime = getFastestTime();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Tournament Results</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Champion */}
        <View style={styles.championSection}>
          <Text style={styles.championTitle}>👑 Champion</Text>
          <Text style={styles.championName}>{winner.name}</Text>
          <Text style={styles.championStats}>
            {winner.wins} wins • {winner.winRate}% win rate
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best Average</Text>
            <Text style={styles.statValue}>{bestAverage.average}ms</Text>
            <Text style={styles.statPlayer}>{bestAverage.name}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fastest Time</Text>
            <Text style={styles.statValue}>{fastestTime.fastest}ms</Text>
            <Text style={styles.statPlayer}>{fastestTime.name}</Text>
          </View>
        </View>

        {/* Play Again Button - Positioned above player statistics */}
        <View style={styles.playAgainContainer}>
          <Text style={styles.playAgainButton} onPress={onPlayAgain}>
            🔄 Play Again
          </Text>
        </View>

        {/* Player Details */}
        <View style={styles.playerSection}>
          <Text style={styles.sectionTitle}>Player Statistics</Text>
          {stats.map((player, index) => (
            <View key={player.id} style={[
              styles.playerCard,
              player.id === winner.id && styles.winnerCard
            ]}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerName}>
                  {player.id === winner.id ? '👑 ' : ''}{player.name}
                </Text>
                <Text style={styles.playerRank}>#{index + 1}</Text>
              </View>
              
              <View style={styles.playerStats}>
                <View style={styles.statRow}>
                  <Text style={styles.statText}>Wins:</Text>
                  <Text style={styles.statValue}>{player.wins}/{totalRounds}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statText}>Win Rate:</Text>
                  <Text style={styles.statValue}>{player.winRate}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statText}>Average:</Text>
                  <Text style={styles.statValue}>{player.average}ms</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statText}>Best:</Text>
                  <Text style={styles.statValue}>{player.fastest}ms</Text>
                </View>
              </View>

              {/* Round Times */}
              <View style={styles.roundTimes}>
                <Text style={styles.roundTitle}>Round Times:</Text>
                <View style={styles.timeList}>
                  {player.times.map((time, roundIndex) => (
                    <Text key={roundIndex} style={[
                      styles.timeItem,
                      time === player.fastest && styles.bestTime
                    ]}>
                      R{roundIndex + 1}: {time}ms
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20, // Add space from the top
    paddingBottom: 34, // Add safe area bottom padding for devices with home indicator
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50, // Reduced since button is now above player statistics
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  backArrow: {
    fontSize: 24,
    color: '#888',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 50, // Placeholder for the empty space
  },
  championSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  championTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 10,
  },
  championName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  championStats: {
    fontSize: 16,
    color: '#ccc',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statPlayer: {
    fontSize: 12,
    color: '#ccc',
  },
  playerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  playerCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  winnerCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  playerRank: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  playerStats: {
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: '#ccc',
  },
  roundTimes: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  roundTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeItem: {
    fontSize: 12,
    color: '#ccc',
    marginRight: 15,
    marginBottom: 5,
  },
  bestTime: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  playAgainContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  playAgainButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
  },
}); 