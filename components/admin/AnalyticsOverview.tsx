"use client"

import { useQuery } from "react-query"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AnalyticsOverview = () => {
  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch("/api/admin/analytics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.json()
  }

  const { data, isLoading, error } = useQuery("adminAnalytics", fetchAnalytics)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>

  const chartData = {
    labels: data.topTopics.map((topic: any) => topic.title),
    datasets: [
      {
        label: "User Engagement",
        data: data.topTopics.map((topic: any) => topic.engagementScore),
        backgroundColor: "hsl(var(--primary))",
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top Topics by User Engagement",
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Users (Last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.activeUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New Users (Last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.newUsers}</p>
            </CardContent>
          </Card>
        </div>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

export default AnalyticsOverview
