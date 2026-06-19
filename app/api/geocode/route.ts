import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch location data" },
        { status: response.status },
      )
    }

    const data = await response.json()
    if (data && data.length > 0) {
      return NextResponse.json(data[0])
    } else {
      return NextResponse.json({ error: "No location found for the given coordinates" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching location data:", error)
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 })
  }
}
