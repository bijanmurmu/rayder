export interface WeatherData {
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
  }
  dt: number
  coord: {
    lat: number
    lon: number
  }
}

export interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      humidity: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
      deg: number
    }
    pop: number // Probability of precipitation
  }>
  city: {
    name: string
    country: string
    sunrise: number
    sunset: number
  }
}

export interface AirQualityData {
  main: {
    aqi: number
  }
  components: {
    co: number
    no: number
    no2: number
    o3: number
    so2: number
    pm2_5: number
    pm10: number
    nh3: number
  }
}

export interface WeatherAlert {
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags: string[]
}

export interface LocationData {
  name: string
  city: string
  timestamp?: number
}

export interface UserPreferences {
  isMetric: boolean
  isDarkMode: boolean
  recentSearches: string[]
}
