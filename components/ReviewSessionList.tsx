"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, Zap } from "lucide-react"
import type { ReviewSession } from "../types"

interface ReviewSessionListProps {
  reviewSessions: ReviewSession[]
  onSelectSession: (id: string) => void
}

const ReviewSessionList: React.FC<ReviewSessionListProps> = ({ reviewSessions, onSelectSession }) => {
  const [cramMode, setCramMode] = useState(false)
  const queryClient = useQueryClient()

  const toggleUrgentMutation = useMutation(
    async ({ id, isUrgent }: { id: string; isUrgent: boolean }) => {
      const res = await fetch(`/api/review-sessions/${id}/toggle-urgent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUrgent }),
      })
      if (!res.ok) throw new Error("Failed to update urgent status")
      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reviewSessions")
      },
    },
  )

  const toggleCramModeMutation = useMutation(
    async (isCramMode: boolean) => {
      const res = await fetch("/api/user/cram-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCramMode }),
      })
      if (!res.ok) throw new Error("Failed to toggle cram mode")
      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reviewSessions")
      },
    },
  )

  const handleToggleUrgent = (id: string, isUrgent: boolean) => {
    toggleUrgentMutation.mutate({ id, isUrgent })
  }

  const handleToggleCramMode = () => {
    const newCramMode = !cramMode
    setCramMode(newCramMode)
    toggleCramModeMutation.mutate(newCramMode)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Review Sessions</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Cram Mode</span>
          <Switch checked={cramMode} onCheckedChange={handleToggleCramMode} />
        </div>
      </div>
      {reviewSessions.length === 0 ? (
        <p>No review sessions due at the moment. Great job staying on top of your studies!</p>
      ) : (
        reviewSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Review Session</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={session.isUrgent ? "destructive" : "secondary"}>
                    {session.isUrgent ? "Urgent" : "Normal"}
                  </Badge>
                  <Switch
                    checked={session.isUrgent}
                    onCheckedChange={(checked) => handleToggleUrgent(session.id, checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <Clock className="inline-block mr-2" />
                Due: {new Date(session.dueDate).toLocaleString()}
              </p>
              <p className="mb-2">Items to review: {session.items ? session.items.length : 0}</p>
              <ul className="list-disc list-inside mb-4">
                {session.items &&
                  session.items.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-muted-foreground">
                      {item.type}: {item.question.substring(0, 50)}...
                    </li>
                  ))}
                {session.items && session.items.length > 3 && (
                  <li className="text-muted-foreground">And {session.items.length - 3} more...</li>
                )}
              </ul>
              <div className="flex space-x-2">
                <Button onClick={() => onSelectSession(session.id)} className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Review
                </Button>
                {cramMode && (
                  <Button variant="outline" className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cram Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default ReviewSessionList

