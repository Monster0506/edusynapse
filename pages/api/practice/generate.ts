import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { generate_practice } from "@/lib/ai/defaults/generate_practice";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const userId = decoded.userId;

    if (req.method === "POST") {
      const { moduleId } = req.body;

      // Get the module content
      const module = await prisma.aIModule.findUnique({
        where: { id: moduleId },
        include: { topic: true },
      });

      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }

      // Generate practice questions
      const questions = await generate_practice(module);
      console.log("[API/Generate] " + questions);

      // Save the practice attempt
      const attempt = await prisma.practiceAttempt.create({
        data: {
          userId,
          aiModuleId: moduleId,
          questions: questions,
          answer: questions.answer,
          score: null,
          completedAt: null,
        },
      });

      return res.status(200).json(attempt);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Practice generation failed:", error);
    const isJwtError = error instanceof jwt.JsonWebTokenError;
    return res.status(isJwtError ? 401 : 500).json({
      error: isJwtError ? "Invalid token" : error.message,
    });
  }
}
