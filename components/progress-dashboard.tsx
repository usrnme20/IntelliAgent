"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, Award, BookOpen, CheckCircle } from "lucide-react"

interface ProgressArea {
  name: string
  description: string
  skills: string[]
}

interface ProgressDashboardProps {
  courseId: string
  units: string[]
  progressAreas: ProgressArea[]
  isLoading: boolean
}

export function ProgressDashboard({ courseId, units, progressAreas, isLoading }: ProgressDashboardProps) {
  // Mock progress data - in real app, this would come from user's actual performance
  const mockProgress = {
    overallProgress: 68,
    unitsCompleted: Math.floor(units.length * 0.6),
    quizzesTaken: 12,
    averageScore: 78,
    strongAreas: progressAreas.slice(0, 2).map((area) => area.name),
    improvementAreas: progressAreas.slice(-1).map((area) => area.name),
    recentActivity: [
      { type: "quiz", unit: units[0], score: 85, date: "2 days ago" },
      { type: "practice", unit: units[1], score: 72, date: "4 days ago" },
      { type: "chat", unit: units[2], score: null, date: "1 week ago" },
    ],
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Progress Dashboard</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Progress Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Last updated: Today
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.overallProgress}%</div>
            <Progress value={mockProgress.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgress.unitsCompleted}/{units.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockProgress.unitsCompleted / units.length) * 100)}% of course
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.quizzesTaken}</div>
            <p className="text-xs text-muted-foreground">Avg score: {mockProgress.averageScore}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {mockProgress.averageScore >= 80
                ? "Excellent"
                : mockProgress.averageScore >= 70
                  ? "Good"
                  : "Needs improvement"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Units Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Unit Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {units.map((unit, index) => {
            const progress = Math.max(0, Math.min(100, (index + 1) * 15 - Math.random() * 20))
            const isCompleted = progress >= 80

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <span className="text-sm font-medium">{unit}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      {progressAreas.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Strong Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressAreas.slice(0, 2).map((area, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{area.name}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Strong
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {area.skills.slice(0, 3).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressAreas.slice(-2).map((area, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{area.name}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Focus
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {area.skills.slice(0, 3).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProgress.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "quiz"
                        ? "bg-blue-500"
                        : activity.type === "practice"
                          ? "bg-green-500"
                          : "bg-purple-500"
                    }`}
                  />
                  <div>
                    <span className="font-medium capitalize">{activity.type}</span>
                    <span className="text-muted-foreground"> - {activity.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score && <div className="font-medium">{activity.score}%</div>}
                  <div className="text-sm text-muted-foreground">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
