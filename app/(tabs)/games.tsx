import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Theme } from "../../constants/Theme"
import {
  Brain,
  Calculator,
  Gamepad2,
  Circle as HelpCircle,
  Play,
  Puzzle,
  Type,
  X,
  Zap,
  Search,
  Star,
  ChevronRight,
  Clock,
  Trophy,
  Grid3X3,
  Hash,
} from "lucide-react-native"
import { Dimensions, Pressable, StyleSheet, Text, View, TextInput, ScrollView, StatusBar, ImageBackground } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState, useMemo } from "react"

const { width } = Dimensions.get("window")
const columnWidth = (width - 60) / 2

const categories = ["All", "Logic", "Math", "Memory", "Focus", "Word"]

const games = [
  {
    id: "1",
    name: "Math Challenge",
    description: "Multiplication & Speed",
    icon: Calculator,
    route: "/game/math-challenge",
    category: "Math",
    difficulty: "Medium",
    color: "#6366f1",
    rating: 4.8,
    time: "2m",
  },
  {
    id: "2",
    name: "Logic Puzzle",
    description: "IQ Pattern Mastery",
    icon: Puzzle,
    route: "/game/logic-puzzle",
    category: "Logic",
    difficulty: "Hard",
    color: "#8b5cf6",
    rating: 4.9,
    time: "5m",
  },
  {
    id: "3",
    name: "Word Builder",
    description: "Vocabulary Training",
    icon: Type,
    route: "/game/word-builder",
    category: "Word",
    difficulty: "Easy",
    color: "#ec4899",
    rating: 4.7,
    time: "3m",
  },
  {
    id: "4",
    name: "Hangman",
    description: "Classic Word Game",
    icon: HelpCircle,
    route: "/game/hangman",
    category: "Word",
    difficulty: "Medium",
    color: "#f43f5e",
    rating: 4.5,
    time: "No Limit",
  },
  {
    id: "5",
    name: "Memory Match",
    description: "Visual Grid Trainer",
    icon: Brain,
    route: "/game/memory",
    category: "Memory",
    difficulty: "Medium",
    color: "#10b981",
    rating: 4.8,
    time: "2m",
  },
  {
    id: "6",
    name: "MineSweeper",
    description: "Tactical Deduction",
    icon: Gamepad2,
    route: "/game/minesweep",
    category: "Logic",
    difficulty: "Hard",
    color: "#ef4444",
    rating: 4.6,
    time: "No Limit",
  },
  {
    id: "7",
    name: "Reaction Time",
    description: "Reflex Accuracy",
    icon: Zap,
    route: "/game/reaction-time",
    category: "Focus",
    difficulty: "Easy",
    color: "#f59e0b",
    rating: 4.9,
    time: "1m",
  },
  {
    id: "8",
    name: "Odd One Out",
    description: "Visual Focus",
    icon: Search,
    route: "/game/odd-one-out",
    category: "Focus",
    difficulty: "Medium",
    color: "#3b82f6",
    rating: 4.7,
    time: "1.5m",
  },
  {
    id: "9",
    name: "Sudoku",
    description: "Number Logic Puzzle",
    icon: Grid3X3,
    route: "/game/sudoku",
    category: "Logic",
    difficulty: "Medium",
    color: "#6366f1",
    rating: 4.9,
    time: "No Limit",
  },
  {
    id: "10",
    name: "Tic Tac Toe",
    description: "Strategy Arena",
    icon: Hash,
    route: "/game/tic-tac-toe",
    category: "Logic",
    difficulty: "Easy",
    color: "#ec4899",
    rating: 4.6,
    time: "No Limit",
  },

]

export default function GamesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || game.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const renderGameCard = (game: typeof games[0]) => {
    return (
      <Pressable
        key={game.id}
        style={styles.gameCardContainer}
        onPress={() => router.push(game.route as any)}
      >
        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${game.color}20` }]}>
              <game.icon size={22} color={game.color} strokeWidth={2.5} />
            </View>
            <View style={styles.ratingBadge}>
              <Star size={10} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{game.rating}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.gameDesc} numberOfLines={1}>{game.description}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.tagRow}>
              <View style={styles.metaInfo}>
                <Clock size={12} color={Theme.colors.textMuted} />
                <Text style={styles.metaText}>{game.time}</Text>
              </View>
              <View style={styles.metaInfo}>
                <Trophy size={12} color={Theme.colors.textMuted} />
                <Text style={styles.metaText}>{game.difficulty}</Text>
              </View>
            </View>

            <LinearGradient colors={[`${game.color}aa`, game.color]} style={styles.playButton}>
              <Play size={14} color="white" fill="white" />
            </LinearGradient>
          </View>

          {/* Decorative Background Glow */}
          <View style={[styles.cardGlow, { backgroundColor: game.color, opacity: 0.1 }]} />
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Center</Text>
        <Text style={styles.headerSubtitle}>8 specialized games for your brain</Text>

        <View style={styles.searchBarContainer}>
          <LinearGradient colors={Theme.colors.gradients.glass} style={styles.searchBar}>
            <Search size={20} color={Theme.colors.textMuted} />
            <TextInput
              placeholder="Search training..."
              placeholderTextColor={Theme.colors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryTab,
                selectedCategory === cat && { backgroundColor: Theme.colors.primary }
              ]}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === cat && { color: 'white' }
              ]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gamesScroll}>
        <View style={styles.gamesGrid}>
          {filteredGames.map(renderGameCard)}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 24,
  },
  searchBarContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryTabText: {
    color: Theme.colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  gamesScroll: {
    paddingBottom: 100,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  gameCardContainer: {
    width: columnWidth,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gameCard: {
    padding: 16,
    height: 200,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '800',
  },
  cardBody: {
    marginVertical: 12,
  },
  gameName: {
    fontSize: 18,
    color: 'white',
    fontFamily: Theme.fonts.primary,
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagRow: {
    flex: 1,
    gap: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardGlow: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: -1,
  },
})
