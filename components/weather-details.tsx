import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, Sunrise, Sunset, Gauge } from "lucide-react"

export default function WeatherDetails({ weather, isMetric = true }) {
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

  return (
    <Card className="bg-white/10 backdrop-blur-md border-none text-white">
      <CardHeader>
        <CardTitle>Weather Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Thermometer className="h-6 w-6 mb-2" />
            <span className="text-sm">Temperature</span>
            <span className="text-lg font-bold">
              {convertTemp(weather.main.temp)}°{isMetric ? "C" : "F"}
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Thermometer className="h-6 w-6 mb-2" />
            <span className="text-sm">Feels Like</span>
            <span className="text-lg font-bold">
              {convertTemp(weather.main.feels_like)}°{isMetric ? "C" : "F"}
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Thermometer className="h-6 w-6 mb-2" />
            <span className="text-sm">Min Temp</span>
            <span className="text-lg font-bold">
              {convertTemp(weather.main.temp_min)}°{isMetric ? "C" : "F"}
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Thermometer className="h-6 w-6 mb-2" />
            <span className="text-sm">Max Temp</span>
            <span className="text-lg font-bold">
              {convertTemp(weather.main.temp_max)}°{isMetric ? "C" : "F"}
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Droplets className="h-6 w-6 mb-2" />
            <span className="text-sm">Humidity</span>
            <span className="text-lg font-bold">{weather.main.humidity}%</span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Gauge className="h-6 w-6 mb-2" />
            <span className="text-sm">Pressure</span>
            <span className="text-lg font-bold">{weather.main.pressure} hPa</span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Wind className="h-6 w-6 mb-2" />
            <span className="text-sm">Wind Speed</span>
            <span className="text-lg font-bold">
              {convertSpeed(weather.wind.speed)} {getSpeedUnit()}
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Wind className="h-6 w-6 mb-2" />
            <span className="text-sm">Wind Direction</span>
            <span className="text-lg font-bold">{weather.wind.deg}°</span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Sunrise className="h-6 w-6 mb-2" />
            <span className="text-sm">Sunrise</span>
            <span className="text-lg font-bold">{formatTime(weather.sys.sunrise)}</span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
            <Sunset className="h-6 w-6 mb-2" />
            <span className="text-sm">Sunset</span>
            <span className="text-lg font-bold">{formatTime(weather.sys.sunset)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
