"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import AnalyticsOverview from "@/components/admin/AnalyticsOverview"

const AdminAnalyticsPage = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch("/api/admin/check-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Not authorized")
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/dashboard")
      }
    }

    checkAdminStatus()
  }, [router])

  if (!isAdmin) {
    return <div>Loading...</div>
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Analytics Overview</h1>
      <AnalyticsOverview />
    </AdminLayout>
  )
}

export default AdminAnalyticsPage
