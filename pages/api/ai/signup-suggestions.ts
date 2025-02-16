import type { NextApiRequest, NextApiResponse } from "next"
import { generateResponse } from "@/lib/ollama"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { role, interests } = req.body

  try {
    const prompt = `As an AI assistant for an educational platform, provide a personalized suggestion for a ${role} interested in ${interests.join(
      ", ",
    )}. The suggestion should be about potential learning paths or resources they might find useful.`
    const message = await generateResponse(prompt, "think")
    res.status(200).json({ message })
  } catch (error) {
    console.error("Error generating signup suggestions:", error)
    res.status(500).json({ message: "An error occurred while generating signup suggestions." })
  }
}

