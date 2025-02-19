import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { tools, toolRegistry } from "../constants/tools";
// import { models } from "../constants/models";
import {
  Message,
  ChatResponse,
  AdditionalParams,
  JSONSchema,
} from "../interfaces/interfaces";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
 * @param {AdditionalParams} [additionalParams={}] - Additional parameters for Gemini API
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
  // Extract system messages and convert remaining messages to Gemini format
  const systemMessages = messages.filter(msg => msg.role === "system");
  const conversationMessages = messages.filter(msg => msg.role !== "system").map(msg => ({
    role: msg.role === "assistant" ? "model" : msg.role,
    parts: [{ text: msg.content }]
  }));

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    ...additionalParams,
    systemInstruction: systemMessages.length > 0 ? {
      parts: systemMessages.map(msg => ({ text: msg.content }))
    } : undefined
  });

  // Convert our tools array to Gemini's function declarations format
  const functionDeclarations = tools.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters
  }));

  // Configure function calling
  const generationConfig = {
    temperature: additionalParams.options?.temperature || 0.7,
    topK: additionalParams.options?.topK || 40,
    topP: additionalParams.options?.topP || 0.95,
    maxOutputTokens: additionalParams.options?.maxOutputTokens || 2048,
  };

  const result = await model.generateContent({
    contents: conversationMessages,
    generationConfig,
    tools: functionDeclarations.length > 0 ? {
      function_declarations: functionDeclarations
    } : undefined,
    tool_config: functionDeclarations.length > 0 ? {
      function_calling_config: {
        mode: "AUTO",
      }
    } : undefined
  });

  const response = await result.response;
  const newMessages: Message[] = [];
  let text = "";

  // Process function calls if present
  const functionCalls = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
  console.log("Function calls:", functionCalls);
  if (functionCalls) {
    const toolResults: string[] = [];
    
    const toolCall: ToolCall = {
      function: {
        name: functionCalls.name,
        arguments: JSON.stringify(functionCalls.args)
      }
    };

    // Execute tool
    const tool = toolRegistry[functionCalls.name];
    if (tool) {
      try {
        const args = functionCalls.args;
        console.log("Executing tool:", functionCalls.name, "Args:", args);
        const result = await tool(args);
        console.log("Tool Result:", result);

        const toolMessage: Message = {
          role: "tool",
          content: result.result?.toString() || result.error?.toString() || "No result",
          display: result.display || result.error || "No display content",
        };
        newMessages.push(toolMessage);
        toolResults.push(result.display || result.result?.toString() || "");
      } catch (error) {
        console.error("Error executing tool:", error);
        toolResults.push(`Error executing tool ${functionCalls.name}: ${error.message}`);
      }
    }

    // Add a final message with all tool results
    text = toolResults.join("\n");
  } else {
    text = response.text();
  }

  if (text.trim()) {
    newMessages.push({
      role: "assistant",
      content: text,
    });
  }

  return { reply: text, messages: [...messages, ...newMessages] };
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
  const analysisResponse = await chat(messages, {
    ...additionalParams,
    model: "gemini-2.0-flash", // Use the more capable model for analysis
  });

  // Stage 2: Format with JSON schema
  const formatMessage: Message = {
    role: "user",
    content: `Convert this analysis to JSON using the schema:\n${JSON.stringify(
      jsonSchema,
    )}\n\nAnalysis: ${analysisResponse.reply}`,
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Use same model for JSON formatting since we don't have a smaller one yet
    generationConfig: {
      temperature: 0.1, // Lower temperature for more precise JSON formatting
      responseMimeType: "application/json",
    },
  });

  // Convert the schema to Gemini's format
  const functionDeclarations = [{
    name: "format_json",
    description: "Format the analysis as JSON according to the schema",
    parameters: {
      type: "object",
      ...jsonSchema,
    }
  }];

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: formatMessage.content }] }],
    generationConfig: {
      temperature: 0.1,
    },
    tools: {
      function_declarations: functionDeclarations
    },
    tool_config: {
      function_calling_config: {
        mode: "FORCE",
        allowed_function_names: ["format_json"]
      }
    }
  });

  const response = await result.response;
  let jsonResponse;

  // Handle function call response
  if (response.candidates?.[0]?.functionCalls) {
    const call = response.candidates[0].functionCalls[0];
    try {
      jsonResponse = JSON.parse(call.args);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Generated response is not valid JSON");
    }
  } else {
    // Fallback to parsing text response if no function call
    try {
      const text = response.text();
      jsonResponse = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Generated response is not valid JSON");
    }
  }

  messages.push({
    role: "assistant",
    content: JSON.stringify(jsonResponse),
  });

  return {
    reply: JSON.stringify(jsonResponse),
    messages: messages,
    analysis: analysisResponse.reply, // Include the original analysis
  };
};