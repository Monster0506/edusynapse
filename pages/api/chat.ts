import type { NextApiRequest, NextApiResponse } from "next";
import { generateResponse, type ModelType } from "@/lib/ollama";
import { models } from "@/lib/ai/constants/models";
import { chat } from "@/lib/ai/defaults/chat";
import { tools } from "@/lib/ai/constants/tools";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { message, modelType } = req.body;
  console.log('[Chat API] Received request:', { message, modelType })

  try {
    const aiResponse = await chat(message, { 
      model: models[modelType],
      tools: tools
    });
    res.status(200).json({
      message: aiResponse.message,
      messages: aiResponse.messages,
      tools: aiResponse.tools
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res
      .status(500)
      .json({ 
        message: "An error occurred while processing your request.",
        error: error instanceof Error ? error.message : String(error)
      });
  }
}
