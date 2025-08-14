"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface Theme {
  background: string[]
  cardBackground: string[]
  text: string // Changed from textPrimary to text
  textSecondary: string
  accent: string
  border: string
  searchBackground: string[]
  tabBarBackground: string
  tabBarActiveTint: string
  tabBarInactiveTint: string
  success: string
  error: string
  warning: string
  isDark: boolean // Added isDark property to theme object
}

const lightTheme: Theme = {
  background: ["#fef7ed", "#fed7aa"],
  cardBackground: ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.02)"],
  text: "#1a1a1a", // Changed from textPrimary to text
  textSecondary: "rgba(0,0,0,0.7)",
  accent: "#10b981",
  border: "rgba(0,0,0,0.1)",
  searchBackground: ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.02)"],
  tabBarBackground: "#ffffff",
  tabBarActiveTint: "#10b981",
  tabBarInactiveTint: "#6b7280",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  isDark: false,
}

const darkTheme: Theme = {
  background: ["#1a1a1a", "#000000"],
  cardBackground: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"],
  text: "#ffffff", // Changed from textPrimary to text
  textSecondary: "rgba(255,255,255,0.7)",
  accent: "#10b981",
  border: "rgba(255,255,255,0.1)",
  searchBackground: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"],
  tabBarBackground: "#1a1a1a",
  tabBarActiveTint: "#10b981",
  tabBarInactiveTint: "#6b7280",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  isDark: true,
}

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme")
      if (savedTheme !== null) {
        setIsDark(savedTheme === "dark")
      }
    } catch (error) {
      console.error("Error loading theme:", error)
    }
  }

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark
      setIsDark(newTheme)
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light")
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  const theme = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
