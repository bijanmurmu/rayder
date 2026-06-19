"use client"

import { useState, useEffect } from "react"
import type { UserPreferences } from "@/types/weather"

const DEFAULT_PREFERENCES: UserPreferences = {
  isMetric: true,
  isDarkMode: false,
  recentSearches: [],
}

export function useWeatherPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loaded, setLoaded] = useState(false)

  // Load preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPreferences = localStorage.getItem("weatherPreferences")
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences))
        } else {
          // Check system preference for dark mode if no saved preference
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          setPreferences((prev) => ({ ...prev, isDarkMode: prefersDark }))
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      } finally {
        setLoaded(true)
      }
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (loaded && typeof window !== "undefined") {
      localStorage.setItem("weatherPreferences", JSON.stringify(preferences))

      // Apply dark mode class
      if (preferences.isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [preferences, loaded])

  // Function to toggle metric/imperial units
  const toggleUnits = () => {
    setPreferences((prev) => ({ ...prev, isMetric: !prev.isMetric }))
  }

  // Function to toggle dark/light mode
  const toggleDarkMode = () => {
    setPreferences((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }))
  }

  // Function to add a city to recent searches
  const addRecentSearch = (city: string) => {
    setPreferences((prev) => {
      // Remove the city if it already exists to avoid duplicates
      const filteredSearches = prev.recentSearches.filter((s) => s.toLowerCase() !== city.toLowerCase())

      // Add the city to the beginning of the array and limit to 5 recent searches
      return {
        ...prev,
        recentSearches: [city, ...filteredSearches].slice(0, 5),
      }
    })
  }

  // Function to clear recent searches
  const clearRecentSearches = () => {
    setPreferences((prev) => ({ ...prev, recentSearches: [] }))
  }

  return {
    preferences,
    loaded,
    toggleUnits,
    toggleDarkMode,
    addRecentSearch,
    clearRecentSearches,
  }
}
