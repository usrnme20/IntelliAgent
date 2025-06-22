import { NextResponse } from "next/server"

export async function POST() {
  try {
    const apiKey = process.env.VAPI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Vapi API key not configured" }, { status: 500 })
    }

    // Return the API key securely from server
    return NextResponse.json({
      token: apiKey,
    })
  } catch (error) {
    console.error("Error getting Vapi token:", error)
    return NextResponse.json({ error: "Failed to get API token" }, { status: 500 })
  }
}
