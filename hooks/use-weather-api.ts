"use client"

import { useState, useCallback } from "react"
import type { WeatherData, ForecastData, AirQualityData, WeatherAlert } from "@/types/weather"

interface WeatherApiState {
  weather: WeatherData | null
  forecast: ForecastData | null
  airQuality: AirQualityData | null
  alerts: WeatherAlert[]
  loading: boolean
  error: string | null
  currentDate: string
}

interface WeatherCache {
  [key: string]: {
    data: Omit<WeatherApiState, "loading" | "error">
    timestamp: number
  }
}

export function useWeatherApi() {
  const [state, setState] = useState<WeatherApiState>({
    weather: null,
    forecast: null,
    airQuality: null,
    alerts: [],
    loading: false,
    error: null,
    currentDate: "",
  })

  // In-memory cache
  const cache = useCallback<WeatherCache>({}, [])

  const fetchWeatherWithRetry = useCallback(
    async (cityName: string, showToast = false, maxRetries = 2) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Check cache first (valid for 10 minutes)
      const cacheKey = cityName.toLowerCase()
      const cachedData = cache[cacheKey]
      const now = Date.now()

      if (cachedData && now - cachedData.timestamp < 10 * 60 * 1000) {
        setState((prev) => ({
          ...prev,
          ...cachedData.data,
          loading: false,
        }))
        return { success: true, message: "Loaded from cache" }
      }

      let attempt = 0

      while (attempt <= maxRetries) {
        try {
          const response = await fetch(`/api/weather-all?city=${encodeURIComponent(cityName)}`);

          if (response.status >= 400 && response.status < 500) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch weather data")
          }

          if (!response.ok) {
            throw new Error("Failed to fetch weather data")
          }

          const data = await response.json()

          if (!data.weather || !data.forecast) {
            throw new Error("Failed to parse required weather data")
          }

          // Set current date
          const now = new Date()
          const currentDateStr = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          const newState = {
            weather: data.weather,
            forecast: data.forecast,
            airQuality: data.airQuality,
            alerts: data.alerts || [],
            currentDate: currentDateStr,
          }

          // Update state
          setState((prev) => ({
            ...prev,
            ...newState,
            loading: false,
            error: null,
          }))

          // Cache the data
          cache[cacheKey] = {
            data: newState,
            timestamp: Date.now(),
          }

          return { success: true, message: `Weather data for ${cityName} loaded successfully` }
        } catch (err: any) {
          attempt++

          if (attempt > maxRetries) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: err.message || "Could not fetch weather data. Please try again.",
            }))
            return { success: false, message: err.message || "Failed to load weather data" }
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
        }
      }

      return { success: false, message: "Failed to load weather data after multiple attempts" }
    },
    [cache],
  )

  return {
    ...state,
    fetchWeather: fetchWeatherWithRetry,
  }
}
