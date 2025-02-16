import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const DEFAULT_PREFERENCES = {
  visual: 33.33,
  auditory: 33.33,
  kinesthetic: 33.34,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Verify token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const { id } = req.query;

    // Verify user is accessing their own data
    if (decoded.userId !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        select: { learningStyle: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse the JSON learning style data
      let preferences = DEFAULT_PREFERENCES;
      if (user.learningStyle) {
        try {
          // If learningStyle is already an object, use it directly
          // If it's a string, parse it
          const learningStyle =
            typeof user.learningStyle === "string"
              ? JSON.parse(user.learningStyle)
              : user.learningStyle;
          
          if (
            learningStyle.visual !== undefined &&
            learningStyle.auditory !== undefined &&
            learningStyle.kinesthetic !== undefined
          ) {
            preferences = {
              visual: Number(learningStyle.visual),
              auditory: Number(learningStyle.auditory),
              kinesthetic: Number(learningStyle.kinesthetic),
            };
          }
        } catch (error) {
          console.error("Error parsing learning style:", error);
        }
      } else {
        // If no learning style exists, save the default preferences
        await prisma.user.update({
          where: { id: id as string },
          data: { learningStyle: DEFAULT_PREFERENCES },
        });
      }

      // Normalize percentages to ensure they sum to 100
      const total = Object.values(preferences).reduce(
        (sum, val) => sum + val,
        0,
      );
      if (total !== 100) {
        const factor = 100 / total;
        preferences = {
          visual: preferences.visual * factor,
          auditory: preferences.auditory * factor,
          kinesthetic: preferences.kinesthetic * factor,
        };
      }

      return res.status(200).json(preferences);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
