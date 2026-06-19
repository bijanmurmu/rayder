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

    // Then get weather alerts using coordinates
    const alertsResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${apiKey}`,
    )

    if (!alertsResponse.ok) {
      const errorData = await alertsResponse.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch alerts data" },
        { status: alertsResponse.status },
      )
    }

    const alertsData = await alertsResponse.json()

    // Return alerts if available, otherwise return empty array
    return NextResponse.json({
      alerts: alertsData.alerts || [],
    })
  } catch (error) {
    console.error("Error fetching alerts data:", error)
    return NextResponse.json({ error: "Failed to fetch alerts data" }, { status: 500 })
  }
}
