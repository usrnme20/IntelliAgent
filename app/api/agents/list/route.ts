import { LettaClient } from "@letta-ai/letta-client"

export async function GET() {
  try {
    if (!process.env.LETTA_API_KEY) {
      return Response.json({ error: "LETTA_API_KEY not configured" }, { status: 500 })
    }

    const client = new LettaClient({
      token: process.env.LETTA_API_KEY,
    })

    // List all agents associated with this API key
    const agents = await client.agents.list()

    return Response.json({
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || "",
        created_at: agent.created_at,
      })),
    })
  } catch (error) {
    console.error("Error listing agents:", error)
    return Response.json({ error: "Failed to list agents" }, { status: 500 })
  }
}
