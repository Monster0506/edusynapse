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
      const annotations = await prisma.annotation.findMany({
        where: { contentItemId: id as string },
        orderBy: { createdAt: "desc" },
      })

      res.status(200).json(annotations)
    } else if (req.method === "POST") {
      const { text, annotation } = req.body

      const newAnnotation = await prisma.annotation.create({
        data: {
          text,
          annotation,
          userId,
          contentItemId: id as string,
        },
      })

      res.status(201).json(newAnnotation)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Error handling annotations:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

