"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Clock, Award, Loader2 } from "lucide-react"

interface PracticeQuestion {
  id: string
  question: string
  type: "short-answer" | "long-essay" | "data-analysis" | "synthesis"
  points: number
  timeLimit: string
  rubric: string
  unit: string
  difficulty: "easy" | "medium" | "hard"
}

interface PracticeTestSectionProps {
  courseId: string
}

export function PracticeTestSection({ courseId }: PracticeTestSectionProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const generatePracticeTest = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-practice-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          questionCount: 3,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate practice test")
      }

      const data = await response.json()
      setQuestions(data.questions)
      setResponses(new Array(data.questions.length).fill(""))
      setCurrentQuestion(0)
      setIsCompleted(false)

      // Set timer for first question
      if (data.questions[0]) {
        const minutes = Number.parseInt(data.questions[0].timeLimit.split(" ")[0])
        setTimeRemaining(minutes * 60)
      }
    } catch (error) {
      console.error("Error generating practice test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = value
    setResponses(newResponses)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      // Set timer for next question
      const minutes = Number.parseInt(questions[currentQuestion + 1].timeLimit.split(" ")[0])
      setTimeRemaining(minutes * 60)
    } else {
      setIsCompleted(true)
      setTimeRemaining(null)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      const minutes = Number.parseInt(questions[currentQuestion - 1].timeLimit.split(" ")[0])
      setTimeRemaining(minutes * 60)
    }
  }

  const resetTest = () => {
    setQuestions([])
    setResponses([])
    setCurrentQuestion(0)
    setIsCompleted(false)
    setTimeRemaining(null)
  }

  // Timer effect
  React.useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Practice Test</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Generating your personalized practice test...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Practice Test</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              AP Free Response Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Practice with authentic AP-style free response questions. Get personalized questions based on the official
              course curriculum and exam format.
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">What you'll get:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• 3 comprehensive free response questions</li>
                  <li>• Authentic AP exam format</li>
                  <li>• Detailed scoring rubrics</li>
                  <li>• Timed practice sessions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Question types:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Long essay questions</li>
                  <li>• Data analysis tasks</li>
                  <li>• Short answer responses</li>
                  <li>• Synthesis questions</li>
                </ul>
              </div>
            </div>

            <Button onClick={generatePracticeTest} className="w-full" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Generate Practice Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Practice Test Complete!</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg">You've completed all {questions.length} questions!</p>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{question.type}</Badge>
                    <span className="text-sm text-gray-500">{question.points} points</span>
                  </div>
                  <h4 className="font-medium mb-2">Question {index + 1}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {question.question.substring(0, 100)}...
                  </p>
                  <div className="text-sm">
                    <strong>Your response length:</strong> {responses[index]?.length || 0} characters
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={resetTest}>Take Another Test</Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print Responses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Practice Test</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeRemaining < 300 ? "text-red-500" : ""}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          <Button variant="outline" onClick={resetTest}>
            Exit Test
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentQ.type}</Badge>
              <Badge variant="secondary">{currentQ.unit}</Badge>
            </div>
            <div className="text-sm text-gray-500">
              {currentQ.points} points • {currentQ.timeLimit}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Question {currentQuestion + 1}</h3>
            <div className="prose prose-sm max-w-none">
              <p>{currentQ.question}</p>
            </div>
          </div>

          <div>
            <label htmlFor="response" className="block text-sm font-medium mb-2">
              Your Response:
            </label>
            <Textarea
              id="response"
              value={responses[currentQuestion] || ""}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[200px]"
            />
            <div className="text-xs text-gray-500 mt-1">{responses[currentQuestion]?.length || 0} characters</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Scoring Rubric:</h4>
            <p className="text-sm">{currentQ.rubric}</p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button onClick={nextQuestion}>
              {currentQuestion === questions.length - 1 ? "Finish Test" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
