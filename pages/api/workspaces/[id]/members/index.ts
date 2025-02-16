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
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: id as string },
        include: { user: { select: { id: true, name: true } } },
      })

      res.status(200).json(
        members.map((member) => ({
          id: member.id,
          name: member.user.name,
          role: member.role,
        })),
      )
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Workspace members error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

