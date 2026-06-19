import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  try {
    // 1. Geocode ONCE
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    
    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch everything in parallel
    const [weatherRes, forecastRes, aqRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=auto`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,pm10,pm2_5,ammonia`)
    ]);

    const [weatherData, forecastData, aqData] = await Promise.all([
      weatherRes.ok ? weatherRes.json() : null,
      forecastRes.ok ? forecastRes.json() : null,
      aqRes.ok ? aqRes.json() : null,
    ]);

    // Map Weather
    const wmoToOwm = (code: number) => {
        if (code === 0) return { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
        if (code === 1 || code === 2 || code === 3) return { id: 802, main: "Clouds", description: "partly cloudy", icon: "03d" };
        if (code >= 51 && code <= 67) return { id: 500, main: "Rain", description: "rain", icon: "10d" };
        if (code >= 71 && code <= 77) return { id: 600, main: "Snow", description: "snow", icon: "13d" };
        if (code >= 95) return { id: 200, main: "Thunderstorm", description: "thunderstorm", icon: "11d" };
        return { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
    }

    const weather = weatherData ? {
      name: name,
      sys: {
        country: country || "",
        sunrise: new Date(weatherData.daily?.sunrise?.[0] || Date.now()).getTime() / 1000,
        sunset: new Date(weatherData.daily?.sunset?.[0] || Date.now()).getTime() / 1000,
      },
      weather: [wmoToOwm(weatherData.current.weather_code)],
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
      coord: { lat: latitude, lon: longitude },
      visibility: 10000 // default
    } : null;

    // Map Forecast
    const list = [];
    if (forecastData) {
      for (let i = 0; i < 120 && i < forecastData.hourly.time.length; i += 3) {
         list.push({
            dt: new Date(forecastData.hourly.time[i]).getTime() / 1000,
            main: {
              temp: forecastData.hourly.temperature_2m[i],
              feels_like: forecastData.hourly.apparent_temperature[i],
              temp_min: forecastData.hourly.temperature_2m[i],
              temp_max: forecastData.hourly.temperature_2m[i],
              pressure: forecastData.hourly.surface_pressure[i],
              humidity: forecastData.hourly.relative_humidity_2m[i],
            },
            weather: [wmoToOwm(forecastData.hourly.weather_code[i])],
            wind: {
              speed: forecastData.hourly.wind_speed_10m[i],
              deg: forecastData.hourly.wind_direction_10m[i],
            },
            pop: forecastData.hourly.precipitation_probability[i] / 100
         });
      }
    }
    const forecast = forecastData ? { list, city: { name, country: country || "" } } : null;

    // Map AQ
    let airQuality = null;
    if (aqData) {
      let aqi = 1;
      const eaqi = aqData.current.european_aqi;
      if (eaqi > 20) aqi = 2;
      if (eaqi > 40) aqi = 3;
      if (eaqi > 60) aqi = 4;
      if (eaqi > 80) aqi = 5;
      airQuality = {
        main: { aqi },
        components: {
          co: aqData.current.carbon_monoxide || 0,
          no: 0, 
          no2: aqData.current.nitrogen_dioxide || 0,
          o3: aqData.current.ozone || 0,
          so2: aqData.current.sulphur_dioxide || 0,
          pm2_5: aqData.current.pm2_5 || 0,
          pm10: aqData.current.pm10 || 0,
          nh3: aqData.current.ammonia || 0,
        }
      };
    }

    return NextResponse.json({ weather, forecast, airQuality, alerts: [] }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
    });

  } catch (error) {
    console.error("Error fetching all weather data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
