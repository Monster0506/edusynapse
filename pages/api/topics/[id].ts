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

    const topic = await prisma.topic.findFirst({
      where: {
        id: id as string,
        userId: userId,
      },
    })

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" })
    }

    res.status(200).json(topic)
  } catch (error) {
    console.error("Error fetching topic:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

