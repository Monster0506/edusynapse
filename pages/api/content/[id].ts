import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    if (req.method === "GET") {
      const contentItem = await prisma.contentItem.findUnique({
        where: { id: id as string },
        include: {
          topic: true,
          bookmarks: {
            where: {
              userId: userId,
            },
          },
        },
      })

      if (!contentItem) {
        return res.status(404).json({ message: "Content item not found" })
      }

      res.status(200).json(contentItem)
    } else if (req.method === "PUT") {
      const { title, description, content, type, difficulty } = req.body

      const updatedContentItem = await prisma.contentItem.update({
        where: { id: id as string },
        data: {
          title,
          description,
          content,
          type,
          difficulty,
        },
      })

      res.status(200).json(updatedContentItem)
    } else if (req.method === "DELETE") {
      await prisma.contentItem.delete({
        where: { id: id as string },
      })

      res.status(204).end()
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Error handling content item:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

