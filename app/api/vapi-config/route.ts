import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { courseId } = body

    // Get the assistant ID based on course
    const assistantId =
      courseId === "ap-spanish" ? process.env.VAPI_SPANISH_ASSISTANT_ID : process.env.VAPI_FRENCH_ASSISTANT_ID

    if (!assistantId) {
      return NextResponse.json({ error: "Assistant not configured for this course" }, { status: 400 })
    }

    // Return only the assistant ID - API key stays on server
    return NextResponse.json({
      assistantId,
      hasApiKey: !!process.env.VAPI_API_KEY,
    })
  } catch (error) {
    console.error("Error getting Vapi config:", error)
    return NextResponse.json({ error: "Failed to get configuration" }, { status: 500 })
  }
}
