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

    const { contentItemId } = req.body

    // Here you would implement the meme generation logic
    // For now, we'll return a mock meme URL
    const memeUrl = `https://api.memegen.link/images/success/You_aced_the_quiz/Great_job!.jpg`

    res.status(200).json({ memeUrl })
  } catch (error) {
    console.error("Error generating meme reward:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

