import { LettaClient } from "@letta-ai/letta-client"
import { z } from "zod"

// Schema for quiz generation
const QuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
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

// Enhanced fallback questions for each course
const getFallbackQuestions = (courseId: string, quizType: string, unit?: string) => {
  const fallbackQuestions = {
    "ap-biology": [
      {
        id: "bio_1",
        question: "Which of the following best describes the process of cellular respiration?",
        options: [
          "The conversion of light energy into chemical energy",
          "The breakdown of glucose to produce ATP",
          "The synthesis of proteins from amino acids",
          "The replication of DNA during cell division",
        ],
        correctAnswer: 1,
        explanation:
          "Cellular respiration is the process by which cells break down glucose and other organic molecules to produce ATP, the energy currency of the cell.",
        unit: unit || "Cellular Energetics",
        difficulty: "medium" as const,
      },
      {
        id: "bio_2",
        question: "What is the primary function of the mitochondria?",
        options: ["Protein synthesis", "DNA storage", "ATP production", "Waste removal"],
        correctAnswer: 2,
        explanation:
          "Mitochondria are known as the powerhouses of the cell because they produce most of the ATP through cellular respiration.",
        unit: unit || "Cell Structure and Function",
        difficulty: "easy" as const,
      },
      {
        id: "bio_3",
        question: "Which process occurs during the light-dependent reactions of photosynthesis?",
        options: ["Carbon dioxide fixation", "ATP and NADPH production", "Glucose synthesis", "Oxygen consumption"],
        correctAnswer: 1,
        explanation:
          "During the light-dependent reactions, light energy is converted to chemical energy in the form of ATP and NADPH.",
        unit: unit || "Cellular Energetics",
        difficulty: "medium" as const,
      },
    ],
    "ap-us-history": [
      {
        id: "hist_1",
        question: "Which event is considered the primary cause of the American Revolution?",
        options: ["The Boston Tea Party", "The Stamp Act", "Taxation without representation", "The Boston Massacre"],
        correctAnswer: 2,
        explanation:
          "The principle of 'taxation without representation' was the fundamental grievance that led to the American Revolution.",
        unit: unit || "Period 3: 1754-1800",
        difficulty: "medium" as const,
      },
      {
        id: "hist_2",
        question: "What was the main purpose of the Monroe Doctrine?",
        options: [
          "To establish trade relations with Europe",
          "To prevent European colonization in the Americas",
          "To form military alliances",
          "To promote westward expansion",
        ],
        correctAnswer: 1,
        explanation:
          "The Monroe Doctrine warned European powers against further colonization or interference in the Americas.",
        unit: unit || "Period 4: 1800-1848",
        difficulty: "medium" as const,
      },
    ],
    "ap-chemistry": [
      {
        id: "chem_1",
        question: "What is the electron configuration of oxygen?",
        options: ["1s² 2s² 2p⁴", "1s² 2s² 2p⁶", "1s² 2s² 2p²", "1s² 2s⁴"],
        correctAnswer: 0,
        explanation: "Oxygen has 8 electrons, so its electron configuration is 1s² 2s² 2p⁴.",
        unit: unit || "Atomic Structure and Properties",
        difficulty: "easy" as const,
      },
      {
        id: "chem_2",
        question: "Which type of bond is formed when electrons are shared between atoms?",
        options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
        correctAnswer: 1,
        explanation: "Covalent bonds form when atoms share electrons to achieve stable electron configurations.",
        unit: unit || "Molecular and Ionic Compound Structure",
        difficulty: "easy" as const,
      },
    ],
  }

  const courseQuestions =
    fallbackQuestions[courseId as keyof typeof fallbackQuestions] || fallbackQuestions["ap-biology"]

  // Return appropriate number of questions based on quiz type
  const questionCount = quizType === "exam" ? courseQuestions.length : Math.min(courseQuestions.length, 2)
  return courseQuestions.slice(0, questionCount)
}

