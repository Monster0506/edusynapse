import { NextApiRequest, NextApiResponse } from "next";
import { chat } from "@/lib/ai/services/ollama";
import { Message } from "@/lib/ai/interfaces/interfaces";
import { models } from "@/lib/ai/constants/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, modelType = "natural" } = req.body;

    // Convert the message to our Message format
    const messages: Message[] = [
      {
        role: "user",
        content: message,
      },
    ];

    // Enable tools only for chat popup
    const referer = req.headers.referer || "";
    const enableTools = referer.includes("/chat") || referer.includes("ChatPopup");

    // Call chat with appropriate model and tools enabled
    const response = await chat(messages, {
      model: models[modelType] || models.natural,
      enableTools: true,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Error processing chat request" });
  }
}
