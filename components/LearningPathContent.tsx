"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface Module {
  id: string
  title: string
  description: string
  objectives: string[]
  content: string
  status: string
  detailedContent?: any
}

interface LearningPathContentProps {
  module: Module
  moduleNumber: number
  pathId: string
  title: string
  refetch: () => void
  isPreviousModuleCompleted: boolean
}

export default function LearningPathContent({
  module,
  moduleNumber,
  pathId,
  title,
  refetch,
  isPreviousModuleCompleted,
}: LearningPathContentProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [moduleContent, setModuleContent] = React.useState<any>(module.detailedContent)
  const [currentStatus, setCurrentStatus] = React.useState(module.status)

  const updateModuleStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/learning-paths/${pathId}/modules/${module.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update module status")
      }

      setCurrentStatus(newStatus)
      refetch() // Refresh the learning path data
      toast({
        title: "Status Updated",
        description: `Module status updated to ${newStatus.toLowerCase().replace("_", " ")}`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update module status",
        variant: "destructive",
      })
    }
  }

  const handleStartLearning = async () => {
    if (!isPreviousModuleCompleted && moduleNumber !== 1) {
      toast({
        title: "Cannot Start Module",
        description: "You must complete the previous module before starting this one.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Update status to IN_PROGRESS when starting
      if (currentStatus === "NOT_STARTED") {
        await updateModuleStatus("IN_PROGRESS")
      }

      const response = await fetch(`/api/learning-paths/${pathId}/modules/${module.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate module content")
      }

      const data = await response.json()
      setModuleContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate module content")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteModule = async () => {
    await updateModuleStatus("COMPLETED")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {moduleNumber}. {module.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">{module.description}</p>
        {module.objectives && module.objectives.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 font-medium">Learning Objectives</h4>
            <ul className="list-inside list-disc space-y-1">
              {module.objectives.map((objective, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="mb-4 rounded bg-destructive/10 p-3 text-sm text-destructive">Error: {error}</p>}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Badge
          variant={
            currentStatus === "COMPLETED" ? "success" : currentStatus === "IN_PROGRESS" ? "default" : "secondary"
          }
        >
          {currentStatus.replace("_", " ")}
        </Badge>
        <div className="flex gap-2">
          {!moduleContent ? (
            <Button
              onClick={handleStartLearning}
              disabled={isLoading || (!isPreviousModuleCompleted && moduleNumber !== 1)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Learning
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href={`/learning-paths/${pathId}/modules/${module.id}`}>Continue Learning</Link>
              </Button>
              {currentStatus !== "COMPLETED" && <Button onClick={handleCompleteModule}>Mark as Complete</Button>}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

