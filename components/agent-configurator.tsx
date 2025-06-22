"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
}

const COURSES = [
  { id: "ap-biology", name: "AP Biology", envVar: "LETTA_AGENT_AP_BIOLOGY" },
  { id: "ap-us-history", name: "AP US History", envVar: "LETTA_AGENT_AP_US_HISTORY" },
  { id: "ap-spanish", name: "AP Spanish", envVar: "LETTA_AGENT_AP_SPANISH" },
  { id: "ap-french", name: "AP French", envVar: "LETTA_AGENT_AP_FRENCH" },
  { id: "ap-chemistry", name: "AP Chemistry", envVar: "LETTA_AGENT_AP_CHEMISTRY" },
  { id: "ap-csa", name: "AP Computer Science A", envVar: "LETTA_AGENT_AP_CSA" },
]

export function AgentConfigurator() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [courseAgents, setCourseAgents] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [envVars, setEnvVars] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadAgents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/agents/list")
      if (!response.ok) throw new Error("Failed to load agents")

      const data = await response.json()
      setAgents(data.agents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents")
    } finally {
      setIsLoading(false)
    }
  }

  const autoConfigureAgents = async () => {
    setIsConfiguring(true)
    setError(null)
    try {
      const response = await fetch("/api/agents/configure", { method: "POST" })
      if (!response.ok) throw new Error("Failed to configure agents")

      const data = await response.json()
      setCourseAgents(data.courseAgents)
      setEnvVars(data.envVars)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to configure agents")
    } finally {
      setIsConfiguring(false)
    }
  }

  const handleAgentChange = (courseId: string, agentId: string) => {
    setCourseAgents((prev) => ({ ...prev, [courseId]: agentId }))

    // Update env vars
    const newEnvVars = COURSES.filter((course) => courseAgents[course.id] || course.id === courseId).map((course) => {
      const selectedAgentId = course.id === courseId ? agentId : courseAgents[course.id]
      return `${course.envVar}=${selectedAgentId}`
    })
    setEnvVars(newEnvVars)
  }

  const copyEnvVars = () => {
    navigator.clipboard.writeText(envVars.join("\n"))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Letta AI Agents</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Map your existing Letta agents to AP courses. First, load your agents, then assign them to courses.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadAgents} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Agents...
                </>
              ) : (
                "Load My Agents"
              )}
            </Button>
            <Button onClick={autoConfigureAgents} disabled={isConfiguring || agents.length === 0} variant="outline">
              {isConfiguring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Auto-Configuring...
                </>
              ) : (
                "Auto-Configure"
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Agents ({agents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.description}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {agent.id.slice(0, 8)}...
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Assignment</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">Assign your Letta agents to specific AP courses.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {COURSES.map((course) => (
              <div key={course.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{course.name}</div>
                  <div className="text-sm text-gray-500">{course.envVar}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={courseAgents[course.id] || ""}
                    onValueChange={(value) => handleAgentChange(course.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {courseAgents[course.id] && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {envVars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Environment Variables
              <Button variant="outline" size="sm" onClick={copyEnvVars}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Add these to your .env.local file to complete the setup.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm font-mono whitespace-pre-wrap">{envVars.join("\n")}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
