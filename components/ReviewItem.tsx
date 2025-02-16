"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Flame } from "lucide-react"
import type { ReviewItem as ReviewItemType } from "../types"

interface ReviewItemProps {
  item: ReviewItemType
  onAnswer: (isCorrect: boolean) => void
}

const ReviewItem: React.FC<ReviewItemProps> = ({ item, onAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const queryClient = useQueryClient()

  const streakMutation = useMutation(
    async () => {
      const res = await fetch(`/api/users/streak`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to update streak")
      return res.json()
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData("userStreak", data.streak)
      },
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isCorrect = userAnswer.toLowerCase().trim() === item.answer.toLowerCase().trim()
    onAnswer(isCorrect)
    if (isCorrect) {
      streakMutation.mutate()
    }
  }

  const { data: streak } = useQueryClient().getQueryData("userStreak") || {
    streak: 0,
  }

  if (!item) {
    return <p>Error: No item data available</p>
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{item.type === "flashcard" ? "Flashcard" : "Quiz Question"}</CardTitle>
        <CardDescription>Answer the question to improve your retention</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-4">{item.question}</h3>
        {item.type === "flashcard" ? (
          <div>
            {showAnswer ? (
              <div>
                <p className="mb-4">{item.answer}</p>
                <div className="flex space-x-2">
                  <Button onClick={() => onAnswer(true)} variant="default" className="bg-green-500 hover:bg-green-600">
                    Correct
                  </Button>
                  <Button onClick={() => onAnswer(false)} variant="default" className="bg-red-500 hover:bg-red-600">
                    Incorrect
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="mb-4"
              placeholder="Your answer"
            />
            <Button type="submit">Submit Answer</Button>
          </form>
        )}
        {streak > 0 && (
          <div className="mt-4 flex items-center">
            <Flame className="text-orange-500 mr-2" />
            <span className="font-semibold">Streak: {streak}</span>
            <Badge variant="secondary" className="ml-2">
              {streak}x XP Multiplier
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewItem

