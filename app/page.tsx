import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Brain, Target, TrendingUp, Settings } from "lucide-react"

const courses = [
  {
    id: "ap-biology",
    name: "AP Biology",
    description: "Master cellular processes, genetics, evolution, and ecology",
    color: "bg-green-500",
    units: 8,
    difficulty: "Advanced",
  },
  {
    id: "ap-us-history",
    name: "AP US History",
    description: "Explore American history from pre-Columbian to modern era",
    color: "bg-blue-500",
    units: 9,
    difficulty: "Advanced",
  },
  {
    id: "ap-spanish",
    name: "AP Spanish",
    description: "Develop fluency in Spanish language and culture",
    color: "bg-red-500",
    units: 6,
    difficulty: "Advanced",
  },
  {
    id: "ap-french",
    name: "AP French",
    description: "Master French language and francophone cultures",
    color: "bg-purple-500",
    units: 6,
    difficulty: "Advanced",
  },
  {
    id: "ap-chemistry",
    name: "AP Chemistry",
    description: "Understand chemical reactions, bonding, and thermodynamics",
    color: "bg-orange-500",
    units: 9,
    difficulty: "Advanced",
  },
  {
    id: "ap-csa",
    name: "AP Computer Science A",
    description: "Learn Java programming and computer science fundamentals",
    color: "bg-cyan-500",
    units: 10,
    difficulty: "Advanced",
  },
]

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutors",
    description: "Personalized learning with dedicated AI tutors for each subject",
  },
  {
    icon: Target,
    title: "Adaptive Learning",
    description: "Focus on your weak areas with targeted practice and review",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Content",
    description: "Complete AP curriculum coverage with practice exams",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IntelliAgent</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/setup">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Agents
                </Button>
              </Link>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Master AP Courses with IntelliAgent</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get personalized tutoring from AI agents specialized in each AP subject. Track your progress, identify weak
            areas, and ace your exams.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Learning Today
            </Button>
            <Link href="/setup">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Settings className="h-5 w-5 mr-2" />
                Configure Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose IntelliAgent?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Available AP Courses</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-4 h-4 rounded-full ${course.color}`} />
                    <Badge variant="secondary">{course.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{course.units} Units</span>
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">Start Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
