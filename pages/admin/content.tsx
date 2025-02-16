"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import ContentManagement from "@/components/admin/ContentManagement"

const AdminContentPage = () => {
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
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>
      <ContentManagement />
    </AdminLayout>
  )
}

export default AdminContentPage
