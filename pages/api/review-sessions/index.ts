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

    console.log("Fetching review sessions for user:", userId)

    if (req.method === "GET") {
      const reviewSessions = await prisma.reviewSession.findMany({
        where: {
          userId,
          completed: false,
          dueDate: {
            lte: new Date(),
          },
        },
        include: {
          items: {
            include: {
              contentItem: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      })

      console.log("Found review sessions:", reviewSessions)

      res.status(200).json(reviewSessions)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Review sessions error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

