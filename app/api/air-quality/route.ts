import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    // First get coordinates for the city
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)

    if (!geoResponse.ok) {
      const errorData = await geoResponse.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch location data" },
        { status: geoResponse.status },
      )
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    const { lat, lon } = geoData[0]

    // Then get air quality data using coordinates
    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    )

    if (!airQualityResponse.ok) {
      const errorData = await airQualityResponse.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch air quality data" },
        { status: airQualityResponse.status },
      )
    }

    const airQualityData = await airQualityResponse.json()

    if (airQualityData && airQualityData.list && airQualityData.list.length > 0) {
      return NextResponse.json(airQualityData.list[0])
    } else {
      return NextResponse.json({ error: "No air quality data available" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching air quality data:", error)
    return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: 500 })
  }
}
