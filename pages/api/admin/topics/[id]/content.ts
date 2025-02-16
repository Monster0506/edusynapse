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

    const { id } = req.query

    const contentItems = await prisma.contentItem.findMany({
      where: {
        topicId: id as string,
      },
      select: {
        id: true,
        title: true,
        type: true,
        published: true,
      },
    })

    res.status(200).json(contentItems)
  } catch (error) {
    console.error("Error fetching content items:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

