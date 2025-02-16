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
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: id as string,
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
          whiteboards: true,
          chats: {
            include: {
              messages: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" })
      }

      res.status(200).json(workspace)
    } else if (req.method === "PUT") {
      const { name, description } = req.body

      const workspace = await prisma.workspace.updateMany({
        where: {
          id: id as string,
          ownerId: userId,
        },
        data: {
          name,
          description,
        },
      })

      res.status(200).json(workspace)
    } else if (req.method === "DELETE") {
      await prisma.workspace.deleteMany({
        where: {
          id: id as string,
          ownerId: userId,
        },
      })

      res.status(204).end()
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Workspace error:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

