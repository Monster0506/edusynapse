import { HfInference } from "@huggingface/inference";
import { tools, toolRegistry } from "../constants/tools";
import { models } from "../constants/models";
import {
  Message,
  ChatResponse,
  AdditionalParams,
  JSONSchema,
} from "../interfaces/interfaces";

// Initialize Hugging Face client
const client = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Define types for tool calls
interface ToolCall {
  function: {
    name: string;
    arguments: string;
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
  try {
    const chatCompletion = await client.chatCompletion({
      model: "Qwen/Qwen2.5-3B",
      messages: messages,
      max_tokens: additionalParams.max_tokens || 500,
      provider: "hf-inference",
    });

    const response = chatCompletion.choices[0].message;
    const newMessages: Message[] = [];

    if (response.content) {
      newMessages.push({
        role: "assistant",
        content: response.content,
      });
    }

    // Note: Tool calls implementation would need to be adapted for HF API
    // Current HF chat models may not support function calling directly

    return {
      reply: response.content || "",
      messages: [...messages, ...newMessages],
    };
  } catch (error) {
    console.error("Error in chat completion:", error);
    throw error;
  }
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

  const structuredResponse = await client.chatCompletion({
    model: "Qwen/Qwen2.5-3B",
    messages: [formatMessage],
    max_tokens: 500,
    provider: "hf-inference",
  });

  const response = structuredResponse.choices[0].message;
  messages.push(response);

  return {
    reply: response.content,
    messages: messages,
    analysis: analysisResponse.reply,
  };
};

