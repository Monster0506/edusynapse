"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Settings, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import jwt from "jsonwebtoken"

interface UserData {
  id: string
  name: string
  email: string
  avatarUrl: string
}

const QuickAccessToolbar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = jwt.decode(token) as { userId: string } | null
        if (payload && payload.userId) {
          fetchUser(payload.userId)
        }
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }

    const checkAdminStatus = async () => {
      if (!token) return

      try {
        const response = await fetch("/api/admin/check-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    checkAdminStatus()
  }, [])

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
      console.error("Failed to load user data", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative group ${
          isActive ? "text-primary" : "text-foreground hover:text-primary"
        }`}
      >
        {children}
        <span
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ease-out ${
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
    )
  }

  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4 md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/learning-path">Learning Path</NavLink>
                <NavLink href="/knowledge-graph">Knowledge Graph</NavLink>
                <NavLink href="/review-sessions">Review Sessions</NavLink>
                {isAdmin && <NavLink href="/admin/dashboard">Admin Dashboard</NavLink>}
                <NavLink href="/settings">Settings</NavLink>
                <Button onClick={handleLogout} variant="ghost" className="justify-start px-3">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="h-8 w-8 mr-2">
  <img src="/logo-light.png" alt="Logo Light" className="block dark:hidden" />
  <img src="/logo-dark.png" alt="Logo Dark" className="hidden dark:block" />
</div>

          <Link href="/dashboard" className="text-2xl font-bold hover:text-primary transition-colors">
            EduSynapse
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/learning-path">Learning Path</NavLink>
          <NavLink href="/knowledge-graph">Knowledge Graph</NavLink>
          <NavLink href="/practice">Practice Sessions</NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || "U"}`}
                    alt="Profile"
                  />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default QuickAccessToolbar
