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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastStreakUpdate: true },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const today = new Date()
    const lastUpdate = user.lastStreakUpdate ? new Date(user.lastStreakUpdate) : null

    if (!lastUpdate || !isSameDay(today, lastUpdate)) {
      if (lastUpdate && isDayBefore(today, lastUpdate)) {
        // User has continued their streak
        await prisma.user.update({
          where: { id: userId },
          data: {
            streak: user.streak + 1,
            lastStreakUpdate: today,
          },
        })
      } else {
        // User has started a new streak
        await prisma.user.update({
          where: { id: userId },
          data: {
            streak: 1,
            lastStreakUpdate: today,
          },
        })
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    })

    res.status(200).json({ streak: updatedUser?.streak || 0 })
  } catch (error) {
    console.error("Error updating streak:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isDayBefore(date1: Date, date2: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000
  const diffDays = Math.round((date1.getTime() - date2.getTime()) / oneDayMs)
  return diffDays === 1
}

