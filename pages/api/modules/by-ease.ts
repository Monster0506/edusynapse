import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const fetchModules = async (token: string) => {
  const response = await fetch("http://localhost:3000/api/modules", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    // Fetch modules using the same pattern as PracticeGenerator
    const modules = await fetchModules(token);

    // Format and sort the modules by ease
    const formattedModules = modules
      .map(module => {
        return {
          id: module.id,
          title: module.title,
          averageEase: module.ease
        };
      })
      .sort((a, b) => a.averageEase - b.averageEase); // Sort by ease ascending (hardest first)

    return res.status(200).json(formattedModules);
  } catch (error) {
    console.error("Error in /api/modules/by-ease:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
}
