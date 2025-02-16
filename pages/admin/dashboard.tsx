"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminLayout from "@/components/AdminLayout"
import UserManagement from "@/components/admin/UserManagement"
import AnalyticsOverview from "@/components/admin/AnalyticsOverview"
import ContentManagement from "@/components/admin/ContentManagement"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const AdminDashboard = () => {
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Button variant="link" asChild>
                  <Link href="/admin/users">User Management</Link>
                </Button>
              </li>
              <li>
                <Button variant="link" asChild>
                  <Link href="/admin/content">Content Management</Link>
                </Button>
              </li>
              <li>
                <Button variant="link" asChild>
                  <Link href="/admin/analytics">Analytics</Link>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
        <AnalyticsOverview />
        <UserManagement />
        <ContentManagement />
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
