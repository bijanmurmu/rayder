"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import React from "react"

function WeatherForecast({ forecast, isMetric = true, theme }) {
  const [selectedDay, setSelectedDay] = useState(null)

  // Determine an elegant background tint based on the weather conditions
  const getWeatherGradient = (forecast) => {
    if (!forecast) return "none";
    const desc = forecast.description.toLowerCase();
    
    if (desc.includes("clear") || desc.includes("sun")) {
      return "radial-gradient(circle at top right, rgba(251, 146, 60, 0.2), transparent 70%)"; // Sunset Amber
    }
    if (desc.includes("rain") || desc.includes("storm") || desc.includes("thunder") || desc.includes("drizzle")) {
      return "radial-gradient(circle at top right, rgba(59, 130, 246, 0.2), transparent 70%)"; // Deep Rain Blue
    }
    if (desc.includes("snow") || desc.includes("ice")) {
      return "radial-gradient(circle at top right, rgba(248, 250, 252, 0.2), transparent 70%)"; // Ice White
    }
    if (desc.includes("cloud") || desc.includes("overcast") || desc.includes("fog")) {
      return "radial-gradient(circle at top right, rgba(148, 163, 184, 0.15), transparent 70%)"; // Slate
    }
    
    return "radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 70%)";
  }

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
        pop: item.pop || 0, // Probability of precipitation
      })),
      pop: Math.max(...dayData.items.map((item) => item.pop || 0)),
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
          pop: lastDayForecast.pop || 0,
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
        {forecastDays.map((day) => {
          const dayData = groupedForecast[day]
          const forecast = getDailyData(dayData)

          return (
            <div
              key={day}
              className="border border-[color:var(--theme-border)] rounded-2xl p-6 flex flex-col bg-[color:var(--theme-bg)]/20 backdrop-blur-md hover:bg-[color:var(--theme-bg)]/40 transition-colors cursor-pointer group"
              onClick={() => handleDayClick(day)}
            >
              <div className="font-medium text-xl md:text-2xl tracking-tight">{day}</div>
              <div className="text-sm font-medium mt-1 mb-6 opacity-60 group-hover:opacity-100 transition-opacity">{dayData.fullDate}</div>
              
              <div className="text-xl md:text-2xl font-light mb-4 capitalize leading-tight break-words hyphens-auto line-clamp-3">
                {forecast.description}
              </div>
              
              <div className="mt-auto pt-4 border-t border-[color:var(--theme-border)] flex justify-between items-end gap-2">
                <div className="flex flex-col w-12 shrink-0 gap-1.5">
                  <div className="flex items-center gap-1 opacity-70">
                    <CloudRain size={10} className="text-blue-400" />
                    <span className="text-[9px] font-semibold tracking-widest uppercase">Rain</span>
                  </div>
                  <div className="h-1.5 w-full bg-[color:var(--theme-fg)]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.round(forecast.pop * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider text-blue-400/80">{Math.round(forecast.pop * 100)}%</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 opacity-50">
                    <Thermometer size={10} />
                    <span className="text-[9px] font-semibold tracking-widest uppercase">Temp</span>
                  </div>
                  <div className="text-xl font-medium whitespace-nowrap">
                    {convertTemp(forecast.maxTemp)}°<span className="opacity-50 text-sm ml-1">/{convertTemp(forecast.minTemp)}°</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {extraDays.map((day, index) => (
          <div
            key={`extra-${index}`}
            className="border border-[color:var(--theme-border)] rounded-2xl p-6 flex flex-col bg-[color:var(--theme-bg)]/10 backdrop-blur-md hover:bg-[color:var(--theme-bg)]/30 transition-colors cursor-pointer group opacity-80 hover:opacity-100"
            onClick={() => handleDayClick(day, true)}
          >
            <div className="font-medium text-xl md:text-2xl tracking-tight">{day.dayName}</div>
            <div className="text-sm font-medium mt-1 mb-6 opacity-60 group-hover:opacity-100 transition-opacity">{day.fullDate}</div>
            
            <div className="text-xl md:text-2xl font-light mb-4 capitalize leading-tight opacity-70">
              Estimated Trend
            </div>
            
            <div className="mt-auto pt-4 border-t border-[color:var(--theme-border)] flex justify-between items-end">
              <div className="text-xl font-medium">
                {convertTemp(day.forecast.maxTemp)}°<span className="opacity-50 text-sm ml-1">/{convertTemp(day.forecast.minTemp)}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent 
          className="border border-[color:var(--theme-border)] p-5 md:p-8 max-w-2xl w-[95vw] md:w-full rounded-2xl md:rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          style={{
            backgroundColor: theme?.bg || '#000',
            color: theme?.fg || '#fff',
            backgroundImage: selectedDay ? getWeatherGradient(selectedDay.forecast) : 'none',
            '--theme-bg': theme?.bg,
            '--theme-fg': theme?.fg,
            '--theme-border': theme?.border
          }}
        >
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-light tracking-tight">
              {selectedDay?.name}, <span className="opacity-50">{selectedDay?.fullDate}</span>
              {selectedDay?.isEstimated && <span className="text-sm ml-2 opacity-50 bg-[color:var(--theme-fg)] text-[color:var(--theme-bg)] px-2 py-1 rounded-full">Estimated</span>}
            </DialogTitle>
          </DialogHeader>

          {selectedDay && (
            <div className="flex flex-col gap-8 mt-6">
              <div className="border-b border-[color:var(--theme-border)] pb-6 md:pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-2 md:gap-4">
                <div className="text-3xl md:text-5xl font-light capitalize leading-tight w-full md:w-2/3 break-words hyphens-auto">
                  {selectedDay.forecast.description}
                </div>
                <div className="text-3xl md:text-4xl font-medium whitespace-nowrap">
                  {convertTemp(selectedDay.forecast.maxTemp)}°<span className="opacity-50 text-xl md:text-2xl ml-1">/{convertTemp(selectedDay.forecast.minTemp)}°</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6 font-medium text-base md:text-lg">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-[color:var(--theme-fg)]/5">
                  <span className="opacity-50 text-sm uppercase tracking-wider">Humidity</span>
                  {selectedDay.forecast.humidity}%
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-[color:var(--theme-fg)]/5">
                  <span className="opacity-50 text-sm uppercase tracking-wider">Wind</span>
                  {convertSpeed(selectedDay.forecast.windSpeed)} {getSpeedUnit()}
                </div>
              </div>

              {!selectedDay.isEstimated && selectedDay.hourlyData && (
                <div className="mt-4 border-t border-[color:var(--theme-border)] pt-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-medium tracking-wide opacity-70">Hourly Temperature Curve</h3>
                  </div>
                  
                  {(() => {
                    const items = selectedDay.hourlyData.slice(0, 8);
                    const temps = items.map(h => convertTemp(h.temp));
                    const minT = Math.min(...temps);
                    const maxT = Math.max(...temps);
                    const range = maxT - minT || 1;
                    
                    const points = temps.map((t, i) => {
                      const x = (i / 7) * 1000;
                      const y = 80 - ((t - minT) / range) * 60; // range 20 to 80
                      return `${x},${y}`;
                    });

                    return (
                      <div className="w-full flex flex-col relative">
                        <svg viewBox="0 0 1000 100" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="curveGrad" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <polyline 
                            points={`0,100 ${points.join(' ')} 1000,100`} 
                            fill="url(#curveGrad)"
                          />
                          <polyline 
                            points={points.join(' ')} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        
                        <div className="flex justify-between mt-4 relative w-full px-[2%]">
                          {items.map((hour, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                              <div className="text-xs font-medium opacity-70 mb-1">{hour.time}:00</div>
                              
                              <div className="flex items-center gap-1 mt-1 opacity-50">
                                <Thermometer size={10} />
                              </div>
                              <div className="text-lg font-medium mb-1">{convertTemp(hour.temp)}°</div>
                              
                              <div className="flex flex-col gap-1 items-center mt-3 w-8">
                                <div className="flex items-center gap-1 opacity-70">
                                  <CloudRain size={10} className="text-blue-400" />
                                </div>
                                <div className="h-8 w-1.5 bg-[color:var(--theme-fg)]/10 rounded-full flex flex-col justify-end overflow-hidden mt-1">
                                  <div className="w-full bg-blue-500 rounded-full" style={{ height: `${hour.pop * 100}%` }} />
                                </div>
                                {hour.pop > 0 ? (
                                  <div className="text-[9px] font-semibold text-blue-400 mt-0.5">{(hour.pop * 100).toFixed(0)}%</div>
                                ) : (
                                  <div className="text-[9px] opacity-0 mt-0.5">-</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {selectedDay.isEstimated && (
                <div className="mt-4 p-4 rounded-xl bg-[color:var(--theme-fg)]/5 text-center text-sm font-medium opacity-70">
                  This is a long-range trend estimate. Detailed hourly data is unavailable.
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
