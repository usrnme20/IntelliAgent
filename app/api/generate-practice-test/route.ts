import { LettaClient } from "@letta-ai/letta-client"
import { z } from "zod"
import { NextResponse } from "next/server"

// Schema for practice test generation
const PracticeTestSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      type: z.enum(["short-answer", "long-essay", "data-analysis", "synthesis"]),
      points: z.number(),
      timeLimit: z.string(),
      rubric: z.string(),
      unit: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
})

// Course-specific agent IDs
const COURSE_AGENTS = {
  "ap-biology": process.env.LETTA_AGENT_AP_BIOLOGY,
  "ap-us-history": process.env.LETTA_AGENT_AP_US_HISTORY,
  "ap-spanish": process.env.LETTA_AGENT_AP_SPANISH,
  "ap-french": process.env.LETTA_AGENT_AP_FRENCH,
  "ap-chemistry": process.env.LETTA_AGENT_AP_CHEMISTRY,
  "ap-csa": process.env.LETTA_AGENT_AP_CSA,
}

// Helper to extract text content from a message
function extractTextContent(content: any): string {
  if (typeof content === "string") {
    return content
  }
  if (Array.isArray(content)) {
    return content.map((item) => (item && typeof item === "object" && "text" in item ? item.text : "")).join("")
  }
  return ""
}

// Enhanced fallback practice test questions for each course
const getFallbackPracticeTest = (courseId: string) => {
  const fallbackTests = {
    "ap-biology": [
      {
        id: "bio_frq_1",
        question:
          "Explain the process of cellular respiration, including the three main stages. Describe how ATP is produced in each stage and explain the role of oxygen in the process. Include specific details about where each stage occurs in the cell.",
        type: "long-essay" as const,
        points: 10,
        timeLimit: "25 minutes",
        rubric:
          "4 points for explaining glycolysis, 3 points for citric acid cycle, 3 points for electron transport chain",
        unit: "Cellular Energetics",
        difficulty: "medium" as const,
      },
      {
        id: "bio_frq_2",
        question:
          "A student conducted an experiment to test the effect of different pH levels on enzyme activity. Analyze the data provided and explain the relationship between pH and enzyme function. Predict what would happen at extreme pH values.",
        type: "data-analysis" as const,
        points: 8,
        timeLimit: "20 minutes",
        rubric: "3 points for data analysis, 3 points for explanation of enzyme structure, 2 points for predictions",
        unit: "Chemistry of Life",
        difficulty: "medium" as const,
      },
    ],
    "ap-us-history": [
      {
        id: "hist_frq_1",
        question:
          "Evaluate the extent to which the American Revolution was a radical departure from previous forms of government. In your response, consider political, social, and economic changes that occurred during and after the Revolution.",
        type: "long-essay" as const,
        points: 15,
        timeLimit: "40 minutes",
        rubric: "Thesis (1 pt), Contextualization (1 pt), Evidence (3 pts), Analysis (4 pts), Reasoning (6 pts)",
        unit: "Period 3: 1754-1800",
        difficulty: "hard" as const,
      },
    ],
    "ap-chemistry": [
      {
        id: "chem_frq_1",
        question:
          "A student performs a titration of a weak acid with a strong base. Given the data below, calculate the Ka of the weak acid and explain the shape of the titration curve. Include discussion of buffer regions and equivalence point.",
        type: "data-analysis" as const,
        points: 12,
        timeLimit: "30 minutes",
        rubric: "4 points for calculations, 4 points for curve explanation, 4 points for chemical reasoning",
        unit: "Acids and Bases",
        difficulty: "hard" as const,
      },
    ],
  }

  return fallbackTests[courseId as keyof typeof fallbackTests] || fallbackTests["ap-biology"]
}

