import { chat } from "../services/ollama";
import { models } from "../constants/models";
import { Message } from "../interfaces/interfaces";

export async function generateWelcome() {
  console.log("Generating Welcome Message");
  const messages: Message[] = [
    {
      role: "system",
      content:
        "Generate a short, friendly welcome message for a user logging into an educational platform named EduSynapse. Be super excited, but don't ask any questions",
    },
  ];

  const response = await chat(messages, { model: models.fast, tools: [] });
  return response.reply;
}
