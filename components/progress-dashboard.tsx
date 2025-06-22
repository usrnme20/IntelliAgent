"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Clock, Award, AlertTriangle } from "lucide-react"

interface ProgressDashboardProps {
  courseId: string
}

export function ProgressDashboard({ courseId }: ProgressDashboardProps) {
  // Mock data - in real app, this would come from the API based on user's interaction with Letta agents
  const progressData = {
    overallProgress: 65,
    studyStreak: 7,
    totalStudyTime: 24,
    recentActivity: [
      { date: "2024-01-15", activity: "Completed Unit 3 Quiz", score: 85 },
      { date: "2024-01-14", activity: "Studied Cellular Respiration", duration: 45 },
      { date: "2024-01-13", activity: "Practice Exam Section A", score: 78 },
    ],
    weakAreas: [
      { topic: "Photosynthesis", confidence: 45, needsReview: true },
      { topic: "Cell Division", confidence: 60, needsReview: true },
      { topic: "Genetics", confidence: 75, needsReview: false },
    ],
    unitProgress: [
      { unit: "Chemistry of Life", progress: 90, mastery: "High" },
      { unit: "Cell Structure", progress: 75, mastery: "Medium" },
      { unit: "Cellular Energetics", progress: 45, mastery: "Low" },
      { unit: "Cell Communication", progress: 20, mastery: "Low" },
    ],
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Dashboard</h2>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overallProgress}%</div>
            <Progress value={progressData.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.studyStreak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas to Review</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.weakAreas.filter((area) => area.needsReview).length}</div>
            <p className="text-xs text-muted-foreground">topics need focus</p>
          </CardContent>
        </Card>
      </div>

      {/* Unit Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.unitProgress.map((unit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{unit.unit}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        unit.mastery === "High" ? "default" : unit.mastery === "Medium" ? "secondary" : "destructive"
                      }
                    >
                      {unit.mastery}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{unit.progress}%</span>
                  </div>
                </div>
                <Progress value={unit.progress} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Areas Needing Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.weakAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{area.topic}</h4>
                  <p className="text-sm text-muted-foreground">Confidence: {area.confidence}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {area.needsReview && <Badge variant="destructive">Needs Review</Badge>}
                  <Progress value={area.confidence} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                {"score" in activity && (
                  <Badge variant={activity.score >= 80 ? "default" : "secondary"}>{activity.score}%</Badge>
                )}
                {"duration" in activity && (
                  <span className="text-sm text-muted-foreground">{activity.duration} min</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
