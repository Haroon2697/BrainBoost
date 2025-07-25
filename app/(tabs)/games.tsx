import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const games = [
  { id: '1', name: 'Hangman', route: '/game/hangman' as const },
  { id: '2', name: 'Memory Match', route: '/game/memory' as const },
  { id: '3', name: 'Math Challenge', route: '/game/math-challenge' as const },
  { id: '4', name: 'Logic Puzzle', route: '/game/logic-puzzle' as const },
  { id: '5', name: 'Reaction Time', route: '/game/reaction-time' as const },
  { id: '6', name: 'Word Builder', route: '/game/word-builder' as const },
  { id: '7', name: 'Trivia', route: '/game/trivia' as const },
];

export default function GamesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(item.route)}>
            <Text style={styles.title}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 20,
    backgroundColor: '#e6e6fa',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
