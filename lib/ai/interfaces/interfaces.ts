// Define types for the message objects
export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  display?: string; // Optional field for tool responses
}

// Define types for additional parameters
export interface AdditionalParams {
  model?: string;
  stream?: boolean;
  tools?: Array<{ name?: string; description?: string; parameters?: object }>;
}

// Define types for the chat function response
export interface ChatResponse {
  reply: string;
  messages: Message[];
  analysis?: string;
}

// Define types for the JSON schema
export interface JSONSchema {
  type: string;
  items?: {
    type: string;
    properties: Record<string, { type: string; description?: string }>;
    description?: string;
    required?: string[];
  };
  properties?: Record<string, { type: string; description?: string }>;
  description?: string;
  required?: string[];
}
