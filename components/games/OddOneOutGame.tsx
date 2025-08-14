"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

// Local theme object to replace ThemeContext
const theme = {
  background: ["#1a1a1a", "#000000"] as const,
  cardBackground: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"] as const,
  accent: "#10b981",
  text: "white",
  textSecondary: "rgba(255,255,255,0.7)",
  border: "rgba(255,255,255,0.1)",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",
  isDark: true
}

const { width, height } = Dimensions.get("window")

interface GameItem {
  name: string
  category: string
  isOdd: boolean
}

interface GameQuestion {
  items: GameItem[]
  explanation: string
}

interface PowerUp {
  id: string
  name: string
  description: string
  cost: number
  active: boolean
}

// Built-in question database with dynamic generation
const questionDatabase = {
  easy: [
    {
      items: [
        { name: "Apple", category: "Fruit", isOdd: false },
        { name: "Banana", category: "Fruit", isOdd: false },
        { name: "Orange", category: "Fruit", isOdd: false },
        { name: "Carrot", category: "Vegetable", isOdd: true },
      ],
      explanation: "Carrot is a vegetable, while the others are fruits.",
    },
    {
      items: [
        { name: "Dog", category: "Animal", isOdd: false },
        { name: "Cat", category: "Animal", isOdd: false },
        { name: "Bird", category: "Animal", isOdd: false },
        { name: "Fish", category: "Aquatic Animal", isOdd: true },
      ],
      explanation: "Fish lives in water, while the others are land animals.",
    },
    {
      items: [
        { name: "Red", category: "Color", isOdd: false },
        { name: "Blue", category: "Color", isOdd: false },
        { name: "Green", category: "Color", isOdd: false },
        { name: "Square", category: "Shape", isOdd: true },
      ],
      explanation: "Square is a shape, while the others are colors.",
    },
    {
      items: [
        { name: "Chair", category: "Furniture", isOdd: false },
        { name: "Table", category: "Furniture", isOdd: false },
        { name: "Bed", category: "Furniture", isOdd: false },
        { name: "Book", category: "Object", isOdd: true },
      ],
      explanation: "Book is for reading, while the others are furniture.",
    },
    {
      items: [
        { name: "Sun", category: "Celestial Body", isOdd: false },
        { name: "Moon", category: "Celestial Body", isOdd: false },
        { name: "Star", category: "Celestial Body", isOdd: false },
        { name: "Cloud", category: "Weather", isOdd: true },
      ],
      explanation: "Cloud is weather-related, while the others are celestial bodies.",
    },
    {
      items: [
        { name: "Pizza", category: "Food", isOdd: false },
        { name: "Burger", category: "Food", isOdd: false },
        { name: "Sandwich", category: "Food", isOdd: false },
        { name: "Water", category: "Drink", isOdd: true },
      ],
      explanation: "Water is a drink, while the others are solid foods.",
    },
    {
      items: [
        { name: "Car", category: "Vehicle", isOdd: false },
        { name: "Bike", category: "Vehicle", isOdd: false },
        { name: "Bus", category: "Vehicle", isOdd: false },
        { name: "Tree", category: "Plant", isOdd: true },
      ],
      explanation: "Tree is a plant, while the others are vehicles.",
    },
    {
      items: [
        { name: "Phone", category: "Electronics", isOdd: false },
        { name: "Laptop", category: "Electronics", isOdd: false },
        { name: "TV", category: "Electronics", isOdd: false },
        { name: "Pencil", category: "Stationery", isOdd: true },
      ],
      explanation: "Pencil is stationery, while the others are electronics.",
    },
    {
      items: [
        { name: "Soccer", category: "Sport", isOdd: false },
        { name: "Basketball", category: "Sport", isOdd: false },
        { name: "Tennis", category: "Sport", isOdd: false },
        { name: "Music", category: "Art", isOdd: true },
      ],
      explanation: "Music is an art form, while the others are sports.",
    },
    {
      items: [
        { name: "Doctor", category: "Profession", isOdd: false },
        { name: "Teacher", category: "Profession", isOdd: false },
        { name: "Engineer", category: "Profession", isOdd: false },
        { name: "House", category: "Building", isOdd: true },
      ],
      explanation: "House is a building, while the others are professions.",
    },
  ],
  medium: [
    {
      items: [
        { name: "Lion", category: "Big Cat", isOdd: false },
        { name: "Tiger", category: "Big Cat", isOdd: false },
        { name: "Leopard", category: "Big Cat", isOdd: false },
        { name: "Wolf", category: "Canine", isOdd: true },
      ],
      explanation: "Wolf is a canine, while the others are big cats.",
    },
    {
      items: [
        { name: "Piano", category: "String Instrument", isOdd: false },
        { name: "Guitar", category: "String Instrument", isOdd: false },
        { name: "Violin", category: "String Instrument", isOdd: false },
        { name: "Drums", category: "Percussion", isOdd: true },
      ],
      explanation: "Drums are percussion, while the others are string instruments.",
    },
    {
      items: [
        { name: "Winter", category: "Cold Season", isOdd: false },
        { name: "Spring", category: "Warm Season", isOdd: false },
        { name: "Summer", category: "Warm Season", isOdd: false },
        { name: "Fall", category: "Warm Season", isOdd: false },
      ],
      explanation: "Winter is cold, while the others are warm seasons.",
    },
    {
      items: [
        { name: "Doctor", category: "Medical Professional", isOdd: false },
        { name: "Nurse", category: "Medical Professional", isOdd: false },
        { name: "Teacher", category: "Education Professional", isOdd: true },
        { name: "Surgeon", category: "Medical Professional", isOdd: false },
      ],
      explanation: "Teacher works in education, while the others are medical professionals.",
    },
    {
      items: [
        { name: "Coffee", category: "Hot Beverage", isOdd: false },
        { name: "Tea", category: "Hot Beverage", isOdd: false },
        { name: "Hot Chocolate", category: "Hot Beverage", isOdd: false },
        { name: "Orange Juice", category: "Cold Beverage", isOdd: true },
      ],
      explanation: "Orange juice is cold, while the others are hot beverages.",
    },
    {
      items: [
        { name: "Eagle", category: "Bird of Prey", isOdd: false },
        { name: "Hawk", category: "Bird of Prey", isOdd: false },
        { name: "Falcon", category: "Bird of Prey", isOdd: false },
        { name: "Penguin", category: "Flightless Bird", isOdd: true },
      ],
      explanation: "Penguin cannot fly, while the others are birds of prey.",
    },
    {
      items: [
        { name: "Shark", category: "Ocean Fish", isOdd: false },
        { name: "Whale", category: "Ocean Mammal", isOdd: true },
        { name: "Dolphin", category: "Ocean Mammal", isOdd: false },
        { name: "Seal", category: "Ocean Mammal", isOdd: false },
      ],
      explanation: "Shark is a fish, while the others are mammals.",
    },
    {
      items: [
        { name: "Mountain", category: "Landform", isOdd: false },
        { name: "Valley", category: "Landform", isOdd: false },
        { name: "Hill", category: "Landform", isOdd: false },
        { name: "Ocean", category: "Water Body", isOdd: true },
      ],
      explanation: "Ocean is a water body, while the others are landforms.",
    },
    {
      items: [
        { name: "Fire", category: "Element", isOdd: false },
        { name: "Water", category: "Element", isOdd: false },
        { name: "Earth", category: "Element", isOdd: false },
        { name: "Metal", category: "Material", isOdd: true },
      ],
      explanation: "Metal is a material, while the others are classical elements.",
    },
    {
      items: [
        { name: "Rose", category: "Flower", isOdd: false },
        { name: "Tulip", category: "Flower", isOdd: false },
        { name: "Daisy", category: "Flower", isOdd: false },
        { name: "Cactus", category: "Plant", isOdd: true },
      ],
      explanation: "Cactus is a plant, while the others are flowers.",
    },
    {
      items: [
        { name: "Gold", category: "Precious Metal", isOdd: false },
        { name: "Silver", category: "Precious Metal", isOdd: false },
        { name: "Platinum", category: "Precious Metal", isOdd: false },
        { name: "Paper", category: "Material", isOdd: true },
      ],
      explanation: "Paper is a material, while the others are precious metals.",
    },
  ],
  hard: [
    {
      items: [
        { name: "Diamond", category: "Precious Stone", isOdd: false },
        { name: "Ruby", category: "Precious Stone", isOdd: false },
        { name: "Emerald", category: "Precious Stone", isOdd: false },
        { name: "Pearl", category: "Organic Gem", isOdd: true },
      ],
      explanation: "Pearl is organic (from oysters), while the others are mineral stones.",
    },
    {
      items: [
        { name: "Venus", category: "Terrestrial Planet", isOdd: false },
        { name: "Earth", category: "Terrestrial Planet", isOdd: false },
        { name: "Mars", category: "Terrestrial Planet", isOdd: false },
        { name: "Jupiter", category: "Gas Giant", isOdd: true },
      ],
      explanation: "Jupiter is a gas giant, while the others are rocky terrestrial planets.",
    },
    {
      items: [
        { name: "Shakespeare", category: "Playwright", isOdd: false },
        { name: "Mozart", category: "Composer", isOdd: true },
        { name: "Beethoven", category: "Composer", isOdd: false },
        { name: "Bach", category: "Composer", isOdd: false },
      ],
      explanation: "Shakespeare wrote plays, while the others composed music.",
    },
    {
      items: [
        { name: "Python", category: "Programming Language", isOdd: false },
        { name: "Java", category: "Programming Language", isOdd: false },
        { name: "JavaScript", category: "Programming Language", isOdd: false },
        { name: "HTML", category: "Markup Language", isOdd: true },
      ],
      explanation: "HTML is a markup language, while the others are programming languages.",
    },
    {
      items: [
        { name: "Soccer", category: "Team Sport", isOdd: false },
        { name: "Basketball", category: "Team Sport", isOdd: false },
        { name: "Tennis", category: "Individual Sport", isOdd: true },
        { name: "Volleyball", category: "Team Sport", isOdd: false },
      ],
      explanation: "Tennis is individual, while the others are team sports.",
    },
    {
      items: [
        { name: "Einstein", category: "Physicist", isOdd: false },
        { name: "Newton", category: "Physicist", isOdd: false },
        { name: "Darwin", category: "Biologist", isOdd: true },
        { name: "Tesla", category: "Physicist", isOdd: false },
      ],
      explanation: "Darwin was a biologist, while the others were physicists.",
    },
    {
      items: [
        { name: "Van Gogh", category: "Painter", isOdd: false },
        { name: "Picasso", category: "Painter", isOdd: false },
        { name: "Mozart", category: "Composer", isOdd: true },
        { name: "Monet", category: "Painter", isOdd: false },
      ],
      explanation: "Mozart was a composer, while the others were painters.",
    },
    {
      items: [
        { name: "DNA", category: "Genetic Material", isOdd: false },
        { name: "RNA", category: "Genetic Material", isOdd: false },
        { name: "Protein", category: "Macromolecule", isOdd: true },
        { name: "Gene", category: "Genetic Material", isOdd: false },
      ],
      explanation: "Protein is a macromolecule, while the others are genetic materials.",
    },
    {
      items: [
        { name: "Carbon", category: "Non-Metal", isOdd: false },
        { name: "Nitrogen", category: "Non-Metal", isOdd: false },
        { name: "Oxygen", category: "Non-Metal", isOdd: false },
        { name: "Iron", category: "Metal", isOdd: true },
      ],
      explanation: "Iron is a metal, while the others are non-metals.",
    },
    {
      items: [
        { name: "Democracy", category: "Government System", isOdd: false },
        { name: "Republic", category: "Government System", isOdd: false },
        { name: "Monarchy", category: "Government System", isOdd: false },
        { name: "Capitalism", category: "Economic System", isOdd: true },
      ],
      explanation: "Capitalism is an economic system, while the others are government systems.",
    },
    {
      items: [
        { name: "Hinduism", category: "Religion", isOdd: false },
        { name: "Buddhism", category: "Religion", isOdd: false },
        { name: "Christianity", category: "Religion", isOdd: false },
        { name: "Philosophy", category: "Belief System", isOdd: true },
      ],
      explanation: "Philosophy is a belief system, while the others are religions.",
    },
  ],
}

