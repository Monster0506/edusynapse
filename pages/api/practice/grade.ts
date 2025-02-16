import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { grade_practice } from "@/lib/ai/defaults/grade_practice";

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

    if (req.method === "POST") {
      const { question, type, options, userAnswer } = req.body;
      
      const result = await grade_practice({
        question,
        type,
        options,
        userAnswer,
      });

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Grading failed:", error);
    const isJwtError = error instanceof jwt.JsonWebTokenError;
    return res.status(isJwtError ? 401 : 500).json({
      error: isJwtError ? "Invalid token" : error.message,
    });
  }
}
