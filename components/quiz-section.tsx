"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RotateCcw, Target, Clock, Loader2, Award } from "lucide-react"
import { QuizLoading } from "@/components/quiz-loading"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  unit: string
}

interface QuizSectionProps {
  courseId: string
  units: string[]
  setActiveTab?: (tab: string) => void
}

export function QuizSection({ courseId, units, setActiveTab }: QuizSectionProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizType, setQuizType] = useState<"unit" | "review" | "exam">("unit")
  const [isLoading, setIsLoading] = useState(false)

  // Sample questions - in real app, these would come from the API
  const sampleQuestions: Question[] = [
    {
      id: "1",
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
      unit: "Cellular Energetics",
    },
    {
      id: "2",
      question: "What is the primary function of the mitochondria?",
      options: ["Protein synthesis", "DNA storage", "ATP production", "Waste removal"],
      correctAnswer: 2,
      explanation:
        "Mitochondria are known as the powerhouses of the cell because they produce most of the ATP through cellular respiration.",
      unit: "Cell Structure and Function",
    },
  ]

  const generateQuiz = async (type: "unit" | "review" | "exam", unit?: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          quizType: type,
          unit: unit,
          questionCount: type === "exam" ? 20 : type === "review" ? 15 : 10,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate quiz")
      }

      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestion(0)
      setScore(0)
      setShowResult(false)
      setSelectedAnswer("")
      setQuizType(type)
    } catch (error) {
      console.error("Error generating quiz:", error)
      // Fallback to sample questions if API fails
      setQuestions(sampleQuestions)
      setCurrentQuestion(0)
      setScore(0)
      setShowResult(false)
      setSelectedAnswer("")
      setQuizType(type)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return

    const isCorrect = Number.parseInt(selectedAnswer) === questions[currentQuestion].correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const submitQuizResults = async () => {
    try {
      const quizResults = questions.map((question, index) => ({
        questionId: question.id,
        question: question.question,
        unit: question.unit,
        selectedAnswer: index === currentQuestion ? Number.parseInt(selectedAnswer) : null,
        correctAnswer: question.correctAnswer,
        correct: index === currentQuestion ? Number.parseInt(selectedAnswer) === question.correctAnswer : false,
      }))

      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          quizResults,
          quizType,
          unit: selectedUnit,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Quiz results submitted:", data)
      }
    } catch (error) {
      console.error("Error submitting quiz results:", error)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer("")
      setShowResult(false)
    } else {
      // Quiz completed, submit results
      submitQuizResults()
    }
  }

  const resetQuiz = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer("")
    setSelectedUnit(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Practice & Assessment</h2>
          <Button variant="outline" onClick={() => setIsLoading(false)}>
            Cancel
          </Button>
        </div>
        <QuizLoading quizType={quizType} unit={selectedUnit || undefined} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Practice & Assessment</h2>

          {/* Quiz Type Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Unit Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Practice questions from a specific unit</p>
                <div className="space-y-2">
                  {units.slice(0, 3).map((unit, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => generateQuiz("unit", unit)}
                      disabled={isLoading}
                    >
                      {unit}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-orange-600" />
                  Review Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Focus on topics you've struggled with</p>
                <Button className="w-full" onClick={() => generateQuiz("review")} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    "Start Review Quiz"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  Practice Exam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Full-length AP practice exam</p>
                <Button className="w-full" onClick={() => generateQuiz("exam")} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Exam...
                    </>
                  ) : (
                    "Start Practice Exam"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {quizType === "unit" ? "Unit Quiz" : quizType === "review" ? "Review Quiz" : "Practice Exam"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <Button variant="outline" onClick={resetQuiz}>
          Exit Quiz
        </Button>
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
            <Badge variant="outline">{currentQ.unit}</Badge>
            <span className="text-sm text-gray-500">
              Score: {score}/{questions.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium">{currentQ.question}</h3>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showResult} />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-1 cursor-pointer p-2 rounded ${
                    showResult && index === currentQ.correctAnswer
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      : showResult && selectedAnswer === index.toString() && index !== currentQ.correctAnswer
                        ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                        : ""
                  }`}
                >
                  {option}
                  {showResult && index === currentQ.correctAnswer && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-2 inline" />
                  )}
                  {showResult && selectedAnswer === index.toString() && index !== currentQ.correctAnswer && (
                    <XCircle className="h-4 w-4 text-red-600 ml-2 inline" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showResult && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Explanation:</h4>
              <p className="text-sm">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex justify-between">
            {!showResult ? (
              <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer} className="ml-auto">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={isLastQuestion ? resetQuiz : nextQuestion} className="ml-auto">
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {currentQuestion === questions.length - 1 && showResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round((score / questions.length) * 100)}%</div>
                <p className="text-gray-600 dark:text-gray-300">
                  {score} out of {questions.length} correct
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Incorrect</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={resetQuiz}>Take Another Quiz</Button>
                <Button variant="outline" onClick={() => setActiveTab && setActiveTab("tutor")}>
                  Ask Tutor for Help
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
