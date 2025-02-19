import { chatJSON } from "../services/ollama";
import type { Message } from "../interfaces/interfaces";
import { models } from "../constants/models";

interface ModuleInfo {
  title: string;
  description: string | null;
  content: {
    keyPoints?: string[];
  };
  tags: string[];
}

interface PracticeQuestion {
  question: string;
  type: "multiple_choice" | "short_answer" | "coding_problem";
  options?: string[];
}

export async function generate_practice(
  module: ModuleInfo,
): Promise<PracticeQuestion[]> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a practice question generator. Follow these rules exactly:

1. Create a mix of question types:
   - multiple_choice: MUST have exactly 4 options
   - short_answer: direct text response
   - coding_problem: code implementation

If a coding_problem is not applicable, don't worry about asking a coding question.

2. For multiple_choice questions:
   - ALWAYS provide exactly 4 options
   - Options must be distinct and clear
   - Make options plausible
   - Order options randomly

3. Keep questions clear and focused on testing understanding`,
    },
    {
      role: "user",
      content: `Generate practice questions for the module titled "${module.title}". 
                Module description: ${module.description}
                Tags: ${module.tags.join(", ")}
                
                Create at least 3 questions focusing on these key areas: ${module.content.keyPoints?.join(", ") || "general concepts"}.
                Make sure to include at least one multiple choice question and one short answer question.`,
    },
  ];

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question text",
        },
        type: {
          type: "string",
          enum: ["multiple_choice", "short_answer", "coding_problem"],
          description: "The type of question",
        },
        options: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4,
          description:
            "Required for multiple_choice questions, must have exactly 4 options",
        },
      },
      required: ["question", "type"],
      oneOf: [
        {
          properties: {
            type: { enum: ["multiple_choice"] },
            options: { type: "array" },
          },
          required: ["options"],
        },
        {
          properties: {
            type: { enum: ["short_answer", "coding_problem"] },
          },
        },
      ],
    },
    minItems: 3,
  };

  const additionalParams = {
    model: models.fast,
    tools: [],
    options: {
      temperature: 0.7,
    },
  };

  const response = await chatJSON(messages, schema, additionalParams);
  console.log("[AI] Generated practice questions:", response.reply);

  const questions: PracticeQuestion[] = JSON.parse(response.reply);

  // Only validate that multiple choice questions have options
  const validQuestions = questions.map((q) => {
    if (
      q.type === "multiple_choice" &&
      (!q.options || q.options.length !== 4)
    ) {
      throw new Error("Multiple choice question must have exactly 4 options");
    }
    return q;
  });

  return validQuestions;
}