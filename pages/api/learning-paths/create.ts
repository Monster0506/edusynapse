import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;
    const { title, description, content, moduleIds } = req.body;

    if (!title || !moduleIds || !Array.isArray(moduleIds)) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title and moduleIds array" });
    }

    try {
      // Create the learning path and link it to existing modules
      const result = await prisma.$transaction(async (tx) => {
        // First create the learning path
        const learningPath = await tx.learningPath.create({
          data: {
            title,
            description,
            content,
            userId
          }
        });

        // Create learning path items to link existing modules
        await Promise.all(
          moduleIds.map(async (moduleId: string, index: number) => {
            return tx.aIModuleLearningPathItem.create({
              data: {
                order: index,
                learningPathId: learningPath.id,
                aiModuleId: moduleId,
                confidence: 0,
                userId: userId // Preserve module userId
              }
            });
          })
        );

        // Return the learning path with its modules
        return await tx.learningPath.findUnique({
          where: { id: learningPath.id },
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
        });
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Prisma error creating learning path:", error);
      return res.status(500).json({
        message: "Failed to create learning path in database",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