export async function POST(req: Request) {
  let courseId: string | undefined

  try {
    const body = await req.json()
    courseId = body.courseId
    const questionCount = body.questionCount || 3

    console.log("Practice test generation request:", { courseId, questionCount })

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]

    if (!agentId) {
      console.log(`No agent ID found for course: ${courseId}, using fallback`)
      return NextResponse.json({
        questions: getFallbackPracticeTest(courseId),
        metadata: {
          courseId,
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: "Agent not configured",
        },
      })
    }

    if (!process.env.LETTA_API_KEY) {
      console.log("LETTA_API_KEY not found, using fallback")
      return NextResponse.json({
        questions: getFallbackPracticeTest(courseId),
        metadata: {
          courseId,
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: "API key not configured",
        },
      })
    }

    try {
      // Initialize Letta client
      console.log("Initializing Letta client for practice test generation...")
      const client = new LettaClient({
        token: process.env.LETTA_API_KEY,
      })

      // Create the practice test generation prompt
      const courseName = courseId.replace("ap-", "AP ").replace("-", " ").toUpperCase()

      const prompt = `Please generate a ${questionCount}-question AP practice test with free response questions for ${courseName}.

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Detailed free response question text here...",
      "type": "long-essay",
      "points": 10,
      "timeLimit": "25 minutes",
      "rubric": "Detailed scoring rubric",
      "unit": "Unit name",
      "difficulty": "medium"
    }
  ]
}

Requirements:
- Generate authentic AP-style free response questions
- Include a mix of question types: "short-answer", "long-essay", "data-analysis", "synthesis"
- Each question should be substantial and require detailed responses
- Provide clear scoring rubrics that match AP standards
- Include appropriate time limits for each question
- Questions should span different units of the course
- Use the actual AP exam format and expectations
- Generate exactly ${questionCount} questions

Do not include any text before or after the JSON object.`

      console.log("Sending practice test generation request to Letta agent...")
      const response = await client.agents.messages.create(agentId, {
        messages: [{ role: "user", content: prompt }],
      })

      console.log("Letta practice test response received")

      // Extract the assistant's response
      let assistantResponse = ""
      if (response.messages && response.messages.length > 0) {
        for (let i = response.messages.length - 1; i >= 0; i--) {
          const message = response.messages[i]
          if (message.messageType === "assistant_message" && message.content) {
            assistantResponse = extractTextContent(message.content)
            break
          }
          if (message.messageType === "tool_return_message" && message.toolReturn) {
            if (!assistantResponse) {
              assistantResponse = extractTextContent(message.toolReturn)
            }
          }
        }
      }

      if (!assistantResponse) {
        throw new Error("No response from Letta agent")
      }

      // Try to parse the JSON response
      let parsedResponse
      try {
        let cleanResponse = assistantResponse.trim()
        const jsonStart = cleanResponse.indexOf("{")
        const jsonEnd = cleanResponse.lastIndexOf("}")

        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1)
        }

        parsedResponse = JSON.parse(cleanResponse)
      } catch (parseError) {
        console.error("Failed to parse Letta response:", assistantResponse)
        throw new Error("Invalid JSON response from agent")
      }

      // Validate the response structure
      const validatedResponse = PracticeTestSchema.parse(parsedResponse)

      // Add IDs to questions if not provided
      const questionsWithIds = validatedResponse.questions.map((q, index) => ({
        ...q,
        id: q.id || `frq_${Date.now()}_${index}`,
      }))

      console.log(`Successfully generated ${questionsWithIds.length} practice test questions`)

      return NextResponse.json({
        questions: questionsWithIds,
        metadata: {
          courseId,
          generatedAt: new Date().toISOString(),
          source: "letta",
          agentId,
        },
      })
    } catch (lettaError) {
      console.error("Letta API error during practice test generation:", lettaError)
      return NextResponse.json({
        questions: getFallbackPracticeTest(courseId),
        metadata: {
          courseId,
          generatedAt: new Date().toISOString(),
          fallback: true,
          source: "fallback",
          error: lettaError instanceof Error ? lettaError.message : "Unknown Letta API error",
        },
      })
    }
  } catch (error) {
    console.error("Practice test generation error:", error)

    const fallbackQuestions = getFallbackPracticeTest(courseId || "ap-biology")

    return NextResponse.json({
      questions: fallbackQuestions,
      metadata: {
        courseId: courseId || "unknown",
        generatedAt: new Date().toISOString(),
        fallback: true,
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
