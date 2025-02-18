import MessagesHandler from "../handlers/messagesHandler";
import { chat as ollamaChat } from "../services/ollama";
import { system } from "../constants/systemPrompt";
import { Message } from "../interfaces/interfaces";

// Initialize system message only if messages are empty
if (MessagesHandler.getMessages().length === 0) {
  MessagesHandler.addMessage({
    content: system,
    role: "system",
  });
}

export async function chat(prompt: string, additionalParams = {}) {
  additionalParams = { ...additionalParams };
  const userMessage: Message = { role: "user", content: prompt };

  // Get existing messages for context but don't save them to DB
  const messages = MessagesHandler.getMessages();

  // const response = await ollamaChat(
  //   [...messages, userMessage],
  //   additionalParams,
  // );
  const response = {
    reply: "This is a demo reply",
    messages: [
      {
        role: "assistant",
        content: "This is a demo reply",
      },
    ],
    analysis: "This is a demo analysis",
  };

  // Collect all new messages
  const newMessages: Message[] = [];

  // Add assistant message if present
  if (response.reply?.trim()) {
    const assistantMessage: Message = {
      role: "assistant",
      content: response.reply,
    };
    newMessages.push(assistantMessage);
  }

  // Add any tool messages
  const toolMessages =
    response.messages?.filter((msg) => msg.role === "tool") || [];
  if (toolMessages.length > 0) {
    newMessages.push(...toolMessages);
  }

  return {
    message: response.reply,
    messages: newMessages, // Only return new messages
    tools: toolMessages,
  };
}
