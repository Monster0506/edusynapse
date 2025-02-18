import { chat } from "../services/ollama";
import { models } from "../constants/models";
import { Message } from "../interfaces/interfaces";

export async function generateWelcome() {
  console.log("Generating Welcome Message");
  const messages: Message[] = [
    {
      role: "system",
      content:
        "Generate a short, friendly welcome message for a user logging into an educational platform. Be super excited, but don't ask any questions",
    },
  ];

  return "Hey there! Welcome to the coolest learning platform ever. We're super excited to have you on board! 🎉 Get ready to dive into some amazing content and boost your skills. Let's make learning awesome together! 🚀";
  // const response = await chat(messages, { model: models.fast, tools: [] });
  // return response.reply;
}
