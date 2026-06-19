"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WeatherMap({ lat, lon, cityName }) {
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [mapType, setMapType] = useState("temp_new")

  const handleMapTypeChange = useCallback(
    (value) => {
      // Only reload if the map type actually changed
      if (value !== mapType) {
        setMapType(value)
      }
    },
    [mapType],
  )

  useEffect(() => {
    // Don't reload if we're already loading this map type
    if (mapRef.current && mapRef.current.dataset.mapType === mapType && !loading) {
      return
    }

    setLoading(true)

    // Use a timeout to prevent too many rapid reloads
    const timer = setTimeout(() => {
      const iframe = document.createElement("iframe")
      iframe.src = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${mapType}&lat=${lat}&lon=${lon}&zoom=8`
      iframe.width = "100%"
      iframe.height = "400"
      iframe.style.border = "none"
      iframe.style.borderRadius = "0.5rem"
      iframe.loading = "lazy" // Add lazy loading
      iframe.onload = () => setLoading(false)

      if (mapRef.current) {
        mapRef.current.innerHTML = ""
        mapRef.current.appendChild(iframe)
        mapRef.current.dataset.mapType = mapType
      }
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [lat, lon, mapType])

  return (
    <div className="w-full">
      <h3 className="text-base font-medium mb-3">Weather Map for {cityName}</h3>

      <Tabs defaultValue="temp_new" onValueChange={handleMapTypeChange} className="mb-3">
        <TabsList className="bg-white/10 border-none w-full">
          <TabsTrigger value="temp_new" className="data-[state=active]:bg-white/20 flex-1 text-xs">
            Temperature
          </TabsTrigger>
          <TabsTrigger value="precipitation_new" className="data-[state=active]:bg-white/20 flex-1 text-xs">
            Precipitation
          </TabsTrigger>
          <TabsTrigger value="clouds_new" className="data-[state=active]:bg-white/20 flex-1 text-xs">
            Clouds
          </TabsTrigger>
          <TabsTrigger value="wind_new" className="data-[state=active]:bg-white/20 flex-1 text-xs">
            Wind
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-[400px] bg-white/10" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-[400px] rounded-lg overflow-hidden"></div>
      </div>

      <p className="text-xs text-white/70 mt-2">Map data provided by OpenWeatherMap</p>
    </div>
  )
}
