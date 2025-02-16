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

    const userRetentionRate = await calculateRetentionRate(userId)
    const allUsersRetentionRates = await getAllUsersRetentionRates()

    const percentile = calculatePercentile(userRetentionRate, allUsersRetentionRates)

    res.status(200).json({ percentile })
  } catch (error) {
    console.error("Error fetching peer comparison:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

async function calculateRetentionRate(userId: string): Promise<number> {
  const reviewItems = await prisma.reviewItem.findMany({
    where: { reviewSession: { userId } },
  })

  const correctItems = reviewItems.filter((item) => item.isCorrect)
  return correctItems.length / reviewItems.length
}

async function getAllUsersRetentionRates(): Promise<number[]> {
  const users = await prisma.user.findMany()
  const retentionRates = await Promise.all(users.map((user) => calculateRetentionRate(user.id)))
  return retentionRates
}

function calculatePercentile(value: number, array: number[]): number {
  const sortedArray = array.sort((a, b) => a - b)
  const index = sortedArray.findIndex((item) => item >= value)
  return Math.round((index / sortedArray.length) * 100)
}

