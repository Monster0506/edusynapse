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

    const { contentItemId } = req.body

    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    })

    if (!contentItem || contentItem.type !== "quiz") {
      return res.status(404).json({ message: "Quiz not found" })
    }

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        contentItemId,
        score: 0,
        answers: {},
      },
    })

    res.status(200).json({ quizAttemptId: quizAttempt.id, questions: JSON.parse(contentItem.content) })
  } catch (error) {
    console.error("Error starting quiz:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

