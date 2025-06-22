"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInterface } from "@/components/chat-interface"
import { QuizSection } from "@/components/quiz-section"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { LanguageSection } from "@/components/language-section"
import { Brain, BookOpen, Target, Headphones, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Course {
  name: string
  description: string
  color: string
  units: string[]
}

interface CourseLayoutProps {
  courseId: string
  course: Course
}

export function CourseLayout({ courseId, course }: CourseLayoutProps) {
  const [activeTab, setActiveTab] = useState("tutor")
  const isLanguageCourse = courseId === "ap-spanish" || courseId === "ap-french"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${course.color}`} />
                <h1 className="text-2xl font-bold">{course.name}</h1>
              </div>
            </div>
            <Badge variant="outline">{course.units.length} Units</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Practice
            </TabsTrigger>
            {isLanguageCourse && (
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Speaking
              </TabsTrigger>
            )}
            <TabsTrigger value="units" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Units
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="space-y-6">
            <ChatInterface courseId={courseId} courseName={course.name} />
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <QuizSection courseId={courseId} units={course.units} setActiveTab={setActiveTab} />
          </TabsContent>

          {isLanguageCourse && (
            <TabsContent value="language" className="space-y-6">
              <LanguageSection courseId={courseId} />
            </TabsContent>
          )}

          <TabsContent value="units" className="space-y-6">
            <div className="grid gap-4">
              <h2 className="text-2xl font-bold">Course Units</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.units.map((unit, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Unit {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{unit}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Study
                        </Button>
                        <Button size="sm" variant="outline">
                          Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressDashboard courseId={courseId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
