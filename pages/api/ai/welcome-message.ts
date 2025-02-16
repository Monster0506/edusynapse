import type { NextApiRequest, NextApiResponse } from "next";
import { generateWelcome } from "@/lib/ai/defaults/generate_welcome";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const message = await generateWelcome();
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error generating welcome message:", error);
    res.status(500).json({
      message: "An error occurred while generating the welcome message.",
    });
  }
}
