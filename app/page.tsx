"use client"

import { useState, useEffect, Suspense } from "react"
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Thermometer,
  RefreshCw,
  ThermometerSnowflake,
  Gauge,
  Share2,
  Star,
  Moon,
  Sun,
  Layers,
} from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import WeatherForecast from "@/components/weather-forecast"
import ErrorBoundary from "@/components/error-boundary"
import RecentSearches from "@/components/recent-searches"
import WeatherAlerts from "@/components/weather-alerts"
import { useWeatherApi } from "@/hooks/use-weather-api"
import { useWeatherPreferences } from "@/hooks/use-weather-preferences"
import { cn } from "@/lib/utils"
import Navbar from "@/components/navbar"

// Dynamically import heavy components
const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  loading: () => <Skeleton className="w-full h-[400px] bg-white/10" />,
  ssr: false,
})

export default function WeatherApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [favoriteLocations, setFavoriteLocations] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteLocations")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [showMap, setShowMap] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  // Use our custom hooks
  const { preferences, toggleUnits, toggleDarkMode, addRecentSearch, clearRecentSearches } = useWeatherPreferences()
  const { weather, forecast, airQuality, alerts, loading, error, currentDate, fetchWeather } = useWeatherApi()

  const { isMetric, isDarkMode, recentSearches } = preferences

  useEffect(() => {
    // Try to get user's location on initial load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`)
            if (response.ok) {
              const data = await response.json()
              if (data.name) {
                fetchWeather(data.name)
                return
              }
            }
            // Fallback to default city if geocoding fails
            fetchWeather("Kolkata")
          } catch (error) {
            console.error("Error getting location:", error)
            fetchWeather("Kolkata")
          }
        },
        // If user denies location or any error occurs, use default city
        () => fetchWeather("Kolkata"),
      )
    } else {
      // Geolocation not supported, use default city
      fetchWeather("Kolkata")
    }

    // Add preconnect for OpenWeatherMap
    const link = document.createElement("link")
    link.rel = "preconnect"
    link.href = "https://openweathermap.org"
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [fetchWeather])

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteLocations", JSON.stringify(favoriteLocations))
    }
  }, [favoriteLocations])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchWeather(searchQuery)
      addRecentSearch(searchQuery)
      setSearchQuery("")
    }
  }

  const handleRecentSearch = (city) => {
    fetchWeather(city)
    setIsSearchOpen(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    if (weather) {
      fetchWeather(weather.name, true).finally(() => {
        setRefreshing(false)
      })
    } else {
      setRefreshing(false)
    }
  }

  const toggleFavorite = () => {
    if (!weather) return

    const locationName = `${weather.name}, ${weather.sys.country}`

    if (favoriteLocations.some((loc) => loc.name === locationName)) {
      setFavoriteLocations(favoriteLocations.filter((loc) => loc.name !== locationName))
      toast({
        title: "Removed from favorites",
        description: `${locationName} has been removed from your favorites.`,
      })
    } else {
      setFavoriteLocations([
        ...favoriteLocations,
        {
          name: locationName,
          city: weather.name,
        },
      ])
      toast({
        title: "Added to favorites",
        description: `${locationName} has been added to your favorites.`,
      })
    }
  }

  const isFavorite = () => {
    if (!weather) return false
    const locationName = `${weather.name}, ${weather.sys.country}`
    return favoriteLocations.some((loc) => loc.name === locationName)
  }

  const shareWeather = async () => {
    if (!weather) return

    const shareData = {
      title: `Weather in ${weather.name}`,
      text: `Current weather in ${weather.name}: ${weather.weather[0].description}, ${Math.round(weather.main.temp)}°${isMetric ? "C" : "F"}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(`${shareData.title} - ${shareData.text}`)
        toast({
          title: "Copied to clipboard",
          description: "Weather information has been copied to your clipboard.",
        })
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const getBackgroundClass = () => {
    if (!weather)
      return isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-400 to-blue-700"

    const id = weather.weather[0].id
    const isDay = weather.dt > weather.sys.sunrise && weather.dt < weather.sys.sunset

    if (isDarkMode) {
      // Dark mode backgrounds
      // Clear sky
      if (id === 800) {
        return isDay ? "bg-gradient-to-br from-blue-900 to-gray-900" : "bg-gradient-to-br from-gray-900 to-blue-950"
      }
      // Clouds
      else if (id >= 801 && id <= 804) {
        return "bg-gradient-to-br from-gray-800 to-gray-900"
      }
      // Rain, drizzle
      else if ((id >= 300 && id <= 321) || (id >= 500 && id <= 531)) {
        return "bg-gradient-to-br from-gray-900 to-blue-950"
      }
      // Thunderstorm
      else if (id >= 200 && id <= 232) {
        return "bg-gradient-to-br from-gray-900 to-purple-950"
      }
      // Snow
      else if (id >= 600 && id <= 622) {
        return "bg-gradient-to-br from-gray-800 to-blue-950"
      }
      // Atmosphere (fog, mist, etc)
      else if (id >= 701 && id <= 781) {
        return "bg-gradient-to-br from-gray-800 to-gray-900"
      }

      return "bg-gradient-to-br from-gray-900 to-gray-800"
    } else {
      // Light mode backgrounds
      // Clear sky
      if (id === 800) {
        return isDay ? "bg-gradient-to-br from-sky-400 to-blue-600" : "bg-gradient-to-br from-indigo-900 to-blue-950"
      }
      // Clouds
      else if (id >= 801 && id <= 804) {
        return isDay ? "bg-gradient-to-br from-gray-300 to-blue-500" : "bg-gradient-to-br from-gray-800 to-blue-900"
      }
      // Rain, drizzle
      else if ((id >= 300 && id <= 321) || (id >= 500 && id <= 531)) {
        return "bg-gradient-to-br from-gray-400 to-blue-800"
      }
      // Thunderstorm
      else if (id >= 200 && id <= 232) {
        return "bg-gradient-to-br from-gray-700 to-blue-950"
      }
      // Snow
      else if (id >= 600 && id <= 622) {
        return "bg-gradient-to-br from-blue-100 to-blue-300"
      }
      // Atmosphere (fog, mist, etc)
      else if (id >= 701 && id <= 781) {
        return "bg-gradient-to-br from-gray-400 to-gray-600"
      }

      return "bg-gradient-to-br from-blue-400 to-blue-700"
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const convertTemp = (temp) => {
    return isMetric ? Math.round(temp) : Math.round((temp * 9) / 5 + 32)
  }

  const convertSpeed = (speed) => {
    return isMetric ? Math.round(speed * 3.6) : Math.round(speed * 2.237)
  }

  const getSpeedUnit = () => {
    return isMetric ? "km/h" : "mph"
  }

  const getAirQualityLabel = (aqi) => {
    switch (aqi) {
      case 1:
        return { label: "Good", color: "bg-green-500" }
      case 2:
        return { label: "Fair", color: "bg-yellow-500" }
      case 3:
        return { label: "Moderate", color: "bg-orange-500" }
      case 4:
        return { label: "Poor", color: "bg-red-500" }
      case 5:
        return { label: "Very Poor", color: "bg-purple-500" }
      default:
        return { label: "Unknown", color: "bg-gray-500" }
    }
  }

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", getBackgroundClass())}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-weather-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Header with navigation */}
      <header role="banner">
        <Navbar
          isDarkMode={isDarkMode}
          isMetric={isMetric}
          onToggleDarkMode={toggleDarkMode}
          onToggleUnits={toggleUnits}
        />
      </header>

      <main className="flex-1 p-3 md:p-8 flex flex-col items-center" id="main-weather-content">
        <div className="w-full max-w-4xl">
          {/* Search section */}
          <section aria-label="Weather search" className="mb-4">
            {/* Mobile search bar - below navbar */}
            <div className="md:hidden mb-4">
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-white/20 border-none text-white hover:bg-white/30 justify-start"
                    aria-label="Open search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search for a city...
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="bg-gray-900/95 border-none text-white pt-16">
                  <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Search Location</h2>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter city name..."
                      className="bg-white/20 backdrop-blur-md border-none text-white placeholder:text-white/70"
                      aria-label="Search for a city"
                    />
                    <Button type="submit" className="w-full">
                      Search
                    </Button>

                    <RecentSearches
                      searches={recentSearches}
                      onSelectSearch={handleRecentSearch}
                      onClearSearches={clearRecentSearches}
                    />

                    {favoriteLocations.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Favorite Locations</h3>
                        <div className="flex flex-col gap-2">
                          {favoriteLocations.map((location, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="justify-start bg-white/10 hover:bg-white/20 border-none"
                              onClick={() => {
                                fetchWeather(location.city)
                                setIsSearchOpen(false)
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              {location.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex gap-2 mb-6">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city..."
                className="bg-white/20 backdrop-blur-md border-none text-white placeholder:text-white/70"
                aria-label="Search for a city"
              />
              <Button type="submit" variant="secondary" size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 border-none text-white hover:bg-white/30"
                aria-label="Refresh weather data"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>

              {weather && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={cn(
                      "bg-white/20 border-none text-white hover:bg-white/30",
                      isFavorite() && "bg-yellow-500/30",
                    )}
                    aria-label={isFavorite() ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={cn("h-4 w-4", isFavorite() && "fill-yellow-400")} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shareWeather}
                    className="bg-white/20 border-none text-white hover:bg-white/30"
                    aria-label="Share weather"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowMap(!showMap)}
                    className={cn("bg-white/20 border-none text-white hover:bg-white/30", showMap && "bg-blue-500/30")}
                    aria-label={showMap ? "Hide weather map" : "Show weather map"}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </>
              )}
            </form>
          </section>

          {/* Mobile location and controls */}
          <section
            aria-label="Current location and controls"
            className="md:hidden flex items-center justify-between mb-4"
          >
            {/* Location name */}
            <div className="flex items-center flex-1 min-w-0">
              {weather && (
                <>
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <h1 className="text-base font-bold truncate">
                    {weather.name}, {weather.sys.country}
                  </h1>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8"
                aria-label="Refresh weather data"
              >
                <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              </Button>

              {weather && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={cn(
                      "bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8",
                      isFavorite() && "bg-yellow-500/30",
                    )}
                    aria-label={isFavorite() ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={cn("h-3 w-3", isFavorite() && "fill-yellow-400")} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shareWeather}
                    className="bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8"
                    aria-label="Share weather"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowMap(!showMap)}
                    className={cn(
                      "bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8",
                      showMap && "bg-blue-500/30",
                    )}
                    aria-label={showMap ? "Hide weather map" : "Show weather map"}
                  >
                    <Layers className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </section>

          {/* Desktop location and controls */}
          <section
            aria-label="Current location and controls"
            className="hidden md:flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2 flex-1">
              {weather && (
                <div className="flex items-center mr-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <h1 className="text-lg font-bold">
                    {weather.name}, {weather.sys.country}
                  </h1>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle - desktop */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className="bg-white/20 border-none text-white hover:bg-white/30"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Unit toggle - desktop */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="desktop-unit-toggle" className="text-white text-sm">
                  °C
                </Label>
                <Switch
                  id="desktop-unit-toggle"
                  checked={!isMetric}
                  onCheckedChange={toggleUnits}
                  aria-label="Temperature unit toggle"
                />
                <Label htmlFor="desktop-unit-toggle" className="text-white text-sm">
                  °F
                </Label>
              </div>
            </div>
          </section>

          {error && (
            <section
              aria-label="Error message"
              className="bg-red-500/80 text-white p-3 rounded-lg mb-4 backdrop-blur-md text-sm"
            >
              <p className="font-medium">{error}</p>
              <p className="text-xs mt-1">Please try searching for a different city or check your connection.</p>
            </section>
          )}

          {/* Weather alerts */}
          {alerts && alerts.length > 0 && weather && (
            <section aria-label="Weather alerts">
              <WeatherAlerts alerts={alerts} cityName={weather.name} />
            </section>
          )}

          {/* Weather map */}
          {showMap && weather && (
            <section aria-label="Interactive weather map">
              <ErrorBoundary>
                <Card className="bg-white/10 backdrop-blur-md border-none text-white overflow-hidden mb-4">
                  <CardContent className="p-4">
                    <WeatherMap lat={weather.coord.lat} lon={weather.coord.lon} cityName={weather.name} />
                  </CardContent>
                </Card>
              </ErrorBoundary>
            </section>
          )}

          {/* Current weather */}
          <section aria-label="Current weather conditions">
            <ErrorBoundary>
              <Card className="bg-white/10 backdrop-blur-md border-none text-white overflow-hidden mb-4">
                {loading ? (
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-8 w-36 bg-white/20" />
                      <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
                      <Skeleton className="h-6 w-24 bg-white/20" />
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <Skeleton className="h-16 bg-white/20" />
                        <Skeleton className="h-16 bg-white/20" />
                        <Skeleton className="h-16 bg-white/20" />
                        <Skeleton className="h-16 bg-white/20" />
                      </div>
                    </div>
                  </CardContent>
                ) : weather ? (
                  <CardContent className="p-4">
                    <time className="text-xs text-white/80 mb-2 block">{currentDate}</time>

                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-col items-center">
                        <Image
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                          alt={`${weather.weather[0].description} weather icon`}
                          width={96}
                          height={96}
                          className="w-20 h-20 sm:w-24 sm:h-24"
                          priority
                        />
                        <p className="text-sm sm:text-base capitalize text-center">{weather.weather[0].description}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-4xl sm:text-5xl font-bold">
                          {convertTemp(weather.main.temp)}°{isMetric ? "C" : "F"}
                        </div>
                        <div className="text-sm sm:text-base">
                          Feels like {convertTemp(weather.main.feels_like)}°{isMetric ? "C" : "F"}
                        </div>

                        {airQuality && (
                          <div className="flex items-center justify-end mt-1">
                            <div
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full text-white",
                                getAirQualityLabel(airQuality.main.aqi).color,
                              )}
                            >
                              Air: {getAirQualityLabel(airQuality.main.aqi).label}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Tabs defaultValue="overview" className="mt-4">
                      <TabsList className="bg-white/10 border-none w-full" role="tablist">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-white/20 flex-1 text-xs sm:text-sm"
                          role="tab"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="details"
                          className="data-[state=active]:bg-white/20 flex-1 text-xs sm:text-sm"
                          role="tab"
                        >
                          Details
                        </TabsTrigger>
                        {airQuality && (
                          <TabsTrigger
                            value="air"
                            className="data-[state=active]:bg-white/20 flex-1 text-xs sm:text-sm"
                            role="tab"
                          >
                            Air Quality
                          </TabsTrigger>
                        )}
                      </TabsList>
                      <TabsContent value="overview" className="mt-3" role="tabpanel">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Droplets className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Humidity</span>
                            <span className="text-sm sm:text-base font-bold">{weather.main.humidity}%</span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Wind className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Wind</span>
                            <span className="text-sm sm:text-base font-bold">
                              {convertSpeed(weather.wind.speed)} {getSpeedUnit()}
                            </span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Sunrise className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Sunrise</span>
                            <span className="text-sm sm:text-base font-bold">{formatTime(weather.sys.sunrise)}</span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Sunset className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Sunset</span>
                            <span className="text-sm sm:text-base font-bold">{formatTime(weather.sys.sunset)}</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="details" className="mt-3" role="tabpanel">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Thermometer className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Max Temp</span>
                            <span className="text-sm sm:text-base font-bold">
                              {convertTemp(weather.main.temp_max)}°{isMetric ? "C" : "F"}
                            </span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <ThermometerSnowflake className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Min Temp</span>
                            <span className="text-sm sm:text-base font-bold">
                              {convertTemp(weather.main.temp_min)}°{isMetric ? "C" : "F"}
                            </span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Gauge className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Pressure</span>
                            <span className="text-sm sm:text-base font-bold">{weather.main.pressure} hPa</span>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                            <Wind className="h-4 w-4 mb-1 sm:h-5 sm:w-5" aria-hidden="true" />
                            <span className="text-xs sm:text-sm">Wind Dir</span>
                            <span className="text-sm sm:text-base font-bold">{weather.wind.deg}°</span>
                          </div>
                        </div>
                      </TabsContent>
                      {airQuality && (
                        <TabsContent value="air" className="mt-3" role="tabpanel">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">Air Quality Index</span>
                              <span
                                className={cn(
                                  "text-sm sm:text-base font-bold px-2 py-0.5 mt-1 rounded-full",
                                  getAirQualityLabel(airQuality.main.aqi).color,
                                )}
                              >
                                {getAirQualityLabel(airQuality.main.aqi).label}
                              </span>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">PM2.5</span>
                              <span className="text-sm sm:text-base font-bold">
                                {airQuality.components.pm2_5} μg/m³
                              </span>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">PM10</span>
                              <span className="text-sm sm:text-base font-bold">{airQuality.components.pm10} μg/m³</span>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">NO₂</span>
                              <span className="text-sm sm:text-base font-bold">{airQuality.components.no2} μg/m³</span>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">O₃</span>
                              <span className="text-sm sm:text-base font-bold">{airQuality.components.o3} μg/m³</span>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center">
                              <span className="text-xs sm:text-sm">SO₂</span>
                              <span className="text-sm sm:text-base font-bold">{airQuality.components.so2} μg/m³</span>
                            </div>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                ) : null}
              </Card>
            </ErrorBoundary>
          </section>

          {/* Weather forecast */}
          {forecast && !loading && (
            <section aria-label="Weather forecast">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64 w-full bg-white/10 rounded-lg" />}>
                  <WeatherForecast forecast={forecast} isMetric={isMetric} isDarkMode={isDarkMode} />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
