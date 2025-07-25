import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Brain, Calculator, Gamepad2, Circle as HelpCircle, Play, Puzzle, Type, X, Zap } from 'lucide-react-native';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const screenPadding = 16;
const cardSpacing = 12;
const cardWidth = (width - (screenPadding * 2) - cardSpacing) / 2;

const games = [
  { 
    id: '1', 
    name: 'Hangman', 
    route: '/game/hangman' as const,
    description: 'Guess the word letter by letter',
    icon: Type,
    gradient: ['#a8edea', '#fed6e3'] as const,
    difficulty: 'Easy'
  },
  { 
    id: '2', 
    name: 'Memory Match', 
    route: '/game/memory' as const,
    description: 'Match pairs and test your memory',
    icon: Brain,
    gradient: ['#b8f4ea', '#fec6d3'] as const,
    difficulty: 'Medium'
  },
  { 
    id: '3', 
    name: 'Math Challenge', 
    route: '/game/math-challenge' as const,
    description: 'Solve equations against the clock',
    icon: Calculator,
    gradient: ['#98e4ea', '#fee6e3'] as const,
    difficulty: 'Hard'
  },
  { 
    id: '4', 
    name: 'Logic Puzzle', 
    route: '/game/logic-puzzle' as const,
    description: 'Exercise your logical thinking',
    icon: Puzzle,
    gradient: ['#c8f0ea', '#fec0d3'] as const,
    difficulty: 'Hard'
  },
  { 
    id: '5', 
    name: 'Reaction Time', 
    route: '/game/reaction-time' as const,
    description: 'Test your reflexes and speed',
    icon: Zap,
    gradient: ['#a0e8ea', '#fecce3'] as const,
    difficulty: 'Easy'
  },
  { 
    id: '6', 
    name: 'Word Builder', 
    route: '/game/word-builder' as const,
    description: 'Create words from given letters',
    icon: Gamepad2,
    gradient: ['#a8edea', '#fed6e3'] as const,
    difficulty: 'Medium'
  },
  { 
    id: '7', 
    name: 'Trivia', 
    route: '/game/trivia' as const,
    description: 'Answer questions across topics',
    icon: HelpCircle,
    gradient: ['#b0ecea', '#fecad3'] as const,
    difficulty: 'Medium'
  },
  { 
    id: '8', 
    name: 'Odd One Out', 
    route: '/game/odd-one-out' as const,
    description: 'Find the item that doesn\'t belong',
    icon: X,
    gradient: ['#a8edea', '#fed6e3'] as const,
    difficulty: 'Medium'
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return '#10b981';
    case 'Medium': return '#f59e0b';
    case 'Hard': return '#ef4444';
    default: return '#6b7280';
  }
};

export default function GamesScreen() {
  const router = useRouter();

  const renderGameCard = ({ item }: { item: typeof games[0] }) => {
    const IconComponent = item.icon;
    
    return (
      <Pressable 
        style={styles.cardContainer}
        onPress={() => router.push(item.route)}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <IconComponent size={32} color="black" strokeWidth={2} />
            </View>
            
            <Text style={styles.gameName}>{item.name}</Text>
            <Text style={styles.gameDescription}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
              
              <View style={styles.playButton}>
                <Play size={16} color="black" fill="black" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Brain Games</Text>
            <Text style={styles.headerSubtitle}>Challenge yourself with fun puzzles</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'black',
  },
  gameName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  gameDescription: {
    fontSize: 13,
    color: 'black',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  separator: {
    height: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
});