import { LettaClient } from "@letta-ai/letta-client";
import { NextResponse } from 'next/server'; // <-- Added for Response.json alternative

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
    "ap-french": `Bonjour! En tant que votre tuteur AP Français, je peux vous aider avec "${userMessage}". Cela se rapporte aux thèmes culturels et linguísticos que nous étudions. Aimeriez-vous pratiquer la conversación ou trabajar en un tema específico?`,
    "ap-chemistry": `As your AP Chemistry tutor, I can help explain "${userMessage}" using chemical principles. This relates to the fundamental concepts we study in AP Chemistry. Would you like me to break down the chemistry concepts or help with problem-solving strategies?`,
    "ap-csa": `As your AP Computer Science A tutor, I can help you understand "${userMessage}" in the context of Java programming and computer science concepts. Would you like me to explain the programming concepts or help with coding practice?`,
  }

  return courseResponses[courseId as keyof typeof courseResponses] || courseResponses["ap-biology"]
}

// Helper to extract text content from a message (handles string or array of TextContent)
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
    const body = await req.json()
    const { messages, courseId } = body

    console.log("Chat API called with:", { courseId, messageCount: messages?.length })

    if (!courseId) {
      console.error("No courseId provided")
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 }) // <-- Changed
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("No messages provided")
      return NextResponse.json({ error: "Messages are required" }, { status: 400 }) // <-- Changed
    }

    const agentId = COURSE_AGENTS[courseId as keyof typeof COURSE_AGENTS]
    const latestMessage = messages[messages.length - 1]

    console.log("Agent ID:", agentId)
    // Use the helper function to safely extract content from latestMessage
    const latestMessageContent = extractTextContent(latestMessage?.content);
    console.log("Latest message content:", latestMessageContent);


    // If no agent ID is configured, use fallback
    if (!agentId) {
      console.log("No agent ID found, using fallback response")
      return NextResponse.json({ // <-- Changed
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessageContent || "your question"),
      })
    }

    // If no Letta API key, use fallback
    if (!process.env.LETTA_API_KEY) {
      console.log("No Letta API key found, using fallback response")
      return NextResponse.json({ // <-- Changed
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessageContent || "your question"),
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
      const response = await client.agents.messages.create(agentId, {
        messages: [{ role: "user", content: latestMessageContent }], // <-- Used extracted content
      });

      console.log("Letta response received:", response)

      // Extract the assistant's response
      let assistantResponse = "";
      if (response.messages && response.messages.length > 0) {
        // Look for the last message that is of type 'assistant_message'
        for (let i = response.messages.length - 1; i >= 0; i--) {
          const message = response.messages[i];
          // Check for 'assistant_message' and ensure it has content
          if (message.messageType === "assistant_message" && message.content) {
            assistantResponse = extractTextContent(message.content); // <-- Used helper here too
            break; // Found the last assistant message, exit loop
          }
          // Optionally, handle tool return messages if needed for display
          if (message.messageType === "tool_return_message" && message.toolReturn) {
              assistantResponse = extractTextContent(message.toolReturn); // <-- Used helper here too
              // You might want a more sophisticated way to combine these,
              // but for now, prioritizing toolReturn if no assistant message is found
          }
        }
      }

      // If, after checking all messages, no assistant response was found, use a fallback
      if (!assistantResponse) {
        console.log("No assistant or tool return response found, using fallback")
        assistantResponse = getFallbackResponse(courseId, latestMessageContent)
      }

      console.log("Extracted assistant response:", assistantResponse)

      return NextResponse.json({ // <-- Changed
        role: "assistant",
        content: assistantResponse,
      })
    } catch (lettaError) {
      console.error("Letta API error:", lettaError)

      // Use fallback response when Letta fails
      return NextResponse.json({ // <-- Changed
        role: "assistant",
        content: getFallbackResponse(courseId, latestMessageContent || "your question"),
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)

    // Return a generic error response
    return NextResponse.json({ // <-- Changed
      role: "assistant",
      content:
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or let me know if you'd like to discuss any specific AP topics!",
    })
  }
}