import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { id: learningPathId } = req.query;

    if (!learningPathId || typeof learningPathId !== "string") {
      return res.status(400).json({ message: "Invalid learning path ID" });
    }

    // Get the learning path and check its content
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: learningPathId },
      select: {
        content: true,
        userId: true
      }
    });

    if (!learningPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    if (learningPath.userId !== decoded.userId) {
      return res.status(403).json({ message: "Not authorized to access this learning path" });
    }

    // Count completed modules from the content
    const content = learningPath.content as { modules: Array<{ status: string }> };
    const completedModules = content.modules?.filter(
      module => module.status === "COMPLETED"
    ).length || 0;

    // Get total number of modules
    const totalModules = content.modules?.length || 0;

    return res.status(200).json({ 
      completedModules,
      totalModules
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
