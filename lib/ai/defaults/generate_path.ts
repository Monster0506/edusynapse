import { chatJSON } from "../services/ollama";
import type { Message } from "../interfaces/interfaces";
import { models } from "../constants/models";

export async function generate_path(topic: string): Promise<any> {
  const messages: Message[] = [
    {
      role: "user",
      content: `Generate a precice learning path for the topic ${topic}. It should have at least 6 modules, but no more than 20. Try to break it down into smaller sub-topics, each progressive. Don't aim for 20, just consider it a maximum. Aim to be around 10-12`,
    },
  ];
  const additionalParams = { model: models.fast, tools: [] };

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