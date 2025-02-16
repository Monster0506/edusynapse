import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    if (req.method === "GET") {
      const { startDate, endDate } = req.query

      const analyticsData = await prisma.analyticsEntry.findMany({
        where: {
          userId: userId,
          date: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
          },
        },
        include: {
          topic: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      const aggregatedData = analyticsData.reduce(
        (acc, entry) => {
          if (!acc[entry.topicId]) {
            acc[entry.topicId] = {
              topicName: entry.topic.title,
              totalTimeSpent: 0,
              averageScore: 0,
              scoreCount: 0,
            }
          }
          acc[entry.topicId].totalTimeSpent += entry.timeSpent
          if (entry.score !== null) {
            acc[entry.topicId].averageScore += entry.score
            acc[entry.topicId].scoreCount++
          }
          return acc
        },
        {} as Record<string, { topicName: string; totalTimeSpent: number; averageScore: number; scoreCount: number }>,
      )

      Object.values(aggregatedData).forEach((topic) => {
        if (topic.scoreCount > 0) {
          topic.averageScore /= topic.scoreCount
        }
      })

      res.status(200).json(aggregatedData)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

