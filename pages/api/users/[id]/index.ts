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
    const userId = decoded.userId

    const { id } = req.query

    // Ensure the requesting user is accessing their own data
    if (userId !== id) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        select: { id: true, name: true, email: true, bio: true, avatarUrl: true },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      return res.status(200).json(user)
    } else if (req.method === "PUT") {
      const updateData: any = {}
      const data = req.body

      // Handle JSON data
      if (typeof data === 'object') {
        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email
        if (data.bio) updateData.bio = data.bio
        if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: updateData,
      })

      return res.status(200).json(updatedUser)
    } else {
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error in user API route:", error)
    return res.status(401).json({ error: "Invalid token" })
  }
}
