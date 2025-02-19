"use client"

import { useRouter } from "next/router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery } from "react-query"
import { useState } from "react"

interface ModuleWithEase {
  id: string
  title: string
  averageEase: number
}

export default function UpcomingReviews() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)

  const {
    data: modules,
    error,
    isLoading,
  } = useQuery<ModuleWithEase[]>("modulesByEase", async () => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const res = await fetch("/api/modules/by-ease", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Failed to fetch modules")
    return res.json()
  })

  if (error) return <div>Failed to load upcoming reviews</div>
  if (isLoading) return <div>Loading...</div>
  if (!modules?.length) return null

  const itemsPerPage = 3
  const totalPages = Math.ceil(modules.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentModules = modules.slice(startIndex, endIndex)

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
        <CardTitle className="text-lg font-semibold">Upcoming Reviews</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {currentModules.map((module) => {
            let easeClass = ""
            let easeLabel = ""

            if (module.averageEase > 3) {
              easeClass = "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200"
              easeLabel = "Easy"
            } else if (module.averageEase < 2) {
              easeClass = "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200"
              easeLabel = "Hard"
            } else {
              easeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200"
              easeLabel = "Medium"
            }

            return (
              <div
                key={module.id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col">
                  <h3 className="font-semibold mb-2">{module.title}</h3>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => router.push(`/modules/${module.id}`)}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push(`/practice?moduleId=${module.id}`)}
                    >
                      Practice
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between mt-4">
            <Button onClick={goToPreviousPage} disabled={currentPage === 0} variant="outline" size="sm">
              Previous
            </Button>
            <Button onClick={goToNextPage} disabled={currentPage === totalPages - 1} variant="outline" size="sm">
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

