import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }


  try {
    // 1. Geocode the city using Open-Meteo Geocoding API
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    
    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch weather using Open-Meteo
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=auto`);
    
    if (!weatherResponse.ok) {
       return NextResponse.json({ error: "Failed to fetch weather data from Open-Meteo" }, { status: weatherResponse.status });
    }

    const weatherData = await weatherResponse.json();
    
    // Map WMO weather code to OpenWeatherMap style
    const wmoToOwm = (code: number) => {
        if (code === 0) return { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
        if (code === 1 || code === 2 || code === 3) return { id: 802, main: "Clouds", description: "partly cloudy", icon: "03d" };
        if (code >= 51 && code <= 67) return { id: 500, main: "Rain", description: "rain", icon: "10d" };
        if (code >= 71 && code <= 77) return { id: 600, main: "Snow", description: "snow", icon: "13d" };
        if (code >= 95) return { id: 200, main: "Thunderstorm", description: "thunderstorm", icon: "11d" };
        return { id: 800, main: "Clear", description: "clear sky", icon: "01d" }; // fallback
    }

    const weatherCodeInfo = wmoToOwm(weatherData.current.weather_code);

    // 3. Map to OpenWeatherMap expected format
    const mappedData = {
      name: name,
      sys: {
        country: country || "",
        sunrise: new Date(weatherData.daily?.sunrise?.[0] || Date.now()).getTime() / 1000,
        sunset: new Date(weatherData.daily?.sunset?.[0] || Date.now()).getTime() / 1000,
      },
      weather: [weatherCodeInfo],
      main: {
        temp: weatherData.current.temperature_2m,
        feels_like: weatherData.current.apparent_temperature,
        temp_min: weatherData.current.temperature_2m, 
        temp_max: weatherData.current.temperature_2m,
        pressure: weatherData.current.surface_pressure,
        humidity: weatherData.current.relative_humidity_2m,
      },
      wind: {
        speed: weatherData.current.wind_speed_10m,
        deg: weatherData.current.wind_direction_10m,
      },
      dt: new Date(weatherData.current.time).getTime() / 1000,
      coord: {
        lat: latitude,
        lon: longitude,
      }
    };

    // Add cache headers (10 minutes)
    return NextResponse.json(mappedData, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
