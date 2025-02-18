import { HfInference } from "@huggingface/inference";
import { tools, toolRegistry } from "../constants/tools";
import { models } from "../constants/models";
import {
  Message,
  ChatResponse,
  AdditionalParams,
  JSONSchema,
} from "../interfaces/interfaces";

const client = new HfInference(process.env.HF_API_KEY);

interface ToolCall {
  function: {
    name: string;
    arguments: string;
  };
}

export const chat = async (
  messages: Message[],
  additionalParams: AdditionalParams = {},
  recursionDepth: number = 0,
  maxRecursion: number = 5
): Promise<ChatResponse> => {
  try {
    if (recursionDepth > maxRecursion) {
      console.warn("Max recursion depth reached. Returning current response.");
      return {
        reply: "Max recursion depth reached",
        messages,
      };
    }

    console.log("Formatted Messages Sent:", JSON.stringify(messages, null, 2));

    const response = await client.chatCompletion({
      model: models.fast,
      messages: messages,
      provider: "hf-inference",
      temperature: 0.5,
      top_p: 0.7,
      max_tokens: 200, // Setting max tokens to 2048
      unique_id: Date.now(),
      ...additionalParams,
    });

    console.log("Raw API response:", JSON.stringify(response, null, 2));

    const message = response.choices[0]?.message;
    const accumulatedContent = message?.content?.trim() || "No valid response received.";
    console.log("Extracted Assistant Message:", accumulatedContent);

    let toolCalls: ToolCall[] = [];
    try {
      const parsedContent = JSON.parse(accumulatedContent);
      if (parsedContent.tool_calls) {
        toolCalls = parsedContent.tool_calls;
      }
    } catch (error) {
      console.log("No tool calls detected in response or invalid JSON format.");
    }

    const newMessages: Message[] = [];

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const { name: toolName, arguments: toolArgs } = toolCall.function;
        let parsedArgs;
        try {
          parsedArgs = typeof toolArgs === "string" ? JSON.parse(toolArgs) : toolArgs;
        } catch (parseErr) {
          console.error("Error parsing tool arguments:", parseErr);
          parsedArgs = toolArgs;
        }

        console.log(`\n--- Executing tool: ${toolName} with args:`, parsedArgs);

        let result;
        try {
          result = await toolRegistry[toolName](parsedArgs);
        } catch (toolErr) {
          console.error("Tool execution error:", toolErr);
          result = { error: toolErr.message || "Unknown error in tool." };
        }

        console.log(`Tool result for ${toolName}:`, result);

        const toolMessage: Message = {
          role: "tool",
          content: JSON.stringify(result),
          display: result.display || result.error || "Tool execution complete",
        };
        newMessages.push(toolMessage);
      }

      return chat([...messages, ...newMessages], additionalParams, recursionDepth + 1, maxRecursion);
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: accumulatedContent,
    };
    newMessages.push(assistantMessage);

    return {
      reply: accumulatedContent || "Oops! No response generated. Try adjusting the parameters.",
      messages: [...messages, ...newMessages],
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const chatJSON = async (
  messages: Message[],
  jsonSchema: JSONSchema,
  additionalParams: AdditionalParams = {}
): Promise<ChatResponse> => {
  try {
    const analysisResponse = await chat(messages, additionalParams);
    
    const formatMessage: Message = {
      role: "user",
      content: `Convert this analysis to JSON using the schema:\n${JSON.stringify(jsonSchema)}\n\nAnalysis: ${analysisResponse.reply}`,
    };
    
    const structuredResponse = await client.chatCompletion({
      model: models.fast,
      messages: [formatMessage],
      provider: "hf-inference",
      temperature: 0.6,
      format: jsonSchema,
      stream: false,
      ...additionalParams,
    });
    
    console.log("Raw JSON API response:", JSON.stringify(structuredResponse, null, 2));
    
    const jsonContent = structuredResponse.choices[0]?.message?.content || "{}";
    
    return {
      reply: jsonContent,
      messages: [...messages, { role: "assistant", content: jsonContent }],
    };
  } catch (error) {
    console.error("JSON generation error:", error);
    throw error;
  }
};