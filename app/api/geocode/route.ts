import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "RayderWeatherApp/1.0" } }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch location data" },
        { status: response.status },
      )
    }

    const data = await response.json()
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
      return NextResponse.json({ name: city })
    } else {
      return NextResponse.json({ error: "No location found for the given coordinates" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching location data:", error)
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 })
  }
}
