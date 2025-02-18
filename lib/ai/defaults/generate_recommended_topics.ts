import { Message, JSONSchema } from "../interfaces/interfaces";
import { chatJSON } from "../services/ollama";

export async function generateRecommendedTopics(interests: string[], amount: number) {
  console.log("Generating Recommended Topics", interests);
  const messages: Message[] = [
    {
      role: "system",
      content:
        `You are a recommendation engine for an educational platform. Given a user's interests, generate ${amount || 3} recommended learning topics.`,
    },
    {
      role: "user",
      content: `My interests include ${interests.join(", ")}`,
    },
  ];
  const jsonSchema: JSONSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the recommended topic",
        },
        description: {
          type: "string",
          description:
            "A brief description of the recommended topic. One sentence",
        },
        difficulty: {
          type: "number",
          description: "a difficulty rating from 1 to 10",
        },
        duration: {
          type: "string",
          description:
            "A precise, human-readable duration for the topic. Should be somewhere between 10 minutes to 40 minutes",
        },
      },
      required: ["title", "description", "difficulty", "duration"],
    },
  };

  const response = await chatJSON(messages, jsonSchema, {tools: []});
  return response.reply;
}