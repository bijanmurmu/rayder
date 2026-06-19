import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    
    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`);
    
    if (!weatherResponse.ok) {
       return NextResponse.json({ error: "Failed to fetch weather data from Open-Meteo" }, { status: weatherResponse.status });
    }

    const weatherData = await weatherResponse.json();
    
    const wmoToOwm = (code: number) => {
        if (code === 0) return { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
        if (code === 1 || code === 2 || code === 3) return { id: 802, main: "Clouds", description: "partly cloudy", icon: "03d" };
        if (code >= 51 && code <= 67) return { id: 500, main: "Rain", description: "rain", icon: "10d" };
        if (code >= 71 && code <= 77) return { id: 600, main: "Snow", description: "snow", icon: "13d" };
        if (code >= 95) return { id: 200, main: "Thunderstorm", description: "thunderstorm", icon: "11d" };
        return { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
    }

    const list = [];
    for (let i = 0; i < 120 && i < weatherData.hourly.time.length; i += 3) {
       list.push({
          dt: new Date(weatherData.hourly.time[i]).getTime() / 1000,
          main: {
            temp: weatherData.hourly.temperature_2m[i],
            feels_like: weatherData.hourly.apparent_temperature[i],
            temp_min: weatherData.hourly.temperature_2m[i],
            temp_max: weatherData.hourly.temperature_2m[i],
            pressure: weatherData.hourly.surface_pressure[i],
            humidity: weatherData.hourly.relative_humidity_2m[i],
          },
          weather: [wmoToOwm(weatherData.hourly.weather_code[i])],
          wind: {
            speed: weatherData.hourly.wind_speed_10m[i],
            deg: weatherData.hourly.wind_direction_10m[i],
          },
          pop: weatherData.hourly.precipitation_probability[i] / 100
       });
    }

    const mappedData = {
      list,
      city: {
        name: name,
        country: country || "",
        sunrise: 0,
        sunset: 0
      }
    };

    return NextResponse.json(mappedData, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error fetching forecast data:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}
