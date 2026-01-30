import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Theme } from "@/constants/Theme"
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
} from "lucide-react-native"
import { Dimensions, Pressable, StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { useState } from "react"
const { width } = Dimensions.get("window")
const screenPadding = 24
const cardSpacing = 12
const cardWidth = (width - screenPadding * 2 - cardSpacing) / 2

const games = [
  {
    id: "1",
    name: "Hangman",
    route: "/game/hangman" as const,
    description: "Guess the word letter by letter",
    icon: Type,
    difficulty: "Easy",
    category: "Word",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Memory Match",
    route: "/game/memory" as const,
    description: "Match pairs and test your memory",
    icon: Brain,
    difficulty: "Medium",
    category: "Memory",
    rating: 4.9,
  },
  {
    id: "3",
    name: "Math Challenge",
    route: "/game/math-challenge" as const,
    description: "Solve equations against the clock",
    icon: Calculator,
    difficulty: "Hard",
    category: "Math",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Logic Puzzle",
    route: "/game/logic-puzzle" as const,
    description: "Exercise your logical thinking",
    icon: Puzzle,
    difficulty: "Hard",
    category: "Logic",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Reaction Time",
    route: "/game/reaction-time" as const,
    description: "Test your reflexes and speed",
    icon: Zap,
    difficulty: "Easy",
    category: "Speed",
    rating: 4.5,
  },
  {
    id: "6",
    name: "Word Builder",
    route: "/game/word-builder" as const,
    description: "Create words from given letters",
    icon: Gamepad2,
    difficulty: "Medium",
    category: "Word",
    rating: 4.4,
  },
  {
    id: "7",
    name: "Minesweep",
    route: "/game/minesweep" as const,
    description: "Answer questions across topics",
    icon: HelpCircle,
    difficulty: "Medium",
    category: "Strategy",
    rating: 4.3,
  },
  {
    id: "8",
    name: "Odd One Out",
    route: "/game/odd-one-out" as const,
    description: "Find the item that doesn't belong",
    icon: X,
    difficulty: "Medium",
    category: "Logic",
    rating: 4.2,
  },


]

const categories = ["All", "Word", "Memory", "Math", "Logic", "Speed", "Strategy"]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "#10b981"
    case "Medium":
      return "#f59e0b"
    case "Hard":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

export default function GamesScreen() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGames = games.filter((game) => {
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const renderGameCard = (game: (typeof games)[0]) => {
    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => router.push(game.route)}
        android_ripple={{ color: "rgba(255,255,255,0.1)" }}
      >
        <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
              <game.icon size={24} color="#10b981" strokeWidth={2} />
            </View>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={[styles.ratingText, { color: "white" }]}>{game.rating}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.gameName, { color: "white" }]}>{game.name}</Text>
            <Text style={[styles.gameDescription, { color: "rgba(255,255,255,0.7)" }]}>{game.description}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
              <Text style={styles.difficultyText}>{game.difficulty}</Text>
            </View>
            <View style={[styles.playButton, { backgroundColor: "#10b981" }]}>
              <Play size={14} color="white" fill="white" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    )
  }

  const renderCategoryButton = (category: string) => (
    <Pressable
      key={category}
      style={[
        styles.categoryButton,
        { backgroundColor: selectedCategory === category ? "#10b981" : "rgba(255,255,255,0.1)" },
        selectedCategory === category && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[styles.categoryText, { color: selectedCategory === category ? "white" : "rgba(255,255,255,0.7)" }]}>
        {category}
      </Text>
    </Pressable>
  )

  return (
    <LinearGradient colors={["#1a1a1a", "#000000"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: "white" }]}>BrainBoost</Text>
          <Text style={[styles.headerSubtitle, { color: "rgba(255,255,255,0.8)" }]}>Choose your challenge</Text>

          {/* Search Bar */}
          <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.searchContainer}>
            <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: "white" }]}
              placeholder="Search games..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Games Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>
            {selectedCategory === "All" ? "All Games" : `${selectedCategory} Games`}
          </Text>
          <View style={styles.gamesGrid}>
            {filteredGames.map((game) => (
              <View key={game.id} style={styles.gameWrapper}>
                {renderGameCard(game)}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: 80,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: screenPadding,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  selectedCategoryButton: {
    backgroundColor: "#10b981",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    paddingHorizontal: screenPadding,
    marginBottom: 16,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: screenPadding,
    justifyContent: "space-between",
  },
  gameWrapper: {
    marginBottom: 16,
  },
  cardContainer: {
    width: cardWidth,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
    marginBottom: 16,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  gameDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
})
