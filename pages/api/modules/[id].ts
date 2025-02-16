import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    const userId = decoded.userId
    
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "Invalid module ID" })
    }

    // Find the module and check if user has access to it
    const module = await prisma.aIModule.findFirst({
      where: {
        id,
        OR: [
          { userId }, // User's own module
          { 
            userId: null,
            status: "ACTIVE"
          }, // Public module
          {
            learningPathItems: {
              some: {
                learningPath: {
                  userId
                }
              }
            }
          } // Module in user's learning path
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        learningPathItems: {
          include: {
            learningPath: {
              select: {
                title: true,
                id: true
              }
            }
          }
        }
      }
    })

    if (!module) {
      return res.status(404).json({ message: "Module not found or access denied" })
    }

    // Update the updatedAt timestamp
    await prisma.aIModule.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(200).json(module)
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: (error as Error).message })
  }
}
