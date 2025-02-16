import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import prisma from "../../../lib/prisma"

// Remove this line if it exists:
// const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    if (req.method === "GET") {
      const workspaces = await prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json(workspaces)
    } else if (req.method === "POST") {
      const { name, description } = req.body

      const workspace = await prisma.workspace.create({
        data: {
          name,
          description,
          ownerId: userId,
          members: {
            create: {
              userId: userId,
              role: "owner",
            },
          },
        },
      })

      res.status(201).json(workspace)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Workspace error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

