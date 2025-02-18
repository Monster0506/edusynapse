import { chatJSON } from "../services/ollama";
import type { Message } from "../interfaces/interfaces";
import { models } from "../constants/models";

interface GradeRequest {
  question: string;
  type: "multiple_choice" | "short_answer" | "coding_problem";
  options?: string[];
  userAnswer: string;
}

interface GradeResponse {
  score: number;
  feedback: string;
}

export async function grade_practice(
  request: GradeRequest
): Promise<GradeResponse> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a practice question grader. Grade the student's answer on a scale from 0-2:
      0: Incorrect or completely off-track
      1: Partially correct or on the right track
      2: Completely correct

      For multiple choice questions, be strict - only give 2 points for the exactly correct answer. No partial credit
      For short answer and coding questions, use your judgment to award partial credit. Try to be lenient when possible.
      When judging short response questions, make sure to award full credit for answers that are correct, but may be phrased differently than expected.
      If information is ommitted in the answer, use your judgment to determine if the answer deserves full credit, or just partial.
      
      Provide brief, constructive feedback explaining the score.`,
    },
    {
      role: "user",
      content: `Grade this answer:
      Question: ${request.question}
      Type: ${request.type}
      ${request.options ? `Options: ${JSON.stringify(request.options)}` : ""}
      Student's Answer: ${request.userAnswer}`,
    },
  ];

  const schema = {
    type: "object",
    properties: {
      score: {
        type: "number",
        enum: [0, 1, 2],
        description: "Score from 0-2",
      },
      feedback: {
        type: "string",
        description: "Brief explanation of the score",
      },
    },
    required: ["score", "feedback"],
  };

  const additionalParams = {
    model: models.fast,
    tools: [],
    options: {
      temperature: 0.3, // Lower temperature for more consistent grading
    },
  };

  const demo_reply = `
    {
score: 2,
feedback: "The answer is correct. Well done!"
}
    `;
  return JSON.parse(demo_reply);
  // const response = await chatJSON(messages, schema, additionalParams);
  // return JSON.parse(response.reply);
}
