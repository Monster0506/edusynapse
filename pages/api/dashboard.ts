import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          include: { topic: true },
        },
        badges: true,
        upcomingReviews: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Calculate overall progress
    const overallProgress =
      user.progress.length > 0 ? user.progress.reduce((acc, curr) => acc + curr.completed, 0) / user.progress.length : 0

    // Get recommended topics (for simplicity, we're just getting topics with less than 50% progress)
    const recommendedTopics = user.progress
      .filter((p) => p.completed < 0.5)
      .map((p) => p.topic)
      .slice(0, 3)

    // Format upcoming reviews
    const upcomingReviews = await Promise.all(
      user.upcomingReviews.map(async (review) => {
        const topic = await prisma.topic.findUnique({ where: { id: review.topicId } })
        return {
          id: review.id,
          topicTitle: topic?.title || "Unknown Topic",
          dueDate: review.dueDate,
        }
      }),
    )

    // Generate progress data for the heatmap
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const progressData = await prisma.activity.groupBy({
      by: ["createdAt"],
      where: {
        userId: userId,
        createdAt: {
          gte: oneYearAgo,
        },
      },
      _count: {
        _all: true,
      },
    })

    const heatmapData = progressData.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0],
      value: entry._count._all,
    }))

    // Generate a daily challenge
    const dailyChallenge = {
      title: "Quiz Master",
      description: "Complete 3 quizzes today",
      reward: "2x XP for all quizzes completed",
    }

    // Fetch external goals (this is a mock, you'd need to implement the actual integration)
    const externalGoals = [
      {
        id: "1",
        platform: "Coursera",
        title: "Machine Learning Fundamentals",
        progress: 60,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
      {
        id: "2",
        platform: "LinkedIn Learning",
        title: "Advanced JavaScript",
        progress: 30,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      },
    ]

    const aiRecommendation = await prisma.aIRecommendation.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const aiRecommendations = aiRecommendation ? JSON.parse(aiRecommendation.content) : []

    res.status(200).json({
      name: user.name,
      overallProgress,
      recommendedTopics,
      badges: user.badges,
      upcomingReviews,
      progressData: heatmapData,
      dailyChallenge,
      externalGoals,
      aiRecommendations,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

