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

    if (req.method === "POST") {
      const { content } = req.body

      const whiteboard = await prisma.whiteboard.findFirst({
        where: { workspaceId: id as string },
        include: { versions: { orderBy: { versionNumber: "desc" } } },
      })

      if (!whiteboard) {
        return res.status(404).json({ message: "Whiteboard not found" })
      }

      const newVersion = await prisma.whiteboardVersion.create({
        data: {
          whiteboardId: whiteboard.id,
          content,
          createdBy: userId,
          versionNumber: (whiteboard.versions[0]?.versionNumber || 0) + 1,
        },
      })

      await prisma.whiteboard.update({
        where: { id: whiteboard.id },
        data: { content },
      })

      res.status(201).json(newVersion)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Whiteboard version error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

