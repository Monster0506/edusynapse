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
    const { itemId, answer, time } = req.body

    const reviewItem = await prisma.reviewItem.findUnique({
      where: { id: itemId },
      include: { reviewSession: true },
    })

    if (!reviewItem || reviewItem.reviewSession.userId !== userId) {
      return res.status(404).json({ message: "Review item not found" })
    }

    const isCorrect = answer.toLowerCase().trim() === reviewItem.answer.toLowerCase().trim()
    const points = isCorrect ? Math.max(10 - Math.floor(time / 3), 1) : 0

    await prisma.reviewItem.update({
      where: { id: itemId },
      data: { isCorrect, answeredAt: new Date() },
    })

    // Update user's score
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: points } },
    })

    res.status(200).json({ isCorrect, points })
  } catch (error) {
    console.error("Error submitting challenge answer:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

