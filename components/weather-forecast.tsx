"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import React from "react"

function WeatherForecast({ forecast, isMetric = true, isDarkMode = false }) {
  const [selectedDay, setSelectedDay] = useState(null)

  // Group forecast data by day
  const groupByDay = (data) => {
    // Use a more efficient date formatting approach
    const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" })
    const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
    })

    const grouped = {}

    data.list.forEach((item) => {
      // Get full date object for each forecast item
      const date = new Date(item.dt * 1000)
      // Format as "Mon, 08 Mar" (day, date month)
      const dateKey = dateFormatter.format(date)
      const fullDateStr = fullDateFormatter.format(date)

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          items: [],
          fullDate: fullDateStr,
          date: date,
        }
      }

      grouped[dateKey].items.push(item)
    })

    return grouped
  }

  const getDailyData = (dayData) => {
    // Get the middle of the day forecast (around noon) or the first entry
    const middayForecast =
      dayData.items.find((item) => {
        const hour = new Date(item.dt * 1000).getHours()
        return hour >= 11 && hour <= 14
      }) || dayData.items[0]

    // Calculate min and max temperatures
    const minTemp = Math.min(...dayData.items.map((item) => item.main.temp_min))
    const maxTemp = Math.max(...dayData.items.map((item) => item.main.temp_max))

    // Calculate average wind speed and most common weather condition
    const avgWindSpeed = dayData.items.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.items.length

    // Find most common weather condition
    const weatherCounts = {}
    let mostCommonWeather = null
    let maxCount = 0

    dayData.items.forEach((item) => {
      const weatherId = item.weather[0].id
      weatherCounts[weatherId] = (weatherCounts[weatherId] || 0) + 1

      if (weatherCounts[weatherId] > maxCount) {
        maxCount = weatherCounts[weatherId]
        mostCommonWeather = item.weather[0]
      }
    })

    return {
      icon: mostCommonWeather ? mostCommonWeather.icon : middayForecast.weather[0].icon,
      description: mostCommonWeather ? mostCommonWeather.description : middayForecast.weather[0].description,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      humidity: middayForecast.main.humidity,
      windSpeed: avgWindSpeed,
      hourlyData: dayData.items.map((item) => ({
        time: new Date(item.dt * 1000).getHours(),
        temp: item.main.temp,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        pop: item.pop, // Probability of precipitation
      })),
    }
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

  const groupedForecast = groupByDay(forecast)
  const days = Object.keys(groupedForecast)

  // Skip today (already shown in the main card) and show the next 6 days
  const forecastDays = days.slice(1, 7)

  // If we don't have enough days from the API, we'll need to generate additional days
  const hasEnoughDays = forecastDays.length === 6

  // Generate additional days if needed
  const generateExtraDays = () => {
    const extraDays = []

    if (forecastDays.length === 0) return extraDays

    const lastDay = forecastDays[forecastDays.length - 1]
    const lastDayData = groupedForecast[lastDay]
    const lastDayForecast = getDailyData(lastDayData)

    // How many more days we need
    const daysNeeded = 6 - forecastDays.length

    for (let i = 1; i <= daysNeeded; i++) {
      const nextDate = new Date(lastDayData.date)
      nextDate.setDate(nextDate.getDate() + i)

      const dayName = nextDate.toLocaleDateString("en-US", { weekday: "short" })
      const fullDate = nextDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })

      extraDays.push({
        dayName,
        fullDate,
        isEstimated: true,
        // Use the last day's data as an estimate
        forecast: {
          ...lastDayForecast,
          description: "Estimated forecast",
        },
      })
    }

    return extraDays
  }

  const extraDays = generateExtraDays()

  const handleDayClick = (day, isExtra = false) => {
    if (isExtra) {
      setSelectedDay({
        name: day.dayName,
        fullDate: day.fullDate,
        forecast: day.forecast,
        isEstimated: true,
      })
    } else {
      setSelectedDay({
        name: day,
        fullDate: groupedForecast[day].fullDate,
        forecast: getDailyData(groupedForecast[day]),
        hourlyData: getDailyData(groupedForecast[day]).hourlyData,
        isEstimated: false,
      })
    }
  }

  return (
    <>
      <Card className={cn("backdrop-blur-md border-none text-white", isDarkMode ? "bg-gray-800/30" : "bg-white/10")}>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg">Next 6 Days Forecast</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {forecastDays.map((day) => {
              const dayData = groupedForecast[day]
              const forecast = getDailyData(dayData)

              return (
                <div
                  key={day}
                  className={cn(
                    "rounded-lg p-2 flex flex-col items-center hover:bg-white/20 transition-colors cursor-pointer active:bg-white/30 touch-action-manipulation",
                    isDarkMode ? "bg-gray-700/30" : "bg-white/10",
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="font-bold text-xs sm:text-sm">{day}</div>
                  <div className="text-[10px] sm:text-xs text-white/80 mb-1">{dayData.fullDate}</div>
                  <img
                    src={`https://openweathermap.org/img/wn/${forecast.icon}.png`}
                    alt={forecast.description}
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  />
                  <div className="text-[10px] sm:text-xs capitalize mb-1 line-clamp-1">{forecast.description}</div>
                  <div className="flex items-center gap-1 mb-1">
                    <Thermometer className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-[10px] sm:text-xs">
                      {convertTemp(forecast.minTemp)}° / {convertTemp(forecast.maxTemp)}°
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-[10px] sm:text-xs">{forecast.humidity}%</span>
                  </div>
                </div>
              )
            })}

            {extraDays.map((day, index) => (
              <div
                key={`extra-${index}`}
                className={cn(
                  "rounded-lg p-2 flex flex-col items-center hover:bg-white/20 transition-colors cursor-pointer active:bg-white/30 touch-action-manipulation",
                  isDarkMode ? "bg-gray-700/30" : "bg-white/10",
                )}
                onClick={() => handleDayClick(day, true)}
              >
                <div className="font-bold text-xs sm:text-sm">{day.dayName}</div>
                <div className="text-[10px] sm:text-xs text-white/80 mb-1">{day.fullDate}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${day.forecast.icon}.png`}
                  alt="Estimated forecast"
                  className="w-10 h-10 sm:w-12 sm:h-12 opacity-80"
                />
                <div className="text-[10px] sm:text-xs capitalize mb-1 line-clamp-1">Estimated</div>
                <div className="flex items-center gap-1 mb-1">
                  <Thermometer className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span className="text-[10px] sm:text-xs">
                    {convertTemp(day.forecast.minTemp)}° / {convertTemp(day.forecast.maxTemp)}°
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span className="text-[10px] sm:text-xs">{day.forecast.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile-friendly dialog for day details */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent
          className={cn(
            "border-none text-white sm:max-w-md max-h-[90vh] overflow-y-auto",
            isDarkMode ? "bg-gray-900/95" : "bg-gray-800/95",
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-base sm:text-lg">
              {selectedDay?.name}, {selectedDay?.fullDate}
              {selectedDay?.isEstimated && " (Estimated)"}
            </DialogTitle>
          </DialogHeader>

          {selectedDay && (
            <div className="flex flex-col items-center gap-3 px-1">
              <div className="flex items-center gap-3">
                <img
                  src={`https://openweathermap.org/img/wn/${selectedDay.forecast.icon}@2x.png`}
                  alt={selectedDay.forecast.description}
                  className="w-14 h-14 sm:w-16 sm:h-16"
                />
                <div>
                  <p className="text-sm sm:text-base capitalize line-clamp-2">{selectedDay.forecast.description}</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {convertTemp(selectedDay.forecast.minTemp)}° / {convertTemp(selectedDay.forecast.maxTemp)}°
                    {isMetric ? "C" : "F"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <div
                  className={cn(
                    "p-2 sm:p-3 rounded-lg flex items-center gap-2",
                    isDarkMode ? "bg-gray-700/50" : "bg-white/10",
                  )}
                >
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs">Humidity</p>
                    <p className="font-bold text-sm truncate">{selectedDay.forecast.humidity}%</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "p-2 sm:p-3 rounded-lg flex items-center gap-2",
                    isDarkMode ? "bg-gray-700/50" : "bg-white/10",
                  )}
                >
                  <Wind className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs">Wind Speed</p>
                    <p className="font-bold text-sm truncate">
                      {convertSpeed(selectedDay.forecast.windSpeed)} {getSpeedUnit()}
                    </p>
                  </div>
                </div>
              </div>

              {!selectedDay.isEstimated && selectedDay.hourlyData && (
                <div className="w-full">
                  <h3 className="text-xs sm:text-sm font-medium mb-2">Hourly Forecast</h3>
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full">
                    {selectedDay.hourlyData.slice(0, 8).map((hour, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex flex-col items-center p-1 sm:p-2 rounded-lg",
                          isDarkMode ? "bg-gray-700/50" : "bg-white/10",
                        )}
                      >
                        <div className="text-[10px] sm:text-xs">{hour.time}:00</div>
                        <img
                          src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                          alt={hour.description}
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <div className="text-[10px] sm:text-xs font-bold">{convertTemp(hour.temp)}°</div>
                        {hour.pop > 0 && (
                          <div className="text-[9px] sm:text-[10px] text-blue-300">{Math.round(hour.pop * 100)}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.isEstimated && (
                <div className={cn("text-center p-2 rounded-lg w-full", isDarkMode ? "bg-gray-700/50" : "bg-white/10")}>
                  <p className="text-xs sm:text-sm">
                    This is an estimated forecast based on trends from available data.
                  </p>
                  <p className="text-[10px] sm:text-xs mt-1 text-white/70">Actual weather conditions may vary.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default React.memo(WeatherForecast)
