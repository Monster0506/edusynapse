import type { NextApiRequest, NextApiResponse } from "next";
import { generate_modules } from "@/lib/ai/defaults/generate_module";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

    const parsedBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { topic, context, subject, saveToDatabase = true } = parsedBody;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const moduleData = await generate_modules(topic, context, subject, userId);

    if (!saveToDatabase) {
      return res.status(200).json(moduleData);
    }

    try {
      const savedModule = await prisma.aIModule.create({
        data: {
          title: moduleData.title,
          description: moduleData.description,
          content: {
            introduction: moduleData.content || "",
            keyPoints: moduleData.objectives || [],
            explanation: moduleData.explanation || "",
            examples: moduleData.examples || [],
            quiz: moduleData.quiz || [],
          },
          status: "ACTIVE",
          userId: userId,
          tags: moduleData.tags || [],
          difficulty: "BEGINNER",
        },
      });

      return res.status(201).json(savedModule);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to save module to database",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({
      message: "Error generating module",
      error: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : "Unknown type",
    });
  }
}
