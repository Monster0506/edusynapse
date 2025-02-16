"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/router"
import { useQuery, useMutation, useQueryClient } from "react-query"
import QuickAccessToolbar from "../../components/QuickAccessToolbar"
import ReviewItem from "../../components/ReviewItem"
import { Card, CardContent } from "@/components/ui/card"

interface ReviewSession {
  id: string
  items: Array<{
    id: string
    type: string
    question: string
    answer: string
    userAnswer?: string
    correct?: boolean
  }>
}

const ReviewSessionPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()

  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  const {
    data: session,
    isLoading,
    error,
  } = useQuery<ReviewSession>(
    ["reviewSession", id],
    async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`/api/review-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch review session")

      return res.json()
    },
    {
      enabled: !!id,
    },
  )

  const updateSessionMutation = useMutation(
    async (updatedSession: Partial<ReviewSession>) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`/api/review-sessions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSession),
      })

      if (!res.ok) throw new Error("Failed to update review session")

      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["reviewSession", id])
      },
    },
  )

  const handleAnswer = (isCorrect: boolean) => {
    if (!session) return

    const updatedItems = [...session.items]
    updatedItems[currentItemIndex] = {
      ...updatedItems[currentItemIndex],
      correct: isCorrect,
    }

    updateSessionMutation.mutate({
      completed: currentItemIndex === session.items.length - 1,
      items: updatedItems,
    })

    if (currentItemIndex < session.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      router.push("/review-sessions")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <QuickAccessToolbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Review Session</h1>
          <Card>
            <CardContent className="p-6">
              <p>Loading review session...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background">
        <QuickAccessToolbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Review Session</h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Error: {error ? (error as Error).message : "Session not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentItem = session.items[currentItemIndex]

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Review Session</h1>
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">
              Item {currentItemIndex + 1} of {session.items.length}
            </p>
            {currentItem && <ReviewItem item={currentItem} onAnswer={handleAnswer} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReviewSessionPage

