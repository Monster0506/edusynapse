"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("token")
    
    if (!token) {
      // No token found, redirect to login
      router.push("/login")
    } else {
      try {
        // Verify token is valid JWT
        const parts = token.split(".")
        if (parts.length !== 3) {
          throw new Error("Invalid token format")
        }
        
        // Parse token payload
        const payload = JSON.parse(atob(parts[1]))
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < currentTime) {
          // Token expired, clear it and redirect to login
          localStorage.removeItem("token")
          router.push("/login")
        } else {
          // Token valid, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (error) {
        // Invalid token, clear it and redirect to login
        console.error("Invalid token:", error)
        localStorage.removeItem("token")
        router.push("/login")
      }
    }
  }, [router])

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
