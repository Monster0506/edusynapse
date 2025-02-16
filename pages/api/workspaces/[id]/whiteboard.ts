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
      const whiteboard = await prisma.whiteboard.findFirst({
        where: { workspaceId: id as string },
        include: { versions: { orderBy: { versionNumber: "desc" } } },
      })

      if (!whiteboard) {
        return res.status(404).json({ message: "Whiteboard not found" })
      }

      res.status(200).json({
        content: whiteboard.content,
        versions: whiteboard.versions,
        currentVersion: whiteboard.versions[0]?.id,
      })
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Whiteboard error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

