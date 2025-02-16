"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QuickAccessToolbar from "@/components/QuickAccessToolbar"
import ProfileEditor from "@/components/ProfileEditor"
import LearningStylePreferences from "@/components/LearningStylePreferences"
import jwt from "jsonwebtoken"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      try {
        const payload = jwt.decode(token) as { userId: string } | null
        if (payload && payload.userId) {
          setUserId(payload.userId)
          setIsLoading(false)
        } else {
          throw new Error("Invalid token")
        }
      } catch (error) {
        console.error("Error decoding token:", error)
        router.push("/login")
      }
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-8 w-[200px]" />
      </div>
    )
  }

  if (!userId) {
    return null // This will prevent any flickering while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">User Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <ProfileEditor userId={userId} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <LearningStylePreferences id={userId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

