import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { generateRecommendedTopics } from "@/lib/ai/defaults/generate_recommended_topics";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { amount = 3, excludeTitles = [] } = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized to access recommendations" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, interests: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user.role, user.interests);

    const aiResponse = await generateRecommendedTopics(user.interests, amount);
    console.log("AI Response:", aiResponse);
    let recommendations;

    try {
      recommendations = JSON.parse(aiResponse);
      // Filter out any recommendations that match excluded titles
      if (excludeTitles.length > 0) {
        recommendations = recommendations.filter(
          (rec: any) => !excludeTitles.includes(rec.title)
        );
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return res
        .status(500)
        .json({ message: "Error generating recommendations" });
    }

    const aiRecommendation = await prisma.aIRecommendation.create({
      data: {
        userId,
        content: JSON.stringify(recommendations),
      },
    });

    res.status(200).json(aiRecommendation);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res
      .status(500)
      .json({ message: "An error occurred while generating recommendations" });
  }
}
