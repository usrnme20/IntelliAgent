import { LettaClient } from "@letta-ai/letta-client"
import { z } from "zod"
import { NextResponse } from "next/server"

// Schema for course info
const CourseInfoSchema = z.object({
  units: z.array(z.string()),
  progressAreas: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      skills: z.array(z.string()),
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

// Fallback course information
const getFallbackCourseInfo = (courseId: string) => {
  const fallbackInfo = {
    "ap-biology": {
      units: [
        "Chemistry of Life",
        "Cell Structure and Function",
        "Cellular Energetics",
        "Cell Communication and Cell Cycle",
        "Heredity",
        "Gene Expression and Regulation",
        "Natural Selection",
        "Ecology",
      ],
      progressAreas: [
        {
          name: "Concept Explanation",
          description: "Explain biological concepts and processes",
          skills: ["Define key terms", "Describe processes", "Explain relationships"],
        },
        {
          name: "Visual Representations",
          description: "Analyze and create visual models",
          skills: ["Interpret graphs", "Create diagrams", "Analyze data"],
        },
        {
          name: "Questions and Methods",
          description: "Design and analyze experiments",
          skills: ["Form hypotheses", "Design experiments", "Analyze results"],
        },
        {
          name: "Data Analysis",
          description: "Represent and describe data",
          skills: ["Statistical analysis", "Graph interpretation", "Data representation"],
        },
      ],
    },
    "ap-us-history": {
      units: [
        "Period 1: 1491-1607",
        "Period 2: 1607-1754",
        "Period 3: 1754-1800",
        "Period 4: 1800-1848",
        "Period 5: 1844-1877",
        "Period 6: 1865-1898",
        "Period 7: 1890-1945",
        "Period 8: 1945-1980",
        "Period 9: 1980-Present",
      ],
      progressAreas: [
        {
          name: "Chronological Reasoning",
          description: "Analyze historical patterns and connections",
          skills: ["Identify patterns", "Analyze continuity", "Evaluate change over time"],
        },
        {
          name: "Comparison and Contextualization",
          description: "Compare and contextualize historical events",
          skills: ["Compare historical developments", "Contextualize events", "Connect to broader themes"],
        },
        {
          name: "Crafting Historical Arguments",
          description: "Develop and support historical arguments",
          skills: ["Create thesis statements", "Use evidence", "Develop arguments"],
        },
        {
          name: "Historical Interpretation",
          description: "Analyze and interpret historical sources",
          skills: ["Analyze primary sources", "Evaluate perspectives", "Assess credibility"],
        },
      ],
    },
    "ap-spanish": {
      units: [
        "Families and Communities",
        "Science and Technology",
        "Beauty and Aesthetics",
        "Contemporary Life",
        "Global Challenges",
        "Personal and Public Identities",
      ],
      progressAreas: [
        {
          name: "Interpersonal Communication",
          description: "Exchange information and ideas in conversations",
          skills: ["Initiate conversations", "Maintain discussions", "Express opinions"],
        },
        {
          name: "Interpretive Communication",
          description: "Understand and interpret spoken and written Spanish",
          skills: ["Comprehend audio", "Understand texts", "Identify main ideas"],
        },
        {
          name: "Presentational Communication",
          description: "Present information and ideas to an audience",
          skills: ["Oral presentations", "Written essays", "Cultural comparisons"],
        },
      ],
    },
    "ap-french": {
      units: [
        "Families and Communities",
        "Science and Technology",
        "Beauty and Aesthetics",
        "Contemporary Life",
        "Global Challenges",
        "Personal and Public Identities",
      ],
      progressAreas: [
        {
          name: "Interpersonal Communication",
          description: "Exchange information and ideas in conversations",
          skills: ["Initiate conversations", "Maintain discussions", "Express opinions"],
        },
        {
          name: "Interpretive Communication",
          description: "Understand and interpret spoken and written French",
          skills: ["Comprehend audio", "Understand texts", "Identify main ideas"],
        },
        {
          name: "Presentational Communication",
          description: "Present information and ideas to an audience",
          skills: ["Oral presentations", "Written essays", "Cultural comparisons"],
        },
      ],
    },
    "ap-chemistry": {
      units: [
        "Atomic Structure and Properties",
        "Molecular and Ionic Compound Structure",
        "Intermolecular Forces and Properties",
        "Chemical Reactions",
        "Kinetics",
        "Thermodynamics",
        "Equilibrium",
        "Acids and Bases",
        "Applications of Thermodynamics",
      ],
      progressAreas: [
        {
          name: "Models and Representations",
          description: "Create and use models to explain chemical phenomena",
          skills: ["Molecular models", "Reaction mechanisms", "Energy diagrams"],
        },
        {
          name: "Question and Method",
          description: "Determine scientific questions and methods",
          skills: ["Design experiments", "Identify variables", "Plan procedures"],
        },
        {
          name: "Representing Data",
          description: "Create representations of data",
          skills: ["Graphs and charts", "Mathematical relationships", "Data analysis"],
        },
        {
          name: "Mathematical Routines",
          description: "Use mathematics to solve chemical problems",
          skills: ["Stoichiometry", "Equilibrium calculations", "Thermodynamic calculations"],
        },
      ],
    },
    "ap-csa": {
      units: [
        "Primitive Types",
        "Using Objects",
        "Boolean Expressions and if Statements",
        "Iteration",
        "Writing Classes",
        "Array",
        "ArrayList",
        "2D Array",
        "Inheritance",
        "Recursion",
      ],
      progressAreas: [
        {
          name: "Program Design and Algorithm Development",
          description: "Design and implement computer programs",
          skills: ["Algorithm design", "Program structure", "Problem decomposition"],
        },
        {
          name: "Code Logic",
          description: "Apply programming concepts and practices",
          skills: ["Control structures", "Method implementation", "Object-oriented design"],
        },
        {
          name: "Code Implementation",
          description: "Write program code to create objects and call methods",
          skills: ["Class creation", "Method calls", "Variable usage"],
        },
        {
          name: "Code Testing",
          description: "Test program code and correct errors",
          skills: ["Debug programs", "Test cases", "Error identification"],
        },
      ],
    },
  }

  return fallbackInfo[courseId as keyof typeof fallbackInfo] || fallbackInfo["ap-biology"]
}

export async function POST(req: Request) {
  let courseId: string | undefined

  try {
    const body = await req.json()
    courseId = body.courseId

    console.log("Course info request:", { courseId })

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]

    if (!agentId) {
      console.log(`No agent ID found for course: ${courseId}, using fallback`)
      return NextResponse.json({
        ...getFallbackCourseInfo(courseId),
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
        ...getFallbackCourseInfo(courseId),
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
      console.log("Initializing Letta client for course info...")
      const client = new LettaClient({
        token: process.env.LETTA_API_KEY,
      })

      const courseName = courseId.replace("ap-", "AP ").replace("-", " ").toUpperCase()

      const prompt = `Please provide the official course structure and skill areas for ${courseName} based on the College Board Course and Exam Description.

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "units": ["Unit 1 Name", "Unit 2 Name", ...],
  "progressAreas": [
    {
      "name": "Skill Area Name",
      "description": "Description of this skill area",
      "skills": ["Specific skill 1", "Specific skill 2", ...]
    }
  ]
}

Requirements:
- Use the exact unit names from the official AP Course and Exam Description
- Include all units in the correct order
- List the official AP skill areas (like Science Practices for sciences, Historical Thinking Skills for history, etc.)
- Provide accurate descriptions for each skill area
- List specific skills within each area
- Use official College Board terminology

Do not include any text before or after the JSON object.`

      console.log("Sending course info request to Letta agent...")
      const response = await client.agents.messages.create(agentId, {
        messages: [{ role: "user", content: prompt }],
      })

      console.log("Letta course info response received")

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
      const validatedResponse = CourseInfoSchema.parse(parsedResponse)

      console.log(`Successfully retrieved course info for ${courseId}`)

      return NextResponse.json({
        ...validatedResponse,
        metadata: {
          courseId,
          generatedAt: new Date().toISOString(),
          source: "letta",
          agentId,
        },
      })
    } catch (lettaError) {
      console.error("Letta API error during course info retrieval:", lettaError)
      return NextResponse.json({
        ...getFallbackCourseInfo(courseId),
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
    console.error("Course info error:", error)

    const fallbackInfo = getFallbackCourseInfo(courseId || "ap-biology")

    return NextResponse.json({
      ...fallbackInfo,
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
