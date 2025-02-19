"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import jwt from "jsonwebtoken"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface AIModule {
  id: string
  title: string
}

interface PracticeAttempt {
  id: string
  questions: Array<{
    question: string
    type: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }>
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token")
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  return response.json()
}

export default function PracticeGenerator({
  onGenerate,
}: {
  onGenerate: (practice: PracticeAttempt) => void
}) {
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [open, setOpen] = useState(false)
  const modulesPerPage = 6

  const { data: modules, error: fetchError } = useSWR<AIModule[]>("/api/modules", fetcher)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decodedToken = jwt.decode(token) as { userId: string } | null
      if (decodedToken) {
        setUserId(decodedToken.userId)
      }
    }
  }, [])

  const generatePractice = async () => {
    if (!userId || !selectedModule) return

    setIsGenerating(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/practice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moduleId: selectedModule.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Generation failed")
      }

      const practice: PracticeAttempt = await response.json()
      onGenerate(practice)
    } catch (error) {
      console.error("Practice generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate practice")
    } finally {
      setIsGenerating(false)
    }
  }

  const filteredModules = modules?.filter((module) => module.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const pageCount = Math.ceil((filteredModules?.length || 0) / modulesPerPage)
  const paginatedModules = filteredModules?.slice((currentPage - 1) * modulesPerPage, currentPage * modulesPerPage)

  if (fetchError) return <div className="text-destructive">Failed to load modules</div>
  if (!modules) return <div>Loading...</div>

  return (
    <div className="practice-generator space-y-4 w-full px-4">
      <h2 className="text-2xl font-semibold text-foreground">Practice Generator</h2>
      {error && <div className="text-destructive">{error}</div>}
      <div className="controls space-y-4">
        <div className="space-y-2">
          <Label htmlFor="module-select">Select a module</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-auto">
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate text-left">
                    {selectedModule ? selectedModule.title : "Select module..."}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              style={{ width: "min(calc(var(--radix-popover-trigger-width) + 8rem), calc(100vw - 2rem))" }}
            >
              <Command>
                <CommandInput placeholder="Search modules..." onValueChange={setSearchTerm} />
                <CommandList>
                  <CommandEmpty>No modules found.</CommandEmpty>
                  <CommandGroup>
                    {paginatedModules?.map((module) => (
                      <CommandItem
                        key={module.id}
                        onSelect={() => {
                          setSelectedModule(module)
                          setOpen(false)
                        }}
                        className="flex-wrap"
                      >
                        {module.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="flex items-center justify-between p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                  }}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={generatePractice} disabled={!selectedModule || isGenerating} className="w-full">
          {isGenerating ? "Generating..." : "Generate Practice"}
        </Button>
      </div>
    </div>
  )
}

