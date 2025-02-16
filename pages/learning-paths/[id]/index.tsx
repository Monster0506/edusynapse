"use client"

import type React from "react"
import { useRouter } from "next/router"
import { useQuery } from "react-query"
import ModuleNavigationHeader from "@/components/ModuleNavigationHeader"
import QuickAccessToolbar from "@/components/QuickAccessToolbar"
import LearningPathContent from "@/components/LearningPathContent"
import { useEffect, useMemo } from "react"

interface LearningPath {
  id: string
  title: string
  description: string
  content: {
    modules: Array<{
      id: string
      title: string
      description: string
      objectives: string[]
      content: string
      status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
    }>
  }
}

const ModulePage: React.FC = () => {
  const router = useRouter()
  const id = router.query.id as string | undefined

  const {
    data: learningPath,
    isLoading,
    error,
    refetch,
  } = useQuery<LearningPath, Error>(
    ["learningPath", id],
    async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const res = await fetch(`/api/learning-paths/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to fetch learning path")
      }

      const data = await res.json()
      return data
    },
    { enabled: !!id, retry: false },
  )

  // Calculate progress directly from learning path data
  const progress = useMemo(() => {
    if (!learningPath?.content?.modules) {
      console.log("No modules found in learning path")
      return { completed: 0, total: 0 }
    }

    const total = learningPath.content.modules.length
    const completed = learningPath.content.modules.filter((module) => module.status === "COMPLETED").length

    return { completed, total }
  }, [learningPath])

  const isPreviousModuleCompleted = (index: number) => {
    if (index === 0) return true // First module is always allowed
    const previousModule = learningPath?.content.modules[index - 1]
    return previousModule?.status === "COMPLETED"
  }

  useEffect(() => {
    if (router.query.completed) {
      refetch() // Refresh learning path modules
      router.replace(`/learning-paths/${id}`, undefined, { shallow: true })
    }
  }, [router.query.completed, refetch, router, id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-red-500 text-xl mb-4">Error: {error.message}</div>
        <button
          onClick={() => router.push("/learning-paths")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Learning Paths
        </button>
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">No learning path found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <ModuleNavigationHeader
        pathName={learningPath.title}
        moduleName={learningPath.title}
        moduleNumber={1}
        completedModules={progress.completed}
        totalModules={progress.total}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{learningPath.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{learningPath.description}</p>
          <div className="text-sm text-muted-foreground">
            {`Progress: ${progress.completed}/${progress.total} Modules Completed`}
          </div>
        </div>

        <div className="grid gap-6">
          {learningPath.content.modules.map((module, index) => (
            <LearningPathContent
              key={module.id}
              module={module}
              moduleNumber={index + 1}
              pathId={learningPath.id}
              title={learningPath.title}
              refetch={refetch}
              isPreviousModuleCompleted={isPreviousModuleCompleted(index)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

export default ModulePage

