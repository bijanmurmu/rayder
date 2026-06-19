import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  // Open-Meteo does not provide a global severe weather alerts endpoint
  // Returning an empty array to maintain frontend compatibility.
  return NextResponse.json({
    alerts: [],
  })
}
