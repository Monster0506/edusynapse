"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "react-query"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { LogIn, Loader2, MessageCircle } from "lucide-react"
import { Callout } from "@/components/ui/callout"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()

  const { data: welcomeMessage, isLoading: isWelcomeLoading } = useQuery(
    "welcomeMessage",
    async () => {
      const res = await fetch("/api/ai/welcome-message")
      if (!res.ok) throw new Error("Failed to fetch welcome message")
      return res.json()
    },
    { refetchOnWindowFocus: false },
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlert(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        router.push("/dashboard")
      } else {
        throw new Error(data.message || "An error occurred during login")
      }
    } catch (error) {
      console.error("Login error:", error)
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Log in to EduSynapse</CardTitle>
          <CardDescription className="text-center">Welcome back! Please log in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {isWelcomeLoading ? (
            <div className="flex justify-center items-center h-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : welcomeMessage ? (
            <Callout className="mb-6 text-foreground">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <div className="font-medium">Welcome Message</div>
              </div>
              <div className="mt-1 text-sm">{welcomeMessage.message}</div>
            </Callout>
          ) : null}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </>
              )}
            </Button>
          </form>
          {alert && (
            <Alert variant={alert.type === "error" ? "destructive" : "default"} className="mt-4">
              <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          <div className="mt-4 text-sm text-center">
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

