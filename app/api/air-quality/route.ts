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
    
    const { latitude, longitude } = geoData.results[0];

    const aqResponse = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,pm10,pm2_5,ammonia`);
    
    if (!aqResponse.ok) {
       return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: aqResponse.status });
    }

    const aqData = await aqResponse.json();
    
    let aqi = 1;
    const eaqi = aqData.current.european_aqi;
    if (eaqi > 20) aqi = 2;
    if (eaqi > 40) aqi = 3;
    if (eaqi > 60) aqi = 4;
    if (eaqi > 80) aqi = 5;

    const mappedAq = {
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

    return NextResponse.json(mappedAq)
  } catch (error) {
    console.error("Error fetching air quality data:", error)
    return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: 500 })
  }
}
