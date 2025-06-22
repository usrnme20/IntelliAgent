import { LettaClient } from "@letta-ai/letta-client"

const COURSE_AGENTS = {
  "ap-biology": process.env.LETTA_AGENT_AP_BIOLOGY,
  "ap-us-history": process.env.LETTA_AGENT_AP_US_HISTORY,
  "ap-spanish": process.env.LETTA_AGENT_AP_SPANISH,
  "ap-french": process.env.LETTA_AGENT_AP_FRENCH,
  "ap-chemistry": process.env.LETTA_AGENT_AP_CHEMISTRY,
  "ap-csa": process.env.LETTA_AGENT_AP_CSA,
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

        const response = await client.agents.sendMessage({
          agentId: agentId,
          message: prompt,
          role: "user",
        })

        // Extract the assistant's response
        if (response.messages && response.messages.length > 0) {
          const lastMessage = response.messages[response.messages.length - 1]
          if (lastMessage.role === "assistant") {
            recommendations = lastMessage.text || ""
          }
        }
      } catch (error) {
        console.error("Error sending results to Letta agent:", error)
      }
    }

    // Fallback recommendations if Letta is not available
    if (!recommendations) {
      recommendations =
        score >= 80
          ? "Excellent work! You have a strong understanding of this material. Consider moving on to more challenging topics or taking a practice exam."
          : score >= 60
            ? "Good progress! Focus on reviewing the areas where you missed questions. Consider additional practice in those specific units."
            : "This material needs more review. I recommend going back to study the fundamental concepts and taking additional practice quizzes."
    }

    return Response.json({
      score,
      totalQuestions,
      correctAnswers,
      weakUnits,
      recommendations,
      performance: score >= 80 ? "excellent" : score >= 60 ? "good" : "needs_improvement",
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    return Response.json({ error: "Failed to process quiz results" }, { status: 500 })
  }
}
