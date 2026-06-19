"use client"

import { useState, useCallback } from "react"
import { MapPin } from "lucide-react"

export default function WeatherMap({ lat, lon, cityName }) {
  const [mapType, setMapType] = useState("temp")
  const [mapKey, setMapKey] = useState(0)
  const [loading, setLoading] = useState(true)

  const handleMapTypeChange = useCallback(
    (value) => {
      // Only reload if the map type actually changed
      if (value !== mapType) {
        setMapType(value)
        setLoading(true)
      }
    },
    [mapType],
  )

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6">
      <div className="flex w-full flex-wrap pb-4 gap-2">
        {["temp", "rain", "clouds", "wind"].map((type) => (
          <button
            key={type}
            onClick={() => handleMapTypeChange(type)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
              mapType === type 
                ? "bg-[color:var(--theme-fg)] text-[color:var(--theme-bg)] border-transparent" 
                : "bg-transparent border-[color:var(--theme-border)] hover:bg-[color:var(--theme-border)]"
            }`}
          >
            {type === 'temp' ? 'Temperature' : type === 'rain' ? 'Precipitation' : type === 'clouds' ? 'Cloud Cover' : 'Wind Speed'}
          </button>
        ))}
      </div>

      <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-[color:var(--theme-border)] bg-[#0F172A] min-h-[50vh] md:min-h-0 shadow-2xl shadow-black/20">
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center font-light tracking-widest text-sm opacity-50 z-50 pointer-events-none bg-[color:var(--theme-bg)]">
            Syncing Map Data...
          </div>
        )}
        
        <iframe
          key={`${lat}-${lon}-${mapType}-${mapKey}`}
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=8&level=surface&overlay=${mapType}&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
          frameBorder="0"
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
        ></iframe>
        
        {/* Floating Reset Button */}
        <button 
          onClick={() => { setLoading(true); setMapKey(k => k + 1) }}
          className="absolute bottom-4 right-4 z-[500] bg-black/60 text-white backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-white hover:text-black transition-all transform hover:scale-105 active:scale-95"
        >
          <MapPin size={14} /> Recenter
        </button>
      </div>
    </div>
  )
}
