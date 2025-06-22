import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Brain, Target } from "lucide-react"

interface QuizLoadingProps {
  quizType: "unit" | "review" | "exam"
  unit?: string
}

export function QuizLoading({ quizType, unit }: QuizLoadingProps) {
  const getLoadingMessage = () => {
    switch (quizType) {
      case "unit":
        return `Creating personalized questions for ${unit}...`
      case "review":
        return "Analyzing your weak areas and generating targeted questions..."
      case "exam":
        return "Preparing a comprehensive practice exam..."
      default:
        return "Generating your quiz..."
    }
  }

  const getIcon = () => {
    switch (quizType) {
      case "unit":
        return <Target className="h-8 w-8 text-blue-500" />
      case "review":
        return <Brain className="h-8 w-8 text-orange-500" />
      case "exam":
        return <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
      default:
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">{getIcon()}</div>
        <CardTitle>Generating Your Quiz</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-300">{getLoadingMessage()}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI tutor is creating questions...</span>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">This may take 10-30 seconds</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Your AI tutor is using the official AP Course and Exam Description to create authentic, exam-style
            questions tailored to your learning needs.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