// Dynamic question generation with randomization
function generateDynamicQuestion(difficulty: "easy" | "medium" | "hard"): GameQuestion {
  const baseQuestions = questionDatabase[difficulty]
  const baseQuestion = baseQuestions[Math.floor(Math.random() * baseQuestions.length)]

  // Create variations by shuffling items and adding random elements
  const variations = [
    // Variation 1: Shuffle items
    () => {
      const shuffled = [...baseQuestion.items].sort(() => Math.random() - 0.5)
      return { ...baseQuestion, items: shuffled }
    },

    // Variation 2: Add random adjectives
    () => {
      const adjectives = ["Big", "Small", "Fast", "Slow", "Old", "New", "Red", "Blue", "Green", "Yellow"]
      const modifiedItems = baseQuestion.items.map((item) => ({
        ...item,
        name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${item.name}`,
      }))
      return { ...baseQuestion, items: modifiedItems }
    },

    // Variation 3: Change categories slightly
    () => {
      const categoryVariations: { [key: string]: string[] } = {
        Animal: ["Wild Animal", "Domestic Animal", "Pet"],
        Fruit: ["Tropical Fruit", "Citrus Fruit", "Berry"],
        Color: ["Warm Color", "Cool Color", "Primary Color"],
        Furniture: ["Living Room Furniture", "Bedroom Furniture", "Office Furniture"],
      }

      const modifiedItems = baseQuestion.items.map((item) => {
        const variations = categoryVariations[item.category] || [item.category]
        return {
          ...item,
          category: variations[Math.floor(Math.random() * variations.length)],
        }
      })
      return { ...baseQuestion, items: modifiedItems }
    },
  ]

  // Apply random variation
  const variation = variations[Math.floor(Math.random() * variations.length)]
  return variation()
}

export default function OddOneOutGame() {
  // theme is now defined locally above

  const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isCorrect, setIsCorrect] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: "doubleScore",
      name: "Double Score",
      description: "Double your score for the next question!",
      cost: 100,
      active: false,
    },
    {
      id: "timeBoost",
      name: "Time Boost",
      description: "Get an extra 10 seconds on your timer!",
      cost: 200,
      active: false,
    },
    {
      id: "skipQuestion",
      name: "Skip Question",
      description: "Skip the current question and get a point!",
      cost: 50,
      active: false,
    },
  ])

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load high score on component mount
  useEffect(() => {
    loadHighScore()
    loadStats()
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [gameState, timeLeft])

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem("oddOneOutHighScore")
      if (saved) {
        setHighScore(Number.parseInt(saved))
      }
    } catch (error) {
      console.log("Error loading high score:", error)
    }
  }

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem("oddOneOutStats")
      if (savedStats) {
        const stats = JSON.parse(savedStats)
        setMaxStreak(stats.maxStreak || 0)
        setQuestionsAnswered(stats.questionsAnswered || 0)
        setCorrectAnswers(stats.correctAnswers || 0)
      }
    } catch (error) {
      console.log("Error loading stats:", error)
    }
  }

  const saveStats = async () => {
    try {
      const stats = {
        maxStreak,
        questionsAnswered,
        correctAnswers,
        lastPlayed: new Date().toISOString(),
      }
      await AsyncStorage.setItem("oddOneOutStats", JSON.stringify(stats))
    } catch (error) {
      console.log("Error saving stats:", error)
    }
  }

  const saveHighScore = async (newScore: number) => {
    try {
      await AsyncStorage.setItem("oddOneOutHighScore", newScore.toString())
      setHighScore(newScore)
    } catch (error) {
      console.log("Error saving high score:", error)
    }
  }

  const generateNewQuestion = () => {
    setLoading(true)
    // Simulate loading for better UX
    setTimeout(() => {
      const question = generateDynamicQuestion(difficulty)
      setCurrentQuestion(question)
      setSelectedAnswer(null)
      setLoading(false)

      // Animate question appearance
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }, 500)
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setStreak(0)
    setTimeLeft(getTimeLimit())
    setQuestionsAnswered(0)
    setCorrectAnswers(0)
    generateNewQuestion()

    // Reset power-ups
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: false })))
  }

  const getTimeLimit = () => {
    switch (difficulty) {
      case "easy":
        return 45
      case "medium":
        return 30
      case "hard":
        return 20
      default:
        return 30
    }
  }

  const usePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find((p) => p.id === powerUpId)
    if (!powerUp || score < powerUp.cost) return

    setScore((prev) => prev - powerUp.cost)
    setPowerUps((prev) => prev.map((p) => (p.id === powerUpId ? { ...p, active: true } : p)))

    switch (powerUpId) {
      case "timeBoost":
        setTimeLeft((prev) => prev + 10)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case "skipQuestion":
        handleSkipQuestion()
        break
    }
  }

  const handleSkipQuestion = () => {
    setScore((prev) => prev + 50)
    setQuestionsAnswered((prev) => prev + 1)
    generateNewQuestion()
    setPowerUps((prev) => prev.map((p) => (p.id === "skipQuestion" ? { ...p, active: false } : p)))
  }

  const handleAnswer = (itemName: string) => {
    if (gameState !== "playing" || !currentQuestion) return

    setSelectedAnswer(itemName)
    const selectedItem = currentQuestion.items.find((item) => item.name === itemName)

    if (selectedItem?.isOdd) {
      // Correct answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setIsCorrect(true)

      // Calculate score based on time, difficulty, and streak
      const timeBonus = Math.floor(timeLeft * 10)
      const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2
      const streakBonus = Math.floor(streak * 20)
      let roundScore = Math.floor((100 + timeBonus + streakBonus) * difficultyMultiplier)

      // Apply double score power-up
      const doubleScoreActive = powerUps.find((p) => p.id === "doubleScore")?.active
      if (doubleScoreActive) {
        roundScore *= 2
        setPowerUps((prev) => prev.map((p) => (p.id === "doubleScore" ? { ...p, active: false } : p)))
      }

      setScore((prev) => prev + roundScore)
      setStreak((prev) => {
        const newStreak = prev + 1
        setMaxStreak((prevMax) => Math.max(prevMax, newStreak))
        return newStreak
      })
      setCorrectAnswers((prev) => prev + 1)

      // Animate correct answer
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      // Show result briefly, then continue
      setTimeout(() => {
        setIsCorrect(false)
        setSelectedAnswer(null)
        setQuestionsAnswered((prev) => prev + 1)
        generateNewQuestion()
      }, 1500)
    } else {
      // Wrong answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setIsCorrect(false)
      setStreak(0)

      // Animate wrong answer
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      // Show result briefly, then continue
      setTimeout(() => {
        setIsCorrect(false)
        setSelectedAnswer(null)
        setQuestionsAnswered((prev) => prev + 1)
        generateNewQuestion()
      }, 1500)
    }
  }

  const handleTimeUp = () => {
    setGameState("result")
    if (score > highScore) {
      saveHighScore(score)
    }
    saveStats()
  }

  const resetGame = () => {
    setGameState("idle")
    setScore(0)
    setStreak(0)
    setTimeLeft(getTimeLimit())
    setSelectedAnswer(null)
    setCurrentQuestion(null)
    setIsCorrect(false)
    setQuestionsAnswered(0)
    setCorrectAnswers(0)

    // Reset power-ups
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: false })))
  }

  const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty)
    setTimeLeft(getTimeLimit())
  }

  const getOptionStyle = (itemName: string) => {
    if (selectedAnswer !== itemName) return styles.option

    if (isCorrect) {
      return [styles.option, styles.correctAnswer]
    } else {
      return [styles.option, styles.wrongAnswer]
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAccuracy = () => {
    if (questionsAnswered === 0) return 0
    return Math.round((correctAnswers / questionsAnswered) * 100)
  }

  if (gameState === "idle") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} /> {/* Use theme status bar */}
        <LinearGradient
          colors={theme.background} // Use theme background
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]} // Use theme colors
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: theme.text }]}>←</Text> {/* Use theme text */}
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Odd One Out</Text> {/* Use theme text */}
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: theme.text }]}>Find the item that doesn't belong!</Text>{" "}
            {/* Use theme text */}
            <View style={styles.statsSection}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>High Score</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statValue, { color: theme.accent }]}>{highScore}</Text> {/* Use theme accent */}
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Max Streak</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statValue, { color: theme.accent }]}>{maxStreak}</Text> {/* Use theme accent */}
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statValue, { color: theme.accent }]}>{getAccuracy()}%</Text>{" "}
                {/* Use theme accent */}
              </View>
            </View>
            <View style={styles.difficultySection}>
              <Text style={[styles.difficultyTitle, { color: theme.text }]}>Difficulty</Text> {/* Use theme text */}
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                    difficulty === "easy" && { backgroundColor: theme.accent, borderColor: theme.accent }, // Use theme accent for active
                  ]}
                  onPress={() => handleDifficultyChange("easy")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: theme.text }, // Use theme text
                      difficulty === "easy" && { color: theme.text }, // Keep text readable on accent
                    ]}
                  >
                    Easy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                    difficulty === "medium" && { backgroundColor: theme.accent, borderColor: theme.accent }, // Use theme accent for active
                  ]}
                  onPress={() => handleDifficultyChange("medium")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: theme.text }, // Use theme text
                      difficulty === "medium" && { color: theme.text }, // Keep text readable on accent
                    ]}
                  >
                    Medium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                    difficulty === "hard" && { backgroundColor: theme.accent, borderColor: theme.accent }, // Use theme accent for active
                  ]}
                  onPress={() => handleDifficultyChange("hard")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: theme.text }, // Use theme text
                      difficulty === "hard" && { color: theme.text }, // Keep text readable on accent
                    ]}
                  >
                    Hard
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>Time Limit:</Text> {/* Use theme text */}
                <Text style={[styles.infoValue, { color: theme.accent }]}>{getTimeLimit()} seconds</Text>{" "}
                {/* Use theme accent */}
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>Questions:</Text> {/* Use theme text */}
                <Text style={[styles.infoValue, { color: theme.accent }]}>Unlimited</Text> {/* Use theme accent */}
              </View>
            </View>
            <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.accent }]} onPress={startGame}>
              {" "}
              {/* Use theme accent */}
              <Text style={[styles.startButtonText, { color: theme.text }]}>Start Game</Text> {/* Use theme text */}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  if (gameState === "playing") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} /> {/* Use theme status bar */}
        <LinearGradient
          colors={theme.background} // Use theme background
          style={styles.gradient}
        >
          <View style={styles.gameHeader}>
            <View style={styles.gameInfo}>
              <Text style={[styles.scoreText, { color: theme.text }]}>Score: {score}</Text> {/* Use theme text */}
              <Text style={[styles.timeText, { color: theme.text }]}>Time: {formatTime(timeLeft)}</Text>{" "}
              {/* Use theme text */}
              <Text style={[styles.streakText, { color: theme.text }]}>Streak: {streak}</Text> {/* Use theme text */}
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: theme.accent }]}>
              {" "}
              {/* Use theme accent */}
              <Text style={[styles.difficultyBadgeText, { color: theme.text }]}>{difficulty.toUpperCase()}</Text>{" "}
              {/* Use theme text */}
            </View>
          </View>

          {/* Power-ups Section */}
          <View style={styles.powerUpsSection}>
            {powerUps.map((powerUp) => (
              <TouchableOpacity
                key={powerUp.id}
                style={[
                  styles.powerUpButton,
                  { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                  score < powerUp.cost && styles.powerUpDisabled,
                  powerUp.active && { backgroundColor: theme.accent, borderColor: theme.accent }, // Use theme accent for active
                ]}
                onPress={() => {
                  if (score >= powerUp.cost) {
                    setScore((prev) => prev - powerUp.cost)
                    setPowerUps((prev) => prev.map((p) => (p.id === powerUp.id ? { ...p, active: true } : p)))

                    switch (powerUp.id) {
                      case "timeBoost":
                        setTimeLeft((prev) => prev + 10)
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                        break
                      case "skipQuestion":
                        handleSkipQuestion()
                        break
                    }
                  }
                }}
                disabled={score < powerUp.cost}
              >
                <Text style={[styles.powerUpName, { color: theme.text }]}>{powerUp.name}</Text> {/* Use theme text */}
                <Text style={[styles.powerUpCost, { color: theme.text }]}>{powerUp.cost}</Text> {/* Use theme text */}
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={[styles.gameContent, { opacity: fadeAnim }]}>
            <Text style={[styles.questionText, { color: theme.text }]}>Which one doesn't belong?</Text>{" "}
            {/* Use theme text */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: theme.text }]}>Loading question...</Text>{" "}
                {/* Use theme text */}
              </View>
            ) : currentQuestion ? (
              <Animated.View
                style={[styles.optionsContainer, { transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }]}
              >
                {currentQuestion.items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                      selectedAnswer === item.name &&
                        isCorrect && { backgroundColor: theme.success, borderColor: theme.success }, // Use theme success
                      selectedAnswer === item.name &&
                        !isCorrect && { backgroundColor: theme.error, borderColor: theme.error }, // Use theme error
                    ]}
                    onPress={() => handleAnswer(item.name)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={[styles.optionText, { color: theme.text }]}>{item.name}</Text> {/* Use theme text */}
                  </TouchableOpacity>
                ))}
              </Animated.View>
            ) : null}
            {selectedAnswer && (
              <Animated.View
                style={[
                  styles.feedbackContainer,
                  { backgroundColor: theme.cardBackground[0], borderColor: theme.border }, // Use theme colors
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isCorrect ? theme.success : theme.error }, // Use theme success/error
                  ]}
                >
                  {isCorrect ? "Correct!" : "Wrong!"}
                </Text>
                {currentQuestion && (
                  <Text style={[styles.explanationText, { color: theme.text }]}>{currentQuestion.explanation}</Text> // Use theme text
                )}
              </Animated.View>
            )}
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  if (gameState === "result") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} /> {/* Use theme status bar */}
        <LinearGradient
          colors={theme.background} // Use theme background
          style={styles.gradient}
        >
          <View style={styles.resultContent}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>Game Over!</Text> {/* Use theme text */}
            <View style={styles.scoreSection}>
              <Text style={[styles.finalScoreText, { color: theme.accent }]}>Final Score: {score}</Text>{" "}
              {/* Use theme accent */}
              <Text style={[styles.highScoreText, { color: theme.text }]}>High Score: {highScore}</Text>{" "}
              {/* Use theme text */}
              {score >= highScore && score > 0 && (
                <View style={[styles.newRecordContainer, { backgroundColor: theme.accent }]}>
                  {" "}
                  {/* Use theme accent */}
                  <Text style={[styles.newRecordText, { color: theme.text }]}>🎉 New Record! 🎉</Text>{" "}
                  {/* Use theme text */}
                </View>
              )}
            </View>
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statItemLabel, { color: theme.textSecondary }]}>Questions</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statItemValue, { color: theme.accent }]}>{questionsAnswered}</Text>{" "}
                {/* Use theme accent */}
              </View>
              <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statItemLabel, { color: theme.textSecondary }]}>Correct</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statItemValue, { color: theme.accent }]}>{correctAnswers}</Text>{" "}
                {/* Use theme accent */}
              </View>
              <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statItemLabel, { color: theme.textSecondary }]}>Accuracy</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statItemValue, { color: theme.accent }]}>{getAccuracy()}%</Text>{" "}
                {/* Use theme accent */}
              </View>
              <View style={[styles.statItem, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}>
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.statItemLabel, { color: theme.textSecondary }]}>Max Streak</Text>{" "}
                {/* Use theme secondary text */}
                <Text style={[styles.statItemValue, { color: theme.accent }]}>{maxStreak}</Text>{" "}
                {/* Use theme accent */}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.playAgainButton, { backgroundColor: theme.accent }]} onPress={resetGame}>
                {" "}
                {/* Use theme accent */}
                <Text style={[styles.playAgainButtonText, { color: theme.text }]}>Play Again</Text>{" "}
                {/* Use theme text */}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: theme.cardBackground[0], borderColor: theme.border }]}
                onPress={() => router.back()}
              >
                {" "}
                {/* Use theme colors */}
                <Text style={[styles.menuButtonText, { color: theme.text }]}>Back to Menu</Text> {/* Use theme text */}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  statCard: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  difficultySection: {
    marginBottom: 40,
  },
  difficultyTitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  difficultyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeDifficulty: {
    borderColor: "#4CAF50",
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeDifficultyText: {
    color: "#fff",
  },
  infoSection: {
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  gameInfo: {
    flex: 1,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 14,
    marginTop: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  powerUpsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  powerUpButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 80,
  },
  powerUpActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  powerUpDisabled: {
    opacity: 0.5,
  },
  powerUpName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  powerUpCost: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  loadingText: {
    fontSize: 16,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  correctAnswer: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  wrongAnswer: {
    backgroundColor: "#f44336",
    borderColor: "#f44336",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  feedbackContainer: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  correctFeedback: {
    color: "#4CAF50",
  },
  wrongFeedback: {
    color: "#f44336",
  },
  explanationText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  resultContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  finalScoreText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  highScoreText: {
    fontSize: 18,
    marginBottom: 20,
  },
  newRecordContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newRecordText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  statItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "45%",
    marginBottom: 10,
    borderWidth: 1,
  },
  statItemLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statItemValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
  },
  playAgainButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})
