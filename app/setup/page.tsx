import { AgentConfigurator } from "@/components/agent-configurator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Agent Setup</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to AP Tutor Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Since you've already created your Letta AI agents and added the AP course data sources, let's configure
                the platform to use your existing agents.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Setup Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click "Load My Agents" to fetch your existing Letta agents</li>
                  <li>Use "Auto-Configure" to automatically match agents to courses, or manually assign them</li>
                  <li>Copy the generated environment variables to your .env.local file</li>
                  <li>Restart your development server</li>
                  <li>Start using your personalized AP tutors!</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <AgentConfigurator />
        </div>
      </div>
    </div>
  )
}
