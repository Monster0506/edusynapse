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

    const { id } = req.query

    if (req.method === "GET") {
      const reviewSession = await prisma.reviewSession.findFirst({
        where: {
          id: id as string,
          userId: userId,
        },
        include: {
          items: {
            include: {
              contentItem: true,
            },
          },
        },
      })

      if (!reviewSession) {
        return res.status(404).json({ message: "Review session not found" })
      }

      res.status(200).json(reviewSession)
    } else if (req.method === "PUT") {
      const { completed, items } = req.body

      const updatedSession = await prisma.reviewSession.update({
        where: { id: id as string },
        data: {
          completed,
          items: {
            updateMany: items.map((item: any) => ({
              where: { id: item.id },
              data: {
                userAnswer: item.userAnswer,
                correct: item.correct,
              },
            })),
          },
        },
        include: {
          items: true,
        },
      })

      res.status(200).json(updatedSession)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Review session error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

