import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import prisma from "../../../../lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify the JWT token
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const requestingUserId = decoded.userId

    const { id } = req.query

    // Ensure the requesting user is accessing their own data
    if (requestingUserId !== id) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (req.method === "GET") {
      const activities = await prisma.activity.findMany({
        where: { userId: id as string },
        orderBy: { createdAt: "desc" },
        take: 10, // Limit to 10 most recent activities
      })

      return res.status(200).json(activities)
    } else {
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error in activities API route:", error)
    return res.status(401).json({ error: "Invalid token" })
  }
}

