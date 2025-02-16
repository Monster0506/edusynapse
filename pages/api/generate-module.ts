import type { NextApiRequest, NextApiResponse } from "next"
import { generate_modules } from "../../lib/ai/defaults/generate_module"
import prisma from "../../lib/prisma"
import jwt from "jsonwebtoken"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
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

    // Fetch user's learning style
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { learningStyle: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { topic, context } = req.body;
    
    // Add learning style to context if available
    const enhancedContext = user.learningStyle 
      ? `${context || ""}. Please adapt this content for a ${JSON.stringify(user.learningStyle)} learning style` 
      : context;

    const generatedModule = await generate_modules(topic, enhancedContext, undefined, userId)

    const newModule = await prisma.aIModule.create({
      data: {
        title: generatedModule.title,
        description: generatedModule.description,
        content: generatedModule,
        tags: generatedModule.tags || [],
        difficulty: generatedModule.difficulty || "beginner",
        userId: userId,
      },
    })

    res.status(201).json(newModule)
  } catch (error) {
    console.error("Error generating module:", error)
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Error generating module" })
  }
}
