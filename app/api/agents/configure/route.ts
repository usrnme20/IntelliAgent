import { LettaClient } from "@letta-ai/letta-client"

// Expected agent names or keywords to match your existing agents
const AGENT_MAPPINGS = {
  "ap-biology": ["biology", "bio", "cellular", "genetics", "ecology"],
  "ap-us-history": ["history", "american", "us", "united states"],
  "ap-spanish": ["spanish", "español", "hispanic", "latino"],
  "ap-french": ["french", "français", "francophone"],
  "ap-chemistry": ["chemistry", "chem", "chemical", "molecular"],
  "ap-csa": ["computer science", "java", "programming", "coding", "csa"],
}

function findAgentForCourse(agents: any[], courseId: string): string | null {
  const keywords = AGENT_MAPPINGS[courseId as keyof typeof AGENT_MAPPINGS] || []

  // First, try exact name match
  const exactMatch = agents.find((agent) =>
    agent.name.toLowerCase().includes(courseId.replace("ap-", "").replace("-", " ")),
  )
  if (exactMatch) return exactMatch.id

  // Then try keyword matching
  for (const keyword of keywords) {
    const match = agents.find((agent) => agent.name.toLowerCase().includes(keyword.toLowerCase()))
    if (match) return match.id
  }

  return null
}

export async function POST() {
  try {
    if (!process.env.LETTA_API_KEY) {
      return Response.json({ error: "LETTA_API_KEY not configured" }, { status: 500 })
    }

    const client = new LettaClient({
      token: process.env.LETTA_API_KEY,
    })

    // Get all existing agents
    const agents = await client.agents.list()

    console.log(
      "Found agents:",
      agents.map((a) => ({ id: a.id, name: a.name })),
    )

    // Map courses to existing agents
    const courseAgents: Record<string, string | null> = {}
    const courses = ["ap-biology", "ap-us-history", "ap-spanish", "ap-french", "ap-chemistry", "ap-csa"]

    for (const courseId of courses) {
      const agentId = findAgentForCourse(agents, courseId)
      courseAgents[courseId] = agentId
      console.log(
        `${courseId} -> ${agentId ? `${agentId} (${agents.find((a) => a.id === agentId)?.name})` : "not found"}`,
      )
    }

    // Generate environment variables
    const envVars = Object.entries(courseAgents)
      .filter(([_, agentId]) => agentId)
      .map(([courseId, agentId]) => `LETTA_AGENT_${courseId.toUpperCase().replace("-", "_")}=${agentId}`)

    return Response.json({
      message: "Agent configuration completed",
      courseAgents,
      envVars,
      availableAgents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || "",
      })),
    })
  } catch (error) {
    console.error("Configuration error:", error)
    return Response.json({ error: "Failed to configure agents" }, { status: 500 })
  }
}
