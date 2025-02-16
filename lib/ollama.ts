import fetch from "node-fetch"
import { models } from "./ai/constants/models"

export type ModelType = keyof typeof models

interface OllamaRequestBody {
  model: string
  prompt: string
  stream?: boolean
}

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

export async function generateResponse(prompt: string, modelType: ModelType): Promise<string> {
  const model = models[modelType]
  const body: OllamaRequestBody = {
    model,
    prompt,
    stream: false,
  }

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data: OllamaResponse = await response.json()
  return data.response
}

