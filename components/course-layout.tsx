"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MessageSquare, BarChart3, FileText, Mic } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { QuizSection } from "@/components/quiz-section"
import { PracticeTestSection } from "@/components/practice-test-section"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { LanguageSection } from "@/components/language-section"

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

interface CourseInfo {
  units: string[]
  progressAreas: Array<{
    name: string
    description: string
    skills: string[]
  }>
}

export function CourseLayout({ courseId, course }: CourseLayoutProps) {
  const [activeTab, setActiveTab] = useState("tutor")
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [isLoadingCourseInfo, setIsLoadingCourseInfo] = useState(true)

  // Load dynamic course information
  useEffect(() => {
    const loadCourseInfo = async () => {
      try {
        const response = await fetch("/api/get-course-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        })

        if (response.ok) {
          const data = await response.json()
          setCourseInfo({
            units: data.units,
            progressAreas: data.progressAreas,
          })
        }
      } catch (error) {
        console.error("Error loading course info:", error)
        // Use fallback course info
        setCourseInfo({
          units: course.units,
          progressAreas: [],
        })
      } finally {
        setIsLoadingCourseInfo(false)
      }
    }

    loadCourseInfo()
  }, [courseId, course.units])

  const isLanguageCourse = courseId === "ap-spanish" || courseId === "ap-french"
  const units = courseInfo?.units || course.units
  const progressAreas = courseInfo?.progressAreas || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`${course.color} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{course.name}</h1>
              <p className="text-white/80">{course.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {units.slice(0, 4).map((unit, index) => (
              <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                {unit}
              </Badge>
            ))}
            {units.length > 4 && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                +{units.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Practice Test
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            {isLanguageCourse && (
              <TabsTrigger value="speaking" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Speaking
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tutor">
            <ChatInterface courseId={courseId} />
          </TabsContent>

          <TabsContent value="practice">
            <QuizSection courseId={courseId} units={units} setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="test">
            <PracticeTestSection courseId={courseId} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressDashboard
              courseId={courseId}
              units={units}
              progressAreas={progressAreas}
              isLoading={isLoadingCourseInfo}
            />
          </TabsContent>

          {isLanguageCourse && (
            <TabsContent value="speaking">
              <LanguageSection courseId={courseId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
