"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useQuery, useMutation, useQueryClient } from "react-query"
import type { GetStaticPaths, GetStaticProps } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ModuleContent from "@/components/ModuleContent"
import QuickAccessToolbar from "@/components/QuickAccessToolbar"

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
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  }
}

const ModulePage: React.FC = () => {
  const router = useRouter()
  const [pathId, setResolvedPathId] = useState<string | null>(null)
  const [moduleId, setResolvedModuleId] = useState<string | null>(null)

  useEffect(() => {
    if (router.isReady && router.query.id && router.query.moduleId) {
      setResolvedPathId(router.query.id as string)
      setResolvedModuleId(router.query.moduleId as string)
    }
  }, [router.isReady, router.query])

  const queryClient = useQueryClient()

  const {
    data: module,
    isLoading,
    error,
  } = useQuery<Module, Error>(
    ["module", pathId, moduleId],
    async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const res = await fetch(`/api/learning-paths/${pathId}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to fetch module")
      }

      return res.json()
    },
    { enabled: !!pathId && !!moduleId, retry: false },
  )

  const updateModuleStatus = useMutation(
    async (status: "IN_PROGRESS" | "COMPLETED") => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const res = await fetch(`/api/learning-paths/${pathId}/modules/${moduleId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update module status")
      }

      return res.json()
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["module", pathId, moduleId]),
    },
  )

  useEffect(() => {
    if (module && module.status === "NOT_STARTED") {
      updateModuleStatus.mutate("IN_PROGRESS")
    }
  }, [module, updateModuleStatus])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-4">Error: {error.message}</div>
        <Button onClick={() => router.push(`/learning-paths/${pathId}`)} variant="default">
          Back to Learning Path
        </Button>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-gray-600 text-xl mb-4">Module not found</div>
        <Button onClick={() => router.push(`/learning-paths/${pathId}`)} variant="default">
          Back to Learning Path
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
            <p className="text-gray-600 mb-8">{module.description}</p>
            <ModuleContent content={module.content} pathId={pathId} moduleId={moduleId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ModulePage

