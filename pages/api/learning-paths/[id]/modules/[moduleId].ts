import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { generate_modules } from "@/lib/ai/defaults/generate_module"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { id: pathId, moduleId } = req.query

    if (!pathId || !moduleId || typeof pathId !== "string" || typeof moduleId !== "string") {
      return res.status(400).json({ message: "Invalid path or module ID" })
    }

    // Get the learning path
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: pathId },
      select: {
        id: true,
        title: true,
        userId: true,
        content: true
      }
    })

    if (!learningPath) {
      return res.status(404).json({ message: "Learning path not found" })
    }

    if (learningPath.userId !== decoded.userId) {
      return res.status(403).json({ message: "Not authorized to access this learning path" })
    }

    // Ensure content is properly parsed
    const content = learningPath.content || { modules: [] }

    // Find the module in the content
    const moduleIndex = content.modules?.findIndex((m: any) => m.id === moduleId)
    if (moduleIndex === -1) {
      return res.status(404).json({ message: `Module ${moduleId} not found in learning path ${pathId}` })
    }

    const module = content.modules[moduleIndex]

    // Check if module has detailed content
    if (module.detailedContent) {
      return res.status(200).json(module.detailedContent)
    }

    // Generate new content if it doesn't exist
    const generatedContent = await generate_modules(
      module.title,
      module.description || "",
      learningPath.title || "Learning Module",
      decoded.userId // Pass the userId from the JWT token
    )

    // Update the learning path content with the generated content
    content.modules[moduleIndex] = {
      ...module,
      detailedContent: generatedContent
    }

    // Save the updated content
    await prisma.learningPath.update({
      where: { id: pathId },
      data: { content }
    })

    return res.status(200).json(generatedContent)
  } catch (error) {
    console.error("Module loading error:", error)
    return res.status(500).json({ 
      message: "Failed to load module content",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
