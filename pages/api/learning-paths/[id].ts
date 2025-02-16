import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid learning path ID" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    if (req.method === "GET") {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          userId: true,
          items: {
            include: {
              topic: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!learningPath) {
        return res.status(404).json({ message: "Learning path not found" });
      }

      if (learningPath.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this learning path" });
      }

      console.log("Returning learning path:", {
        id: learningPath.id,
        moduleCount: learningPath.content?.modules?.length,
        moduleStatuses: learningPath.content?.modules?.map((m: any) => ({ id: m.id, status: m.status }))
      });

      return res.status(200).json(learningPath);
    }

    if (req.method === "PUT") {
      const { title, description, items } = req.body;

      const updatedLearningPath = await prisma.learningPath.update({
        where: { id, userId },
        data: {
          title,
          description,
          items: {
            deleteMany: {},
            create: items.map((item: { topicId: string; order: number }) => ({
              topicId: item.topicId,
              order: item.order,
            })),
          },
        },
        include: {
          items: {
            include: {
              topic: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return res.status(200).json(updatedLearningPath);
    }

    if (req.method === "DELETE") {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id },
        select: { userId: true },
      });
    
      if (!learningPath) {
        return res.status(404).json({ message: "Learning path not found" });
      }
    
      if (learningPath.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    
      // Wrap all delete operations in a transaction
      await prisma.$transaction([
        prisma.aIModuleLearningPathItem.deleteMany({
          where: { learningPathId: id },
        }),
        prisma.learningPathItem.deleteMany({
          where: { learningPathId: id },
        }),
        prisma.learningPath.delete({
          where: { id },
        })
      ]);
    
      return res.status(200).json({ message: "Learning path deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling learning path:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
