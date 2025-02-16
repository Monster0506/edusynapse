"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LearningPreferences {
  visual: number
  auditory: number
  kinesthetic: number
}

const LEARNING_STYLE_COLORS = {
  Visual: "#f4a261", // Coral
  Auditory: "#2a9d8f", // Teal
  Kinesthetic: "#264653", // Dark blue-green
}

const LEARNING_STYLE_DESCRIPTIONS = {
  visual: "You learn best through visual aids like diagrams, charts, and written materials.",
  auditory: "You learn best through listening, discussions, and verbal explanations.",
  kinesthetic: "You learn best through hands-on experience and physical activities.",
}

export default function LearningStylePreferences({ id }: { id: string }) {
  const [preferences, setPreferences] = useState<LearningPreferences>({
    visual: 33,
    auditory: 17,
    kinesthetic: 50,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true)
        setError("")

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch(`/api/users/${id}/learning-preferences`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const text = await response.text()

        if (!response.ok) {
          const errorData = JSON.parse(text)
          throw new Error(errorData.message || "Failed to fetch learning preferences")
        }

        const data = JSON.parse(text)

        setPreferences({
          visual: Math.floor(Number(data.visual)) || 33,
          auditory: Math.floor(Number(data.auditory)) || 17,
          kinesthetic: Math.ceil(Number(data.kinesthetic)) || 50,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load learning preferences")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchPreferences()
    }
  }, [id])

  useEffect(() => {
    if (!isLoading) {
      // Trigger animation after a short delay
      const timer = setTimeout(() => {
        setAnimationKey((prevKey) => prevKey + 1)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Calculate the dominant learning style
  const dominantStyle = Object.entries(preferences).reduce((a, b) =>
    preferences[a[0] as keyof LearningPreferences] > preferences[b[0] as keyof LearningPreferences] ? a : b,
  )[0]

  // Prepare data for the pie chart
  const chartData = Object.entries(preferences).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = Math.round((data.value / total) * 100)
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="capitalize font-semibold text-gray-800 dark:text-gray-200">{`${data.name}: ${percentage}%`}</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const percentage = Math.round((value / total) * 100)

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-sm font-medium">
        {`${percentage}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Learning Style Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Learning Style Distribution Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  startAngle={90}
                  endAngle={-270}
                  animationBegin={0}
                  animationDuration={1000}
                  key={animationKey}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={LEARNING_STYLE_COLORS[entry.name as keyof typeof LEARNING_STYLE_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Dominant Style Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                Your Dominant Learning Style: <span className="capitalize">{dominantStyle}</span>
              </h3>
              <p className="text-muted-foreground">
                {LEARNING_STYLE_DESCRIPTIONS[dominantStyle as keyof typeof LEARNING_STYLE_DESCRIPTIONS]}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

