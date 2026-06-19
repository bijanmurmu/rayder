"use client"

import { useState, useEffect } from "react"
import { Sun, Cloud, CloudRain, Smartphone, Moon } from "lucide-react"

export default function WeatherAppThumbnail() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Toggle between light and dark mode every 3 seconds for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDarkMode((prev) => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-8 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-400 to-blue-600"}`}
    >
      <div className="max-w-3xl w-full flex flex-col items-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-lg">Bijan Weather App</h1>

        {/* Device mockup with app screenshot */}
        <div className="relative mx-auto mb-8">
          {/* Phone frame */}
          <div className="relative w-64 h-[500px] rounded-[36px] overflow-hidden border-8 border-gray-800 shadow-2xl">
            {/* App screen */}
            <div
              className={`absolute inset-0 ${isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-400 to-blue-600"}`}
            >
              {/* Status bar */}
              <div className="h-6 bg-black/20 flex justify-between items-center px-4">
                <span className="text-[10px] text-white">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                </div>
              </div>

              {/* App content */}
              <div className="p-4">
                {/* Location */}
                <div className="flex items-center justify-center mb-4">
                  <span className="text-white font-semibold">Kolkata, IN</span>
                </div>

                {/* Current weather */}
                <div className="flex flex-col items-center justify-center mb-6">
                  {isDarkMode ? (
                    <Moon className="w-20 h-20 text-white mb-2" />
                  ) : (
                    <Sun className="w-20 h-20 text-yellow-300 mb-2" />
                  )}
                  <span className="text-4xl font-bold text-white">28°C</span>
                  <span className="text-sm text-white/80">Feels like 30°C</span>
                </div>

                {/* Weather details */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-white/10 rounded-lg p-2 flex flex-col items-center">
                    <span className="text-xs text-white/80">Humidity</span>
                    <span className="text-sm font-bold text-white">65%</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 flex flex-col items-center">
                    <span className="text-xs text-white/80">Wind</span>
                    <span className="text-sm font-bold text-white">12 km/h</span>
                  </div>
                </div>

                {/* Forecast */}
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="text-xs text-white/80 mb-2">6-Day Forecast</div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-white">{["Mon", "Tue", "Wed"][i]}</span>
                        <div className="flex items-center">
                          {i === 0 ? (
                            <Sun className="w-4 h-4 text-yellow-300 mr-2" />
                          ) : i === 1 ? (
                            <Cloud className="w-4 h-4 text-gray-200 mr-2" />
                          ) : (
                            <CloudRain className="w-4 h-4 text-blue-300 mr-2" />
                          )}
                        </div>
                        <span className="text-xs text-white">
                          {[32, 29, 27][i]}° / {[26, 24, 22][i]}°
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map preview */}
                <div className="bg-white/10 rounded-lg h-24 flex items-center justify-center">
                  <span className="text-xs text-white/80">Weather Map</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-b-xl"></div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 flex flex-col items-center text-white">
            <Sun className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Real-time Weather</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 flex flex-col items-center text-white">
            <CloudRain className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Forecast</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 flex flex-col items-center text-white">
            <Smartphone className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Mobile Optimized</span>
          </div>
        </div>
      </div>
    </div>
  )
}
