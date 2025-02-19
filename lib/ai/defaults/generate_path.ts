import { chatJSON } from "../services/ollama";
import type { Message } from "../interfaces/interfaces";
import { models } from "../constants/models";

export async function generate_path(topic: string): Promise<any> {
  const messages: Message[] = [
    {
      role: "user",
      content: `Generate a learning path for: ${topic}`,
    },
  ];

  const additionalParams = { 
    model: models.fast, 
    options: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    enableTools: false // Explicitly disable tools
  };

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the module",
        },
        description: {
          type: "string",
          description: "A brief description of what will be covered",
        },
        objectives: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Learning objectives for this module"
        }
      },
      required: ["title", "description"],
    },
  };

  const response = await chatJSON(messages, schema, additionalParams);
  console.log("[AI] Generated path:", response.reply)
  
  // Parse the response and add IDs to each module
  const modules = JSON.parse(response.reply);
  return modules.map((module: any, index: number) => ({
    ...module,
    id: `module-${index + 1}`,
    status: "NOT_STARTED",
    objectives: module.objectives || []
  }));
}