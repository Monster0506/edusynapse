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
      const breakoutRooms = await prisma.breakoutRoom.findMany({
        where: { workspaceId: id as string },
        include: { participants: { select: { userId: true } } },
      })

      res.status(200).json(
        breakoutRooms.map((room) => ({
          id: room.id,
          name: room.name,
          participants: room.participants.map((p) => p.userId),
        })),
      )
    } else if (req.method === "POST") {
      const { name } = req.body

      const newRoom = await prisma.breakoutRoom.create({
        data: {
          name,
          workspaceId: id as string,
        },
      })

      res.status(201).json(newRoom)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Breakout rooms error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

