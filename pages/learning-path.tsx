"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useRouter } from "next/router"
import Link from "next/link"
import QuickAccessToolbar from "../components/QuickAccessToolbar"
import AddModule from "../components/AddModule"
import GenerateLearningPathModal from "../components/GenerateLearningPathModal"
import type { LearningPathWithItems } from "../types"
import type { AIModule } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const LearningPathPage: React.FC = () => {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false)
  const [isGenerateLearningPathOpen, setIsGenerateLearningPathOpen] = useState(false)
  const [, setDebugInfo] = useState<string>("")
  const [expandedPaths, setExpandedPaths] = useState<{ [key: string]: boolean }>({})

  const {
    data: learningPaths,
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useQuery<LearningPathWithItems[], Error>("learningPaths", async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    const res = await fetch("/api/learning-paths", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch learning paths")
    }

    return res.json()
  })

  const {
    data: generatedModules,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useQuery<AIModule[], Error>(
    "generatedModules",
    async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found")
      }

      const res = await fetch("/api/modules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to fetch generated modules")
      }

      return res.json()
    },
    {
      retry: false,
      onError: (error) => {
        setDebugInfo(`Error: ${error.message}`)
      },
    },
  )

  const handleAddModule = async (topic: string) => {
    try {
      setIsGenerating(true)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found")
      }

      const requestBody = { topic }
      console.log("Request body:", requestBody)

      const response = await fetch("/api/ai/generate-module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }))
        console.error("API Error response:", errorData)
        throw new Error(errorData.message || "Failed to generate module")
      }

      await response.json()

      queryClient.invalidateQueries("generatedModules")

      setIsAddModuleOpen(false)
    } catch (error) {
      console.error("=== ERROR DETAILS ===")
      const err = error as Error
      console.error("Error type:", err.constructor.name)
      console.error("Error message:", err.message)
      console.error("Error stack:", err.stack)
      setDebugInfo(`Error generating module: ${(error as Error).message}\nStack: ${(error as Error).stack}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteLearningPath = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this learning path?")) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
  
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Extract error details
        console.error("Delete API Error:", errorData);
        throw new Error(errorData.message || "Failed to delete learning path");
      }
  
      queryClient.invalidateQueries("learningPaths"); // Refresh the learning paths list
    } catch (error) {
      console.error("Error deleting learning path:", error);
      alert(error instanceof Error ? error.message : "Failed to delete learning path. Please try again.");
    }
  };
  
  

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  if (isLoadingPaths || isLoadingModules) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin" />
      </div>
    )
  }

  if (pathsError || modulesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{pathsError?.message || modulesError?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Learning Paths</h1>
          <div className="space-x-4">
            <Button onClick={() => setIsGenerateLearningPathOpen(true)}>Generate Learning Path</Button>
            <Button onClick={() => setIsAddModuleOpen(true)}>Add Module</Button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Your Learning Paths</h2>
        {learningPaths && learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <Card key={path.id} className="relative flex flex-col h-full">
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteLearningPath(path.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <CardTitle>{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold">Modules:</h4>
                  <ul className="list-disc list-inside">
                    {path.content?.modules?.slice(0, expandedPaths[path.id] ? undefined : 4).map((mod, index) => (
                      <li key={index}>{mod.title}</li>
                    ))}
                  </ul>
                </div>
                {path.content?.modules && path.content.modules.length > 4 && (
                  <div className="mt-auto"> {/* Ensures consistent placement at the bottom */}
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => {
                        setExpandedPaths((prev) => ({ ...prev, [path.id]: !prev[path.id] }));
                      }}
                    >
                      {expandedPaths[path.id] ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/learning-paths/${path.id}`}>
                  <Button>View Path</Button>
                </Link>
              </CardFooter>
            </Card>
            
            ))}
          </div>
        ) : (
          <p className="text-center">No learning paths available. Start by creating one!</p>
        )}
        <AddModule
          isOpen={isAddModuleOpen}
          onClose={() => setIsAddModuleOpen(false)}
          onAddModule={handleAddModule}
          isGenerating={isGenerating}
        />

        <h2 className="text-2xl font-semibold mb-4 mt-12">Generated Modules</h2>
        {isLoadingModules ? (
          <><div className="text-center">Loading generated modules...</div><div className="text-center text-red-500">Error: {(modulesError as Error).message}</div><div className="text-center text-red-500">Error: {modulesError.message}</div></>
        ) : generatedModules && generatedModules.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedModules.map((module) => (
             <Card key={module.id} className="flex flex-col h-full">
             <CardHeader>
               <CardTitle>{module.title}</CardTitle>
               <CardDescription>{module.description}</CardDescription>
             </CardHeader>
             <CardContent className="flex-grow">
               <div className="flex flex-wrap gap-2 mb-4">
                 {module.tags?.map(
                   (
                     tag:
                       | string
                       | number
                       | bigint
                       | boolean
                       | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                       | Iterable<React.ReactNode>
                       | React.ReactPortal
                       | Promise<React.AwaitedReactNode>
                       | null
                       | undefined,
                     index: React.Key | null | undefined,
                   ) => (
                     <Badge key={index} variant="secondary">
                       {tag}
                     </Badge>
                   ),
                 )}
               </div>
             </CardContent>
             <CardFooter className="mt-auto">
               <Link href={`/modules/${module.id}`}>
                 <Button variant="outline">View Module</Button>
               </Link>
             </CardFooter>
           </Card>
           
            ))}
          </div>
        ) : (
          <p className="text-center">No generated modules available. Start by generating one!</p>
        )}
      </div>
      <GenerateLearningPathModal
        isOpen={isGenerateLearningPathOpen}
        onClose={() => setIsGenerateLearningPathOpen(false)}
      />
    </div>
  )
}

export default LearningPathPage
