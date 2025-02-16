import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
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

    const { topicId } = req.query;

    // Here you would implement the peer recommendation logic
    // For now, we'll return a mock response
    const peerRecommendations = [
      {
        id: "1",
        title: "Advanced JavaScript Patterns",
        type: "article",
        difficulty: "advanced",
        rating: 4.8,
      },
      {
        id: "2",
        title: "React Hooks Deep Dive",
        type: "video",
        difficulty: "intermediate",
        rating: 4.6,
      },
      // Add more recommendations as needed
    ];

    res.status(200).json(peerRecommendations);
  } catch (error) {
    console.error("Error in peer recommendations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
