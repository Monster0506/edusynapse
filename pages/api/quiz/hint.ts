import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const { questionId } = req.body

    // Here you would implement the AI hint generation logic
    // For now, we'll return a mock hint
    const hint = `Think about the key concepts related to this question. Remember that ${
      Math.random() > 0.5
        ? "the simplest answer is often correct"
        : "sometimes the answer isn't obvious at first glance"
    }.`

    res.status(200).json({ hint })
  } catch (error) {
    console.error("Error generating hint:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

