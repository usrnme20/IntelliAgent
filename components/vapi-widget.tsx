"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, PhoneOff } from "lucide-react"

interface VapiWidgetProps {
  courseId: string
  language: "Spanish" | "French"
}

export const VapiWidget: React.FC<VapiWidgetProps> = ({ courseId, language }) => {
  const [vapi, setVapi] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([])
  const [assistantId, setAssistantId] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // Get Vapi configuration from server
    const getVapiConfig = async () => {
      try {
        const response = await fetch("/api/vapi-config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        })

        if (!response.ok) {
          throw new Error("Failed to get Vapi configuration")
        }

        const config = await response.json()

        if (!config.hasApiKey) {
          setConfigError("Voice assistant not configured. Please contact support.")
          return
        }

        setAssistantId(config.assistantId)
      } catch (error) {
        console.error("Error getting Vapi config:", error)
        setConfigError("Unable to load voice assistant configuration.")
      }
    }

    getVapiConfig()
  }, [courseId])

  useEffect(() => {
    if (!assistantId) return

    // Dynamically import Vapi to avoid SSR issues
    const loadVapi = async () => {
      try {
        const { default: Vapi } = await import("@vapi-ai/web")

        // Use a server endpoint to get the API key securely
        const response = await fetch("/api/vapi-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to get API token")
        }

        const { token } = await response.json()
        const vapiInstance = new Vapi(token)
        setVapi(vapiInstance)

        // Event listeners
        vapiInstance.on("call-start", () => {
          console.log("Call started")
          setIsConnected(true)
          setIsLoading(false)
        })

        vapiInstance.on("call-end", () => {
          console.log("Call ended")
          setIsConnected(false)
          setIsSpeaking(false)
          setIsLoading(false)
        })

        vapiInstance.on("speech-start", () => {
          console.log("Assistant started speaking")
          setIsSpeaking(true)
        })

        vapiInstance.on("speech-end", () => {
          console.log("Assistant stopped speaking")
          setIsSpeaking(false)
        })

        vapiInstance.on("message", (message: any) => {
          if (message.type === "transcript") {
            setTranscript((prev) => [
              ...prev,
              {
                role: message.role,
                text: message.transcript,
              },
            ])
          }
        })

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error)
          setIsLoading(false)
          setIsConnected(false)
        })
      } catch (error) {
        console.error("Failed to load Vapi:", error)
        setConfigError("Failed to initialize voice assistant.")
      }
    }

    loadVapi()

    return () => {
      if (vapi) {
        vapi.stop()
      }
    }
  }, [assistantId])

  const startCall = () => {
    if (vapi && assistantId) {
      setIsLoading(true)
      vapi.start(assistantId)
    }
  }

  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  if (configError) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-center text-red-500">
            <p className="text-sm">{configError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vapi || !assistantId) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">Loading voice assistant...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">Practice {language} Speaking</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Start a conversation with your AI {language} tutor
            </div>
            <Button onClick={startCall} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Speaking Practice
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                <span className="text-sm font-medium">{isSpeaking ? "Tutor Speaking..." : "Listening..."}</span>
              </div>
              <Button onClick={endCall} variant="destructive" size="sm">
                <PhoneOff className="h-4 w-4 mr-1" />
                End
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {transcript.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">Start speaking in {language}...</p>
              ) : (
                transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm p-2 rounded max-w-[80%] ${
                      msg.role === "user" ? "bg-blue-500 text-white ml-auto" : "bg-white dark:bg-gray-700 border"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            <div className="text-xs text-gray-500 text-center">
              Speak naturally in {language}. Your tutor will respond and help you practice!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
