"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BookOpen } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface GenerateLearningPathModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModuleItem {
  id: string
  title: string
  description: string
  objectives: string[]
  status: string
}

const GenerateLearningPathModal: React.FC<GenerateLearningPathModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()

  const generateLearningPathMutation = useMutation(
    async (topic: string) => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found")
      }

      const generateResponse = await fetch("/api/ai/generate-learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic }),
      })

      if (!generateResponse.ok) {
        const error = await generateResponse.json()
        throw new Error(error.message || "Failed to generate learning path")
      }

      const result = await generateResponse.json()
      return result
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("learningPaths")
        setTopic("")
        toast({
          title: "Success!",
          description: "Learning path generated successfully.",
        })
        onClose()
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while generating the learning path",
          variant: "destructive",
        })
      },
      onSettled: () => {
        setIsGenerating(false)
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)
    generateLearningPathMutation.mutate(topic)
  }

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              Generate Learning Path
            </ModalTitle>
            <ModalDescription className="text-muted-foreground">
              Enter a topic to generate a new learning path. Our AI will create a customized path for you.
            </ModalDescription>
          </ModalHeader>

          <div className="p-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., JavaScript Fundamentals"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default GenerateLearningPathModal

