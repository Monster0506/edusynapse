"use client"

import type React from "react"
import { useRouter } from "next/router"
import { useQuery } from "react-query"
import QuickAccessToolbar from "@/components/QuickAccessToolbar"
import ModuleContent from "@/components/ModuleContent"

interface Module {
  id: string
  title: string
  description: string
  content: {
    introduction: string
    keyPoints: string[]
    examples: {
      type: "code" | "math" | "text"
      content: string
      explanation: string
    }[]
    quiz: {
      question: string
      options: string[]
      correctAnswer: number
      explanation: string
    }[]
  }
}

const ModulePage: React.FC = () => {
  const router = useRouter()
  
  // Wait for router to be ready
  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const { id } = router.query

  const {
    data: module,
    isLoading,
    error,
  } = useQuery<Module, Error>(
    ["module", id],
    async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found")
      }

      const res = await fetch(`/api/modules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch module")
      return res.json()
    },
    {
      enabled: !!id,
    },
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error?.message || "Failed to load module"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">{module.title}</h1>
        <p className="text-foreground mb-6">{module.description}</p>
        <ModuleContent content={module.content} />
      </div>
    </div>
  )
}

export default ModulePage
