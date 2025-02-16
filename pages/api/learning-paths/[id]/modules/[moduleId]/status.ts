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
    const { id: pathId, moduleId } = req.query
    const { status } = req.body


    if (!pathId || !moduleId || typeof pathId !== "string" || typeof moduleId !== "string") {
      return res.status(400).json({ message: "Invalid path or module ID" })
    }

    if (!status || !["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Get the learning path
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: pathId },
      select: {
        id: true,
        userId: true,
        content: true,
        aiModuleItems: {
          where: { aiModuleId: moduleId },
          select: { aiModuleId: true }
        }
      }
    })


    if (!learningPath) {
      return res.status(404).json({ message: "Learning path not found" })
    }

    if (learningPath.userId !== decoded.userId) {
      return res.status(403).json({ message: "Not authorized to access this learning path" })
    }

    // Update both the learning path content and the AIModule
    const result = await prisma.$transaction(async (tx) => {
      // Update the module status in the learning path content
      const content = learningPath.content || { modules: [] }
      const moduleIndex = content.modules?.findIndex((m: any) => m.id === moduleId)
      
      if (moduleIndex === -1) {
        throw new Error(`Module ${moduleId} not found in learning path ${pathId}`)
      }

      content.modules[moduleIndex] = {
        ...content.modules[moduleIndex],
        status
      }


      // Update the learning path content
      const updatedLearningPath = await tx.learningPath.update({
        where: { id: pathId },
        data: { content },
        include: {
          aiModuleItems: {
            include: {
              aiModule: true
            },
            orderBy: {
              order: "asc"
            }
          }
        }
      })

      // Update the AIModule status if it exists
      if (learningPath.aiModuleItems.length > 0) {
        await tx.aIModule.update({
          where: { id: moduleId },
          data: { status }
        })
      }

      return updatedLearningPath
    })


    return res.status(200).json(result)
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      message: "Failed to update module status",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
