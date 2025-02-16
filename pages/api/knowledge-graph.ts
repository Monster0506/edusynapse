import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Get all modules with their tags for the user
    const modules = await prisma.aIModule.findMany({
      where: {
        userId: decoded.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
      },
    });

    console.log("Found modules:", modules);

    return res.status(200).json(modules);
  } catch (error) {
    console.error("Error in knowledge graph API:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({
      message: "Failed to fetch knowledge graph data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
