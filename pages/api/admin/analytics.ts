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
      select: { isAdmin: true },
    })

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const totalUsers = await prisma.user.count()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await prisma.user.count({
      where: {
        lastLoginDate: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const topTopics = await prisma.topic.findMany({
      take: 5,
      orderBy: {
        progress: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            progress: true,
          },
        },
      },
    })

    const analyticsData = {
      totalUsers,
      activeUsers,
      newUsers,
      topTopics: topTopics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        engagementScore: topic._count.progress,
      })),
    }

    res.status(200).json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

