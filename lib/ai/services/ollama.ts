import ollama from "ollama";
import { tools, toolRegistry } from "../constants/tools";
import { models } from "../constants/models";
import {
  Message,
  ChatResponse,
  AdditionalParams,
  JSONSchema,
} from "../interfaces/interfaces";

// Define types for tool calls
interface ToolCall {
  function: {
    name: string;
    arguments: string; // Arguments are typically a JSON string
  };
}

/**
 * Orchestrates a conversation with an LLM, automatically handling tool execution
 * and multi-step interactions. Manages message history and tool recursion.
 *
 * @async
 * @function chat
 * @param {Array<Message>} messages - Conversation history in OpenAI format
 * @param {AdditionalParams} [additionalParams={}] - Additional parameters for Ollama API
 * @returns {Promise<ChatResponse>} {reply: string, messages: Array<Message>}
 *
 * @example
 * const conversation = await chat([
 *   { role: 'system', content: 'You are helpful' },
 *   { role: 'user', content: 'Calculate 2+2' }
 * ]);
 * // calls tool `calculator` with expression `2+2`
 * // output: `4`
 */
export const chat = async (
  messages: Message[],
  additionalParams: AdditionalParams = {},
): Promise<ChatResponse> => {
  const response = await ollama.chat({
    messages: messages,
    stream: true,
    model: models.fast, // Default model
    tools: tools,
    ...additionalParams,
  });

  let accumulatedContent = "";
  const toolCalls: ToolCall[] = [];
  const newMessages: Message[] = [];

  // Process stream chunks
  for await (const chunk of response) {
    accumulatedContent += chunk.message?.content || "";

    if (chunk.message?.tool_calls) {
      toolCalls.push(...chunk.message.tool_calls);
    }
  }

  // Process tool calls
  if (toolCalls.length > 0) {
    for (const toolCall of toolCalls) {
      const { name: toolName, arguments: toolArgs } = toolCall.function;

      let parsedArgs;
      try {
        // Handle both string and object arguments
        parsedArgs =
          typeof toolArgs === "string" ? JSON.parse(toolArgs) : toolArgs;
        console.log("Parsed tool arguments:", parsedArgs);
      } catch (error) {
        console.error("Error parsing tool arguments:", toolArgs, error);
        parsedArgs = toolArgs; // Fallback to raw data
      }

      console.log("Executing tool:", toolName, "Args:", parsedArgs);
      const result = await toolRegistry[toolName](parsedArgs);
      console.log("Tool Result:", result);

      const toolMessage: Message = {
        role: "tool",
        content:
          result.result?.toString() || result.error?.toString() || "No result",
        display: result.display || result.error || "No display content",
      };
      newMessages.push(toolMessage);
    }

    // Recursively call `chat` with updated messages (including tool responses)
    return chat([...messages, ...newMessages], additionalParams);
  }

  // Add assistant's response ONLY in newMessages
  if (accumulatedContent.trim()) {
    newMessages.push({
      role: "assistant",
      content: accumulatedContent,
    });
  }

  console.log("Final Response:", accumulatedContent);

  return { reply: accumulatedContent, messages: [...messages, ...newMessages] };
};

/**
 * Generates structured JSON output from natural language input using a two-stage
 * model pipeline. First model produces analysis, second enforces JSON schema.
 *
 * @async
 * @function chatJSON
 * @param {Array<Message>} messages - Initial conversation messages
 * @param {JSONSchema} jsonSchema - JSON Schema definition for output validation
 * @returns {Promise<ChatResponse>} {reply: string, messages: Array<Message>}
 *
 * @example
 * const schema = {
 *   type: "object",
 *   properties: { age: { type: "integer" } },
 *   required: ["age"]
 * };
 * const data = await chatJSON([{ role: 'user', content: 'John is 35' }], schema);
 * // output: { "age": 35 }
 */
export const chatJSON = async (
  messages: Message[],
  jsonSchema: JSONSchema,
  additionalParams: AdditionalParams = {},
): Promise<ChatResponse> => {
  // Stage 1: Large model generates natural language analysis
  const analysisResponse = await chat(messages, additionalParams);

  // Stage 2: Small model formats with JSON schema
  const formatMessage: Message = {
    role: "user",
    content: `Convert this analysis to JSON using the schema:\n${JSON.stringify(
      jsonSchema,
    )}\n\nAnalysis: ${analysisResponse.reply}`,
  };

  const structuredResponse = await ollama.chat({
    messages: [formatMessage],
    model: models.fast,
    stream: false,
    format: jsonSchema,
    options: {
      temperature: 0.6,
    },
    ...additionalParams,
  });

  messages.push(structuredResponse.message);

  return {
    reply: structuredResponse.message.content,
    messages: messages,
    analysis: analysisResponse.reply,
  };
};