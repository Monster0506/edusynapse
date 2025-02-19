"use client"

import { useQuery } from "react-query"
import KnowledgeGraph from "@/components/KnowledgeGraph"
import QuickAccessToolbar from "@/components/QuickAccessToolbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Module {
  id: string
  title: string
  description?: string
  tags: string[]
}

export default function KnowledgeGraphPage() {
  const {
    data: modules,
    isLoading,
    error,
  } = useQuery<Module[]>("knowledgeGraph", async () => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const res = await fetch("/api/knowledge-graph", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to fetch knowledge graph data")

    const data = await res.json()
    console.log("Fetched modules:", data)
    return data
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-[300px] h-[20px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen">
        <QuickAccessToolbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">Knowledge Graph</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100vh-200px)] flex items-center justify-center">
              <p className="text-muted-foreground">No modules found. Complete some modules to see their connections!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-120px)]">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-primary">Knowledge Graph</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] bg-background">
            <KnowledgeGraph modules={modules} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

