import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const adminId = decoded.userId

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { isAdmin: true },
    })

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const { id } = req.query
    const { isAdmin } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

