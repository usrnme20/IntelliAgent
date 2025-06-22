import { LettaClient } from "@letta-ai/letta-client";
import { NextResponse } from 'next/server'; // <-- Import NextResponse

// Course-specific agent IDs
const COURSE_AGENTS = {
  "ap-biology": process.env.LETTA_AGENT_AP_BIOLOGY,
  "ap-us-history": process.env.LETTA_AGENT_AP_US_HISTORY,
  "ap-spanish": process.env.LETTA_AGENT_AP_SPANISH,
  "ap-french": process.env.LETTA_AGENT_AP_FRENCH,
  "ap-chemistry": process.env.LETTA_AGENT_AP_CHEMISTRY,
  "ap-csa": process.env.LETTA_AGENT_AP_CSA,
}

// Helper to extract text content from a message (copied from chat/route.ts for consistency)
function extractTextContent(content: any): string {
    if (typeof content === 'string') {
        return content;
    }
    // Assuming 'content' could be an array like [{ type: 'text', text: '...' }]
    if (Array.isArray(content)) {
        return content.map(item => (item && typeof item === 'object' && 'text' in item ? item.text : '')).join('');
    }
    return ''; // Return empty string if content is neither string nor array
}

export async function POST(req: Request) {
  try {
    const { courseId, quizResults, quizType, unit } = await req.json()

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]

    // Calculate performance metrics
    const totalQuestions = quizResults.length
    const correctAnswers = quizResults.filter((result: any) => result.correct).length
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    // Identify weak areas
    const incorrectQuestions = quizResults.filter((result: any) => !result.correct)
    const weakUnits = [...new Set(incorrectQuestions.map((q: any) => q.unit))]

    let recommendations = ""

    if (agentId && process.env.LETTA_API_KEY) {
      try {
        // Initialize Letta client
        const client = new LettaClient({
          token: process.env.LETTA_API_KEY,
        })

        // Send performance data to the agent for memory storage
        const prompt = `Student completed a ${quizType} quiz${unit ? ` on ${unit}` : ""}.

Performance Summary:
- Score: ${score}% (${correctAnswers}/${totalQuestions})
- Quiz Type: ${quizType}
- Date: ${new Date().toLocaleDateString()}

${
  incorrectQuestions.length > 0
    ? `
Areas needing improvement:
${incorrectQuestions.map((q: any) => `- ${q.unit}: ${q.question.substring(0, 100)}...`).join("\n")}

Weak units identified: ${weakUnits.join(", ")}
`
    : "Excellent performance! All questions answered correctly."
}

Please update your memory of this student's progress and provide personalized recommendations for improvement. Keep your response concise and actionable.`

        console.log("Sending quiz results to Letta agent with prompt:", prompt); // Added logging

        // CHANGE START: Correct Letta API call
        const response = await client.agents.messages.create(agentId, {
          messages: [{ role: "user", content: prompt }], // Send the prompt as a user message
        });
        // CHANGE END

        console.log("Letta response received for quiz results:", response); // Added logging

        // CHANGE START: Correct response extraction
        if (response.messages && response.messages.length > 0) {
          // Look for the last message that is of type 'assistant_message'
          for (let i = response.messages.length - 1; i >= 0; i--) {
            const message = response.messages[i];
            // Check for 'assistant_message' and ensure it has content
            if (message.messageType === "assistant_message" && message.content) {
              recommendations = extractTextContent(message.content);
              break; // Found the last assistant message, exit loop
            }
            // Also consider tool returns if the agent might use a tool to provide recommendations
            if (message.messageType === "tool_return_message" && message.toolReturn) {
              // You might decide how to incorporate tool returns.
              // For simplicity, here we'll prioritize an assistant message,
              // but if only a tool return is there, we'll use it.
              if (!recommendations) { // Only assign if no assistant message found yet
                  recommendations = extractTextContent(message.toolReturn);
              }
            }
          }
        }
        // CHANGE END

      } catch (error) {
        console.error("Error sending results to Letta agent:", error)
      }
    }

    // Fallback recommendations if Letta is not available or failed
    if (!recommendations) {
      console.log("Using fallback recommendations."); // Added logging
      recommendations =
        score >= 80
          ? "Excellent work! You have a strong understanding of this material. Consider moving on to more challenging topics or taking a practice exam."
          : score >= 60
            ? "Good progress! Focus on reviewing the areas where you missed questions. Consider additional practice in those specific units."
            : "This material needs more review. I recommend going back to study the fundamental concepts and taking additional practice quizzes."
    }

    return NextResponse.json({ // <-- Changed
      score,
      totalQuestions,
      correctAnswers,
      weakUnits,
      recommendations,
      performance: score >= 80 ? "excellent" : score >= 60 ? "good" : "needs_improvement",
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json({ error: "Failed to process quiz results" }, { status: 500 }) // <-- Changed
  }
}
