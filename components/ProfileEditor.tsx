"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import jwt from "jsonwebtoken"

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  theme: string
  foregroundColor?: string
}

export default function ProfileEditor() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = jwt.decode(token) as { userId: string } | null
        if (payload && payload.userId) {
          fetchUser(payload.userId)
        } else {
          throw new Error("Invalid token")
        }
      } catch (err) {
        console.error("Error decoding token:", err)
        setError("Failed to authenticate user")
        setIsLoading(false)
      }
    } else {
      setError("No authentication token found")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      applyThemeAndColor(user.theme, user.foregroundColor)
    }
  }, [user])

  const fetchUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      setError("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      
      const updateData = {
        name: user.name,
        email: user.email,
        ...(user.avatarUrl && { avatarUrl: user.avatarUrl })
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser({ ...updatedUser, theme: user.theme })
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large. Please choose an image under 5MB.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      try {
        // Convert file to data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        if (user) {
          setUser({ ...user, avatarUrl: dataUrl })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process image")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleThemeChange = (value: string) => {
    if (user) {
      const newUser = { ...user, theme: value }
      if (value !== "custom") {
        newUser.foregroundColor = undefined
      }
      setUser(newUser)
      applyThemeAndColor(value, newUser.foregroundColor)
      // Theme is handled locally only through next-themes
      setTheme(value)
    }
  }

  const applyThemeAndColor = (theme: string, foregroundColor?: string) => {
    setTheme(theme)
  }

  if (isLoading) return <div className="text-center text-primary">Loading...</div>
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (!user) return <div className="text-center text-primary">No user data found</div>

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-primary">Profile Editor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt="Profile"
            />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <Button type="button" onClick={triggerFileInput}>
            Upload New Avatar
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
            className="hidden" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select onValueChange={handleThemeChange} value={user.theme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </div>
  )
}
