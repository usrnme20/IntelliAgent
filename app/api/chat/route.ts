import { LettaClient } from "@letta-ai/letta-client"

// Course-specific agent IDs
const COURSE_AGENTS = {
  "ap-biology": process.env.LETTA_AGENT_AP_BIOLOGY,
  "ap-us-history": process.env.LETTA_AGENT_AP_US_HISTORY,
  "ap-spanish": process.env.LETTA_AGENT_AP_SPANISH,
  "ap-french": process.env.LETTA_AGENT_AP_FRENCH,
  "ap-chemistry": process.env.LETTA_AGENT_AP_CHEMISTRY,
  "ap-csa": process.env.LETTA_AGENT_AP_CSA,
}

// Fallback responses for each course
const getFallbackResponse = (courseId: string, userMessage: string) => {
  const courseResponses = {
    "ap-biology": `As your AP Biology tutor, I'd be happy to help you with "${userMessage}". While I'm setting up my full capabilities, I can tell you that this topic relates to the AP Biology curriculum. Would you like me to explain any specific biological concepts or help you prepare for the AP exam?`,
    "ap-us-history": `As your AP US History tutor, I can help you understand "${userMessage}" in the context of American history. This connects to the broader themes we study in AP History. Would you like me to provide historical context or help with exam preparation?`,
    "ap-spanish": `¡Hola! Como tu tutor de AP Español, puedo ayudarte con "${userMessage}". Esto se relaciona con los temas culturales y lingüísticos que estudiamos. ¿Te gustaría practicar conversación o trabajar en algún tema específico?`,
    "ap-french": `Bonjour! En tant que votre tuteur AP Français, je peux vous aider avec "${userMessage}". Cela se rapporte aux thèmes culturels et linguistiques que nous étudions. Aimeriez-vous pratiquer la conversation ou travailler sur un sujet spécifique?`,
    "ap-chemistry": `As your AP Chemistry tutor, I can help explain "${userMessage}" using chemical principles. This relates to the fundamental concepts we study in AP Chemistry. Would you like me to break down the chemistry concepts or help with problem-solving strategies?`,
    "ap-csa": `As your AP Computer Science A tutor, I can help you understand "${userMessage}" in the context of Java programming and computer science concepts. Would you like me to explain the programming concepts or help with coding practice?`,
  }

  return courseResponses[courseId as keyof typeof courseResponses] || courseResponses["ap-biology"]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, courseId } = body

    console.log("Chat API called with:", { courseId, messageCount: messages?.length })

    if (!courseId) {
      console.error("No courseId provided")
      return Response.json({ error: "Course ID is required" }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("No messages provided")
      return Response.json({ error: "Messages are required" }, { status: 400 })
    }

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]
    const latestMessage = messages[messages.length - 1]

    console.log("Agent ID:", agentId)
    console.log("Latest message:", latestMessage?.content)

    // If no agent ID is configured, use fallback
    if (!agentId) {
      console.log("No agent ID found, using fallback response")
      return Response.json({
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessage?.content || "your question"),
      })
    }

    // If no Letta API key, use fallback
    if (!process.env.LETTA_API_KEY) {
      console.log("No Letta API key found, using fallback response")
      return Response.json({
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessage?.content || "your question"),
      })
    }

    try {
      // Initialize Letta client
      console.log("Initializing Letta client...")
      const client = new LettaClient({
        token: process.env.LETTA_API_KEY,
      })
    
      console.log("Sending message to Letta agent...")
      // Send message to Letta agent using the correct API method
      const response = await client.agents.messages.create(agentId, { // <<<<<< THIS LINE IS CHANGED
        messages: [{ role: "user", content: latestMessage.content }], // <<<<<< THIS LINE IS CHANGED
      });
    
      console.log("Letta response received:", response)
    
      // Extract the assistant's response - THIS PART ALSO NEEDS ADJUSTMENT
      let assistantResponse = "";
      if (response.messages && response.messages.length > 0) {
        // Look for the last assistant message that is of type 'assistant_message'
        // based on the Letta docs, it uses `messageType` not `role` for type checking
        for (let i = response.messages.length - 1; i >= 0; i--) {
          const message = response.messages[i];
          if (message.messageType === "assistant_message" && message.content) { // <<<< CHECK message.messageType and message.content
            assistantResponse = message.content;
            break;
          }
        }
      }
    
      // If we still don't have a response, try other fields
      // This fallback might not be strictly necessary if the above loop works reliably
      // based on the new message structure.
      if (!assistantResponse && response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        // The Letta docs show `content` not `text` for assistant messages.
        // `toolReturn` might also be a relevant field if tools are used.
        assistantResponse = lastMessage.content || lastMessage.toolReturn || "";
      }
    
      console.log("Extracted assistant response:", assistantResponse)

      // Extract the assistant's response
      let assistantResponse = ""
      if (response.messages && response.messages.length > 0) {
        // Look for the last assistant message
        for (let i = response.messages.length - 1; i >= 0; i--) {
          const message = response.messages[i]
          if (message.role === "assistant" && message.text) {
            assistantResponse = message.text
            break
          }
        }
      }

      // If we still don't have a response, try other fields
      if (!assistantResponse && response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1]
        assistantResponse = lastMessage.text || lastMessage.content || ""
      }

      console.log("Extracted assistant response:", assistantResponse)

      if (!assistantResponse) {
        console.log("No assistant response found, using fallback")
        assistantResponse = getFallbackResponse(courseId, latestMessage.content)
      }

      return Response.json({
        role: "assistant",
        content: assistantResponse,
      })
    } catch (lettaError) {
      console.error("Letta API error:", lettaError)

      // Use fallback response when Letta fails
      return Response.json({
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessage?.content || "your question"),
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)

    // Return a generic error response
    return Response.json({
      role: "assistant",
      content:
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or let me know if you'd like to discuss any specific AP topics!",
    })
  }
}
