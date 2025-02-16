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
      const summaries = await prisma.sessionSummary.findMany({
        where: { workspaceId: id as string },
        orderBy: { createdAt: "desc" },
      })

      res.status(200).json(summaries)
    } else if (req.method === "POST") {
      const { content } = req.body

      const newSummary = await prisma.sessionSummary.create({
        data: {
          content,
          workspaceId: id as string,
          createdBy: userId,
        },
      })

      res.status(201).json(newSummary)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Session summaries error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

