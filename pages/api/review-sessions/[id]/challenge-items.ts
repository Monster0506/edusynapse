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

    const challengeItems = await prisma.reviewItem.findMany({
      where: { reviewSessionId: id as string, reviewSession: { userId } },
      orderBy: { createdAt: "asc" },
      take: 10, // Limit to 10 items for the challenge
    })

    res.status(200).json(challengeItems)
  } catch (error) {
    console.error("Error fetching challenge items:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

