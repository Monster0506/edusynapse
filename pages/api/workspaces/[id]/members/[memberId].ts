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

    const { id, memberId } = req.query

    if (req.method === "PUT") {
      const { role } = req.body

      const updatedMember = await prisma.workspaceMember.update({
        where: { id: memberId as string, workspaceId: id as string },
        data: { role },
      })

      res.status(200).json(updatedMember)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Update workspace member error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

