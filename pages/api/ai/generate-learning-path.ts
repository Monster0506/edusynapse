import type { NextApiRequest, NextApiResponse } from "next";
import { generate_path } from "@/lib/ai/defaults/generate_path";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    try {
      // Generate the learning path without saving to database
      const modules = await generate_path(topic);
      
      // Create the learning path and its modules in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // First create the learning path
        const learningPath = await tx.learningPath.create({
          data: {
            title: topic,
            description: `A learning path for ${topic}`,
            content: {
              modules: modules.map(module => ({
                ...module,
                userId
              }))
            },
            userId,
          }
        });

        // Then create all the AI modules and link them to the learning path
        const modulePromises = modules.map(async (moduleData, index) => {
          const aiModule = await tx.aIModule.create({
            data: {
              title: moduleData.title,
              description: moduleData.description,
              content: {
                introduction: "",
                keyPoints: moduleData.objectives || [],
                explanation: "",
                examples: [],
                quiz: []
              },
              status: "NOT_STARTED",
              userId,
              tags: [],
              difficulty: "BEGINNER"
            }
          });

          // Create the learning path item
          await tx.aIModuleLearningPathItem.create({
            data: {
              order: index,
              learningPathId: learningPath.id,
              aiModuleId: aiModule.id,
              confidence: 0
            }
          });

          return aiModule;
        });

        await Promise.all(modulePromises);

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

      if (!result) {
        throw new Error("Failed to create learning path");
      }

      return res.status(201).json(result);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Failed to save learning path to database",
        error: dbError instanceof Error ? dbError.message : "Unknown database error",
      });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({
      message: "Failed to generate learning path",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
