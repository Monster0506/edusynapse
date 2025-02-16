import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
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
    const { rating } = req.body

    if (rating !== "helpful" && rating !== "not_helpful") {
      return res.status(400).json({ message: "Invalid rating" })
    }

    // Update the content item's rating
    const updatedContentItem = await prisma.contentItem.update({
      where: { id: id as string },
      data: {
        rating: {
          increment: rating === "helpful" ? 1 : -1,
        },
        ratingCount: {
          increment: 1,
        },
      },
    })

    res.status(200).json(updatedContentItem)
  } catch (error) {
    console.error("Error rating content:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

