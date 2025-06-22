import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId } = body;

    console.log("Received Vapi config request for courseId:", courseId); // Add this log

    // Get the assistant ID based on course
    const assistantId =
      courseId === "ap-spanish"
        ? process.env.VAPI_SPANISH_ASSISTANT_ID
        : process.env.VAPI_FRENCH_ASSISTANT_ID;

    if (!assistantId) {
      console.error(
        `Error: Assistant ID not found for courseId: ${courseId}. Check VAPI_SPANISH_ASSISTANT_ID or VAPI_FRENCH_ASSISTANT_ID environment variables.`
      ); // More specific error
      return NextResponse.json(
        { error: "Assistant not configured for this course" },
        { status: 400 }
      );
    }

    if (!process.env.VAPI_API_KEY) {
      console.error("Error: VAPI_API_KEY environment variable is not set."); // New log
      return NextResponse.json(
        { error: "Vapi API key not configured" }, // More specific error message for client
        { status: 400 } // Or 500, depending on how you want to expose this
      );
    }

    console.log("Successfully retrieved assistantId:", assistantId); // Success log

    // Return only the assistant ID - API key stays on server
    return NextResponse.json({
      assistantId,
      hasApiKey: !!process.env.VAPI_API_KEY, // This should always be true if the check above passes
    });
  } catch (error) {
    console.error("Error getting Vapi config:", error);
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}