export async function POST(req: Request) {
  let courseId: string | undefined
  let quizType: string | undefined
  let unit: string | undefined

  try {
    const body = await req.json()
    courseId = body.courseId
    quizType = body.quizType
    unit = body.unit
    const questionCount = body.questionCount || 5

    console.log("Quiz generation request:", { courseId, quizType, unit, questionCount })

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]

    if (!agentId) {
      console.log(`No agent ID found for course: ${courseId}, using fallback`)
      return Response.json({
        questions: getFallbackQuestions(courseId, quizType, unit),
        metadata: {
          courseId,
          quizType: "fallback",
          unit: unit || "Sample",
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: "Agent not configured",
        },
      })
    }

    if (!process.env.LETTA_API_KEY) {
      console.log("LETTA_API_KEY not found, using fallback")
      return Response.json({
        questions: getFallbackQuestions(courseId, quizType, unit),
        metadata: {
          courseId,
          quizType: "fallback",
          unit: unit || "Sample",
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: "API key not configured",
        },
      })
    }

    try {
      // Initialize Letta client
      console.log("Initializing Letta client for quiz generation...")
      const client = new LettaClient({
        token: process.env.LETTA_API_KEY,
      })

      // Create the quiz generation prompt based on type
      let prompt = ""
      const courseName = courseId.replace("ap-", "AP ").replace("-", " ").toUpperCase()

      if (quizType === "unit" && unit) {
        prompt = `Please generate a ${questionCount}-question multiple choice quiz focused specifically on "${unit}" for ${courseName}.

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer",
      "unit": "${unit}",
      "difficulty": "medium"
    }
  ]
}

Requirements:
- All questions should be AP-level difficulty appropriate for the actual AP exam
- Include a mix of conceptual understanding and application questions
- Each question should have exactly 4 answer choices
- correctAnswer should be the index (0-3) of the correct option
- Provide clear explanations for the correct answers
- Use authentic AP exam question formats and styles
- Generate exactly ${questionCount} questions

Do not include any text before or after the JSON object.`
      } else if (quizType === "review") {
        prompt = `Please generate a ${questionCount}-question review quiz for ${courseName} that focuses on topics students commonly struggle with.

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer",
      "unit": "Unit name",
      "difficulty": "medium"
    }
  ]
}

Requirements:
- Target areas where students typically have difficulty
- Include questions from multiple units to provide comprehensive review
- Mix of difficulty levels with emphasis on medium to hard questions
- Each question should have exactly 4 answer choices
- correctAnswer should be the index (0-3) of the correct option
- Provide detailed explanations that help clarify common misconceptions
- Use AP exam format and style
- Generate exactly ${questionCount} questions

Do not include any text before or after the JSON object.`
      } else if (quizType === "exam") {
        prompt = `Please generate a ${questionCount}-question practice exam for ${courseName} that simulates the multiple choice section of the actual AP exam.

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer",
      "unit": "Unit name",
      "difficulty": "medium"
    }
  ]
}

Requirements:
- Questions should span the entire course curriculum
- Maintain authentic AP exam difficulty and question formats
- Include the types of questions students will see on the real exam
- Each question should have exactly 4 answer choices
- correctAnswer should be the index (0-3) of the correct option
- Mix of units and difficulty levels representative of the actual exam
- Provide explanations that reinforce key concepts
- Generate exactly ${questionCount} questions

Do not include any text before or after the JSON object.`
      }

      console.log("Sending quiz generation request to Letta agent...")
      // Send message to Letta agent
      const response = await client.agents.sendMessage({
        agentId: agentId,
        message: prompt,
        role: "user",
      })

      console.log("Letta quiz response received")

      // Extract the assistant's response
      let assistantResponse = ""
      if (response.messages && response.messages.length > 0) {
        // Get the last assistant message
        const lastMessage = response.messages[response.messages.length - 1]
        if (lastMessage.role === "assistant") {
          assistantResponse = lastMessage.text || ""
        }
      }

      if (!assistantResponse) {
        throw new Error("No response from Letta agent")
      }

      // Try to parse the JSON response
      let parsedResponse
      try {
        // Clean the response - remove any markdown formatting or extra text
        let cleanResponse = assistantResponse.trim()

        // Look for JSON object in the response
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
      const validatedResponse = QuizSchema.parse(parsedResponse)

      // Add IDs to questions if not provided
      const questionsWithIds = validatedResponse.questions.map((q, index) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${index}`,
      }))

      console.log(`Successfully generated ${questionsWithIds.length} questions`)

      return Response.json({
        questions: questionsWithIds,
        metadata: {
          courseId,
          quizType,
          unit,
          generatedAt: new Date().toISOString(),
          source: "letta",
          agentId,
        },
      })
    } catch (lettaError) {
      console.error("Letta API error during quiz generation:", lettaError)
      // Fall back to sample questions
      return Response.json({
        questions: getFallbackQuestions(courseId, quizType, unit),
        metadata: {
          courseId,
          quizType: "fallback",
          unit: unit || "Sample",
          generatedAt: new Date().toISOString(),
          fallback: true,
          source: "fallback",
          error: "Letta API error",
        },
      })
    }
  } catch (error) {
    console.error("Quiz generation error:", error)

    // Return fallback questions if generation fails
    const fallbackQuestions = getFallbackQuestions(courseId || "ap-biology", quizType || "unit", unit)

    return Response.json({
      questions: fallbackQuestions,
      metadata: {
        courseId: courseId || "unknown",
        quizType: "fallback",
        unit: unit || "Sample",
        generatedAt: new Date().toISOString(),
        fallback: true,
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
