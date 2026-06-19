"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWeatherApi } from "@/hooks/use-weather-api"
import { useWeatherPreferences } from "@/hooks/use-weather-preferences"
import dynamic from "next/dynamic"
import { Search, Map as MapIcon, Calendar, Home, Wind, Droplets, Thermometer, CloudRain, Sunrise, Sunset, Gauge, Activity } from "lucide-react"

const WeatherForecast = dynamic(() => import("@/components/weather-forecast"), { ssr: false, loading: () => <div className="w-full h-64 animate-pulse bg-white/5 rounded-3xl" /> })
const DynamicWeatherEngine = dynamic(() => import("@/components/dynamic-weather-engine"), { ssr: false })
const WeatherMap = dynamic(() => import("@/components/weather-map"), { ssr: false })

export default function WeatherApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState("HOME") 
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef(null)

  const { preferences, toggleUnits } = useWeatherPreferences()
  const { weather, forecast, airQuality, loading, error, fetchWeather } = useWeatherApi()
  const { isMetric } = preferences

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
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
            fetchWeather("Kolkata")
          } catch (err) {
            fetchWeather("Kolkata")
          }
        },
        () => fetchWeather("Kolkata"),
      )
    } else {
      fetchWeather("Kolkata")
    }
  }, [fetchWeather])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim() && !loading) {
      fetchWeather(searchQuery)
      setSearchQuery("")
      setView("HOME")
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

  const getAirQualityLabel = (aqi) => {
    switch (aqi) {
      case 1: return { label: "GOOD", color: "text-emerald-400" }
      case 2: return { label: "FAIR", color: "text-green-400" }
      case 3: return { label: "MODERATE", color: "text-yellow-400" }
      case 4: return { label: "POOR", color: "text-orange-400" }
      case 5: return { label: "TOXIC", color: "text-red-500" }
      default: return { label: "UNKNOWN", color: "text-slate-400" }
    }
  }

  const formatTime = (timestamp) => {
    if (!weather) return "";
    const d = new Date((timestamp + weather.timezone) * 1000);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
  }

  const isDay = weather ? (Date.now() / 1000 > weather.sys.sunrise && Date.now() / 1000 < weather.sys.sunset) : true

  // CINEMATIC MINIMALIST THEME
  const getTheme = () => {
    if (!weather) return { bg: "#0F172A", fg: "#FFFFFF", border: "rgba(255,255,255,0.1)" }
    const id = weather.weather[0].id
    
    // Thunder - Deep stormy charcoal
    if (id >= 200 && id <= 232) return { bg: "#111827", fg: "#E5E7EB", border: "rgba(255,255,255,0.1)" } 
    // Rain/Drizzle - Muted slate blue
    if (id >= 300 && id <= 531) return { bg: "#1E293B", fg: "#F8FAFC", border: "rgba(255,255,255,0.15)" } 
    // Snow - Frosty silver (Day), Dark slate (Night)
    if (id >= 600 && id <= 622) return isDay ? { bg: "#E2E8F0", fg: "#0F172A", border: "rgba(0,0,0,0.1)" } : { bg: "#1E293B", fg: "#F8FAFC", border: "rgba(255,255,255,0.1)" }
    // Clear
    if (id === 800) return isDay ? { bg: "#3B82F6", fg: "#FFFFFF", border: "rgba(255,255,255,0.2)" } : { bg: "#0F172A", fg: "#F8FAFC", border: "rgba(255,255,255,0.1)" }
    // Clouds
    if (id >= 801 && id <= 804) return isDay ? { bg: "#CBD5E1", fg: "#0F172A", border: "rgba(0,0,0,0.1)" } : { bg: "#1E293B", fg: "#E2E8F0", border: "rgba(255,255,255,0.1)" }
    
    return { bg: "#0F172A", fg: "#FFFFFF", border: "rgba(255,255,255,0.1)" }
  }

  const theme = getTheme()

  return (
    <div 
      className="font-sans min-h-[100dvh] flex flex-col selection:bg-current selection:text-[color:var(--theme-bg)] transition-colors duration-1000"
      style={{ 
        backgroundColor: theme.bg, 
        color: theme.fg,
        '--theme-bg': theme.bg,
        '--theme-fg': theme.fg,
        '--theme-border': theme.border
      }}
    >
      {weather && <DynamicWeatherEngine weatherId={weather.weather[0].id} windSpeed={weather.wind.speed} isDay={isDay} themeBg={theme.bg} themeFg={theme.fg} />}
      
      {/* HEADER */}
      <header className="flex-none w-full h-20 border-b border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/60 backdrop-blur-xl z-50 px-6 md:px-12 flex items-center justify-between sticky top-0">
        <div className="text-2xl font-light tracking-wider">Rayder<span className="font-semibold">Weather</span></div>
        
        <form onSubmit={handleSearch} className="hidden md:flex h-10 w-[400px] relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
          <Input 
             ref={searchInputRef}
             value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search a city... (Cmd+K)"
             className="h-full w-full bg-transparent border border-[color:var(--theme-border)] rounded-full pl-10 pr-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[color:var(--theme-fg)] placeholder:opacity-50 text-[color:var(--theme-fg)] shadow-none"
          />
        </form>

        <div className="flex gap-4 items-center">
          <Button onClick={toggleUnits} variant="ghost" className="font-medium text-sm rounded-full hover:bg-[color:var(--theme-fg)] hover:text-[color:var(--theme-bg)] transition-colors border border-[color:var(--theme-border)]">
            {isMetric ? '°C' : '°F'}
          </Button>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      <div className="md:hidden w-full p-4 border-b border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/60 backdrop-blur-xl z-40 sticky top-20">
         <form onSubmit={handleSearch} className="relative">
           <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
           <Input 
             value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
             onFocus={() => setIsSearchFocused(true)}
             onBlur={() => setIsSearchFocused(false)}
             placeholder="Search city..."
             className="h-10 bg-transparent border border-[color:var(--theme-border)] rounded-full pl-10 text-sm focus-visible:ring-1 shadow-none"
           />
         </form>
      </div>

      {error && (
        <div className="w-full bg-red-500/10 text-red-500 border-b border-red-500/20 text-sm font-medium p-3 text-center z-50">
          {error}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {weather && !loading ? (
        <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row pb-24 md:pb-8 pt-6 md:pt-12 px-6 md:px-12 gap-8 md:gap-16">
          
          {/* NAVIGATION SIDEBAR (DESKTOP) */}
          <aside className="hidden md:flex flex-col gap-2 w-48 flex-shrink-0">
            <h3 className="text-xs font-semibold tracking-widest opacity-50 uppercase mb-4">Menu</h3>
            <button onClick={() => setView("HOME")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${view === "HOME" ? "bg-[color:var(--theme-fg)] text-[color:var(--theme-bg)]" : "hover:bg-[color:var(--theme-border)]"}`}>
              <Home size={18} /> Overview
            </button>
            <button onClick={() => setView("FORECAST")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${view === "FORECAST" ? "bg-[color:var(--theme-fg)] text-[color:var(--theme-bg)]" : "hover:bg-[color:var(--theme-border)]"}`}>
              <Calendar size={18} /> Forecast
            </button>
            <button onClick={() => setView("MAP")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${view === "MAP" ? "bg-[color:var(--theme-fg)] text-[color:var(--theme-bg)]" : "hover:bg-[color:var(--theme-border)]"}`}>
              <MapIcon size={18} /> Live Radar
            </button>
          </aside>

          {/* DYNAMIC VIEW CONTAINER */}
          <div className="flex-1 flex flex-col min-h-0 w-full">
            
            {view === "HOME" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-12">
                
                {/* HERO SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                  <div className="flex flex-col">
                    <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-2">
                      {weather.name}, <span className="font-semibold">{weather.sys.country}</span>
                    </h1>
                    <p className="text-lg md:text-xl opacity-70 font-medium capitalize flex items-center gap-2">
                      {weather.weather[0].description}
                    </p>
                  </div>
                  
                  <div className="text-[120px] md:text-[160px] font-light leading-none tracking-tighter">
                    {convertTemp(weather.main.temp)}°
                  </div>
                </div>

                {/* ELEGANT DATA GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Wind size={16} className="text-sky-400" /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Wind</span>
                    </div>
                    <div className="text-3xl font-light mb-1">{convertSpeed(weather.wind.speed)}</div>
                    <div className="text-sm font-medium opacity-70">{getSpeedUnit()}</div>
                  </div>
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Droplets size={16} className="text-cyan-400" /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Humidity</span>
                    </div>
                    <div className="text-3xl font-light mb-1">{weather.main.humidity}%</div>
                    <div className="text-sm font-medium opacity-70">Dew point: {convertTemp(weather.main.temp - ((100 - weather.main.humidity)/5))}°</div>
                  </div>
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Thermometer size={16} className="text-orange-400" /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Feels Like</span>
                    </div>
                    <div className="text-3xl font-light mb-1">{convertTemp(weather.main.feels_like)}°</div>
                    <div className="text-sm font-medium opacity-70">Actual: {convertTemp(weather.main.temp)}°</div>
                  </div>
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Gauge size={16} className="text-purple-400" /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Pressure</span>
                    </div>
                    <div className="text-3xl font-light mb-1">{weather.main.pressure}</div>
                    <div className="text-sm font-medium opacity-70">hPa</div>
                  </div>
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={16} className={airQuality ? getAirQualityLabel(airQuality.main.aqi).color : "text-slate-400"} /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Air Quality</span>
                    </div>
                    <div className={`text-3xl font-light mb-1 ${airQuality ? getAirQualityLabel(airQuality.main.aqi).color : ""}`}>{airQuality ? getAirQualityLabel(airQuality.main.aqi).label : "N/A"}</div>
                    <div className="text-sm font-medium opacity-70">Index: {airQuality ? airQuality.main.aqi : "-"}</div>
                  </div>
                  {/* Item */}
                  <div className="flex flex-col p-6 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <CloudRain size={16} className="text-indigo-300" /> <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Visibility</span>
                    </div>
                    <div className="text-3xl font-light mb-1">{(weather.visibility ? weather.visibility / 1000 : 10).toFixed(1)}</div>
                    <div className="text-sm font-medium opacity-70">km</div>
                  </div>
                </div>

                {/* SOLAR TRAJECTORY WIDGET */}
                <div className="w-full flex flex-col p-8 md:p-10 rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/20 backdrop-blur-md pb-24 md:pb-28">
                  <div className="flex items-center gap-2 mb-8 md:mb-12">
                    <Sunrise size={20} className="text-amber-400" /> <span className="text-sm font-semibold uppercase tracking-widest opacity-60">Solar Trajectory</span>
                  </div>
                  
                  <div className="relative w-full max-w-2xl mx-auto h-32 md:h-48 flex flex-col justify-end">
                    {/* SVG Arc */}
                    <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                      <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="4 4" />
                      
                      {(() => {
                        const nowUnix = Date.now() / 1000;
                        let sunPercent = 0;
                        if (nowUnix > weather.sys.sunset) sunPercent = 100;
                        else if (nowUnix > weather.sys.sunrise) sunPercent = ((nowUnix - weather.sys.sunrise) / (weather.sys.sunset - weather.sys.sunrise)) * 100;
                        
                        const sunAngle = Math.PI - (sunPercent/100) * Math.PI;
                        const sunX = 100 + 90 * Math.cos(sunAngle);
                        const sunY = 100 - 90 * Math.sin(sunAngle);
                        
                        return (
                          <>
                            {sunPercent > 0 && sunPercent < 100 && (
                              <path 
                                d={`M 10 100 A 90 90 0 0 1 ${sunX} ${sunY}`} 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                              />
                            )}
                            {sunPercent > 0 && sunPercent < 100 && (
                              <>
                                <circle 
                                  cx={sunX} 
                                  cy={sunY} 
                                  r="4" 
                                  fill="currentColor" 
                                />
                                <circle 
                                  cx={sunX} 
                                  cy={sunY} 
                                  r="12" 
                                  fill="currentColor" 
                                  fillOpacity="0.2"
                                />
                              </>
                            )}
                          </>
                        )
                      })()}
                    </svg>
                    
                    <div className="absolute bottom-0 left-0 translate-y-[140%] flex flex-col items-start">
                      <span className="text-xs font-semibold opacity-50 uppercase tracking-widest mb-1">Sunrise</span>
                      <span className="text-2xl font-light">{formatTime(weather.sys.sunrise)}</span>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 translate-y-[140%] flex flex-col items-end">
                      <span className="text-xs font-semibold opacity-50 uppercase tracking-widest mb-1">Sunset</span>
                      <span className="text-2xl font-light">{formatTime(weather.sys.sunset)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "FORECAST" && forecast && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                 <h2 className="text-3xl font-light mb-8">7-Day Forecast</h2>
                 <WeatherForecast forecast={forecast} isMetric={isMetric} theme={theme} />
               </motion.div>
            )}

            {view === "MAP" && weather && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex-1 min-h-[75vh] md:min-h-[80vh] flex flex-col">
                 <h2 className="text-3xl font-light mb-6">Live Radar</h2>
                 <div className="w-[calc(100%+3rem)] -mx-6 md:mx-0 md:w-full flex-1 rounded-none md:rounded-3xl overflow-hidden border-y md:border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)]/20 backdrop-blur-sm relative z-10 flex flex-col">
                   <WeatherMap lat={weather.coord.lat} lon={weather.coord.lon} cityName={weather.name} />
                 </div>
               </motion.div>
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <CloudRain className="w-12 h-12 mb-4 animate-bounce" />
          <div className="text-xl font-light tracking-wider">Syncing atmosphere...</div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={`md:hidden fixed bottom-0 w-full h-[80px] bg-[color:var(--theme-bg)]/80 backdrop-blur-xl border-t border-[color:var(--theme-border)] flex z-[100] pb-safe transition-transform duration-300 ${isSearchFocused ? 'translate-y-full' : 'translate-y-0'}`}>
        <button onClick={() => setView("HOME")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === "HOME" ? "text-[color:var(--theme-fg)]" : "opacity-40 hover:opacity-100"}`}>
          <Home size={20} />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => setView("FORECAST")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === "FORECAST" ? "text-[color:var(--theme-fg)]" : "opacity-40 hover:opacity-100"}`}>
          <Calendar size={20} />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Forecast</span>
        </button>
        <button onClick={() => setView("MAP")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === "MAP" ? "text-[color:var(--theme-fg)]" : "opacity-40 hover:opacity-100"}`}>
          <MapIcon size={20} />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Radar</span>
        </button>
      </nav>
    </div>
  )
}
