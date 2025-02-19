import { models } from "../constants/models";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "../constants/consts";
import { fileStorage } from "../handlers/fileUploadHandler";

// Define types for file-related operations
interface FileId {
  file_id: string;
}

interface FileReadResult {
  result?: string;
  display?: string;
  error?: string;
}

// Define types for the search function
interface SearchResult {
  query: string;
}

// Define types for the calculator function
interface CalculatorInput {
  expression: string;
}

interface CalculatorResult {
  result: string;
  display: string;
}

// Define types for the think function
interface ThinkInput {
  question: string;
}

interface ThinkResult {
  result: string;
  display: string;
}

// Define types for tool functions
type ToolFunction = (input: any) => Promise<any> | any;

// Define types for the tools array
interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, { type: string; description?: string }>;
      required?: string[];
    };
  };
}

/**
 * Simulates a search operation (currently returns a placeholder response).
 *
 * @function search
 * @param {SearchResult} searchresult - The search query
 * @returns {string} A placeholder response
 */
const search = (searchresult: SearchResult): string => {
  console.log("Called search", searchresult);
  return "The web is offline.";
};

/**
 * Evaluates a mathematical expression using JavaScript syntax.
 *
 * @function calculator
 * @param {CalculatorInput} expression - The expression to evaluate
 * @returns {CalculatorResult | string} The result of the evaluation or an error message
 */
const calculator = (expression: CalculatorInput): CalculatorResult | string => {
  console.log("Called calculator", expression);
  const evaluate = expression.expression;
  try {
    const cleanExpression = evaluate.trim();
    if (!cleanExpression) {
      return "Invalid expression. Must be a JavaScript-evaluatable expression";
    }

    const result = Function('"use strict";return (' + cleanExpression + ")")();

    if (typeof result !== "number" || !isFinite(result)) {
      return "Invalid expression. Must be a JavaScript-evaluatable expression";
    }

    return {
      result: result.toString(),
      display: "[calculator] " + cleanExpression + " = " + result,
    };
  } catch (error) {
    return "Invalid expression. Must be a JavaScript-evaluatable expression";
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Passes a complex problem to a more advanced LLM for deeper analysis.
 *
 * @async
 * @function think
 * @param {ThinkInput} input - The complex problem requiring deep analysis
 * @returns {Promise<ThinkResult>} The LLM's response
 */
const think = async (input: ThinkInput): Promise<ThinkResult> => {
  console.log("Called think", input);
  
  const model = genAI.getGenerativeModel({
    model: models.think,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    }
  });

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: `Analyze this deeply: ${input.question}` }] }
    ]
  });

  const response = await result.response;
  const text = response.text();

  return {
    result: text,
    display: "[think] " + text,
  };
};

async function fileRead(input: FileId): Promise<FileReadResult> {
  console.log('fileread tool called with input:', input);

  try {
    if (!input || !input.file_id) {
      console.error('fileread: No file_id provided');
      return {
        error: "No file ID provided",
        result: "Missing file ID",
        display: "❌ No file ID provided",
      };
    }

    console.log('Attempting to get file with ID:', input.file_id);
    const file = fileStorage.getFile(input.file_id);

    if (!file) {
      console.error('fileread: File not found for ID:', input.file_id);
      const errorMsg = "File not found";
      return {
        error: errorMsg,
        result: errorMsg,
        display: "❌ " + errorMsg,
      };
    }

    console.log('File found:', { name: file.name, type: file.type, contentLength: file.content.length });
    const content = file.content;

    // Create a simple display message
    const display = `📄 Successfully read file: ${file.name} (${file.type})`;

    const result = {
      result: content,
      display: display,
    };

    console.log('fileread: Returning result with content length:', content.length);
    return result;
  } catch (error) {
    const errorMsg = "Failed to read file";
    console.error("Error in fileread tool:", error);
    return {
      error: errorMsg,
      result: errorMsg,
      display: "❌ " + errorMsg,
    };
  }
}

// Define tool functions

/**
 * List of available tools for the LLM to use.
 */
export const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "fileread",
      description: "Reads and returns the content of a text-based file. Use this to read and analyze uploaded text files.",
      parameters: {
        type: "object",
        properties: {
          file_id: {
            type: "string",
            description: "The ID of the file to read",
          },
        },
        required: ["file_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Evaluates mathematical expressions",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to evaluate",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "think",
      description: "Analyzes complex problems using advanced LLM",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The complex problem to analyze",
          },
        },
        required: ["question"],
      },
    },
  },
];

/**
 * Registry of available tools for the LLM to use.
 */
export const toolRegistry: Record<string, ToolFunction> = {
  // search,
  calculator,
  think,
  fileread: fileRead,
};
