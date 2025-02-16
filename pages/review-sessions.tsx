import type React from "react"
import { useQuery } from "react-query"
import QuickAccessToolbar from "../components/QuickAccessToolbar"
import ReviewSessionList from "../components/ReviewSessionList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const ReviewSessionsPage: React.FC = () => {
  const {
    data: reviewSessions,
    isLoading,
    error,
  } = useQuery("reviewSessions", async () => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const res = await fetch("/api/review-sessions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to fetch review sessions")

    const data = await res.json()
    console.log("Fetched review sessions:", data)
    return data
  })

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Review Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{(error as Error).message}</AlertDescription>
              </Alert>
            ) : (
              <ReviewSessionList reviewSessions={reviewSessions || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReviewSessionsPage

