"use client"

import type React from "react"
import { Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "react-query"

interface Recommendation {
  title: string
  description: string
  difficulty: string
  duration: string
}

interface AIRecommendationsProps {
  recommendations: Recommendation[]
  onUpdateRecommendations?: (newRecommendations: Recommendation[]) => void
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations, onUpdateRecommendations }) => {
  const router = useRouter()
  const [generatingPath, setGeneratingPath] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const [expandedCards, setExpandedCards] = useState<number[]>([])

  const toggleCardExpansion = (index: number) => {
    setExpandedCards((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const getNewRecommendation = async (existingRecommendations: Recommendation[]) => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    const response = await fetch("/api/ai/generate-recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 3,
        excludeTitles: existingRecommendations.map((rec) => rec.title),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get new recommendation")
    }

    const data = await response.json()
    const content = JSON.parse(data.content)
    return content[0] // Return just the first recommendation
  }

  const handleGeneratePath = async (topic: string, index: number) => {
    try {
      setGeneratingPath(topic)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      // First generate the learning path
      const response = await fetch("/api/ai/generate-learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate learning path")
      }

      // Get the existing recommendations except the one being replaced
      const remainingRecommendations = recommendations.filter((_, i) => i !== index)

      // Get a new recommendation
      const newRecommendation = await getNewRecommendation(remainingRecommendations)

      // Create updated recommendations array with the new recommendation at the same index
      const updatedRecommendations = [
        ...recommendations.slice(0, index),
        newRecommendation,
        ...recommendations.slice(index + 1),
      ]

      // Update the parent component
      onUpdateRecommendations?.(updatedRecommendations)

      // Navigate to the new learning path
      const data = await response.json()
      router.push(`/learning-paths/${data.id}`)
      toast.success("Learning path generated successfully!")
    } catch (error) {
      toast.error("Failed to generate learning path. Please try again.")
      console.error("Error generating path:", error)
    } finally {
      setGeneratingPath(null)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">AI Recommended Courses</h2>
      {recommendations.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-zinc-900 rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-zinc-200 dark:border-zinc-800 flex flex-col relative hover:z-10"
            >
              <h3 className="font-semibold text-lg mb-3 line-clamp-2">{rec.title}</h3>
              <div className="text-sm text-muted-foreground mb-4 flex-grow">
                <p className={expandedCards.includes(index) ? "" : "line-clamp-4"}>{rec.description}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleCardExpansion(index)
                  }}
                  className="text-primary hover:text-primary/90 text-sm mt-1 font-medium"
                >
                  {expandedCards.includes(index) ? "View less" : "View more"}
                </button>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <span className="bg-secondary/50 px-3 py-1 rounded-full text-xs">{rec.difficulty}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {rec.duration}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleGeneratePath(rec.title, index)}
                  disabled={generatingPath !== null}
                >
                  {generatingPath === rec.title ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Start Learning"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No recommendations available at the moment.</p>
      )}
    </div>
  )
}

export default AIRecommendations

