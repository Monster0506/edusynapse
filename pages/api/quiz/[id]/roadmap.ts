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

    const { id } = req.query

    // Here you would implement the roadmap generation logic based on quiz results
    // For now, we'll return a mock roadmap
    const roadmap = [
      {
        id: "1",
        title: "Review Basic Concepts",
        type: "Article",
        difficulty: "Beginner",
        estimatedTime: "15 minutes",
      },
      {
        id: "2",
        title: "Practice Exercises",
        type: "Interactive",
        difficulty: "Intermediate",
        estimatedTime: "30 minutes",
      },
      {
        id: "3",
        title: "Advanced Topics",
        type: "Video",
        difficulty: "Advanced",
        estimatedTime: "45 minutes",
      },
    ]

    res.status(200).json(roadmap)
  } catch (error) {
    console.error("Error generating roadmap:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

