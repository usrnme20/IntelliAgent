"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Mic, MicOff, Volume2, ExternalLink } from "lucide-react"

interface LanguageSectionProps {
  courseId: string
}

export function LanguageSection({ courseId }: LanguageSectionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const language = courseId === "ap-spanish" ? "Spanish" : "French"

  // Sample authentic resources
  const listeningResources = [
    {
      title: "News Report: Climate Change in Latin America",
      source: "BBC Mundo",
      duration: "3:45",
      level: "Intermediate",
      url: "https://example.com/audio1",
      transcript: "El cambio climático está afectando gravemente a América Latina...",
    },
    {
      title: "Interview: Young Entrepreneurs",
      source: "Radio Nacional",
      duration: "5:20",
      level: "Advanced",
      url: "https://example.com/audio2",
      transcript: "Los jóvenes emprendedores están transformando la economía...",
    },
    {
      title: "Cultural Documentary: Traditional Festivals",
      source: "Canal Cultural",
      duration: "4:15",
      level: "Intermediate",
      url: "https://example.com/audio3",
      transcript: "Las fiestas tradicionales mantienen viva la cultura...",
    },
  ]

  const speakingPrompts = [
    {
      theme: "Families and Communities",
      prompt: "Describe your ideal family vacation and explain why it would be meaningful to you.",
      timeLimit: "2 minutes",
    },
    {
      theme: "Global Challenges",
      prompt: "Discuss a global environmental issue and propose solutions that young people can implement.",
      timeLimit: "2 minutes",
    },
    {
      theme: "Contemporary Life",
      prompt: "Compare how technology has changed communication in your generation versus your parents' generation.",
      timeLimit: "2 minutes",
    },
  ]

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In real app, this would start/stop audio recording
  }

  const togglePlayback = (audioUrl: string) => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      // In real app, this would play the actual audio file
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 3000) // Mock playback
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{language} Speaking & Listening</h2>

      <Tabs defaultValue="listening" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listening">Listening Comprehension</TabsTrigger>
          <TabsTrigger value="speaking">Speaking Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="listening" className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-xl font-semibold">Authentic {language} Resources</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice with real {language} audio from news, interviews, and cultural content.
            </p>

            {listeningResources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <Badge variant="outline">{resource.level}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span>{resource.source}</span>
                    <span>•</span>
                    <span>{resource.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => togglePlayback(resource.url)}>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Transcript
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Source
                    </Button>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Practice Questions:</h4>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                      <li>• What is the main topic discussed?</li>
                      <li>• What are the key arguments presented?</li>
                      <li>• How does this relate to {language}-speaking cultures?</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="speaking" className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-xl font-semibold">Speaking Practice</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice speaking {language} with prompts based on AP exam themes.
            </p>

            {speakingPrompts.map((prompt, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Speaking Prompt {index + 1}</CardTitle>
                    <Badge variant="outline">{prompt.theme}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-medium">{prompt.prompt}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Time limit: {prompt.timeLimit}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant={isRecording ? "destructive" : "default"} onClick={toggleRecording}>
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>

                    {isRecording && (
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-sm">Recording...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Tips for Success:</h4>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                      <li>• Speak clearly and at a natural pace</li>
                      <li>• Use varied vocabulary and complex structures</li>
                      <li>• Support your ideas with specific examples</li>
                      <li>• Connect your response to {language}-speaking cultures</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
