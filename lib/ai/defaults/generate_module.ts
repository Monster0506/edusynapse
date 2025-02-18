import { chatJSON } from "../services/ollama";
import type { Message } from "../interfaces/interfaces";
import { models } from "../constants/models";
import prisma from "../../prisma";

export async function generate_modules(
  topic: string,
  context?: string,
  subject?: string,
  userId?: string
): Promise<any> {
  try {
    const messages: Message[] = [
      {
        role: "user",
        content: `Write a comprehensive and in-depth educational module on ${topic} 
                  ${context ? `. Additional context: ${context}` : ""} 
                  ${
                    subject
                      ? `. This module is part of a broader learning path on ${subject}`
                      : ""
                  }.

                  The module should be written in markdown format and cover all aspects of the topic thoroughly. 
                  Ensure the content is conceptually rich, clear, and easy to understand. 
                  Break down complex ideas into simple explanations with practical examples, real-world applications, 
                  and step-by-step breakdowns where applicable. 

                  Use a professional, engaging tone, and avoid overly technical jargon unless necessary for clarity. 
                  There is no need for citations or references. 

                  The output should be clean, well-structured, and error-free.`,
      },
    ];

    const additionalParams = { model: models.fast, tools: [] };
    const schema = {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the module",
        },
        description: {
          type: "string",
          description: "A brief description of what will be covered",
        },
        content: {
          type: "object",
          properties: {
            introduction: {
              type: "string",
              description: "An introduction to the topic. At least 300 words",
            },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              description: "Array of key points to understand",
            },
            explanation: {
              type: "string",
              description: "Main explanation of the concept",
            },
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["code", "math", "text"],
                  },
                  content: {
                    type: "string",
                    description:
                      "The example content. If code, Write only the example code, no backticks, etc. Assume the user can automatically run the code, so do not print an output. If text, just write as plaintext. If math, write with $$latexblock$$ form. For example, \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
                  },
                  explanation: {
                    type: "string",
                    description:
                      "Required explanation for code and math examples, optional for text examples",
                  },
                },
                required: ["type", "content"],
                allOf: [
                  {
                    if: {
                      properties: { type: { enum: ["code", "math"] } },
                      required: ["type"],
                    },
                    then: {
                      required: ["explanation"],
                    },
                  },
                ],
              },
            },
            quiz: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" },
                  },
                  correctAnswer: { type: "integer" },
                  explanation: { type: "string" },
                },
                required: [
                  "question",
                  "options",
                  "correctAnswer",
                  "explanation",
                ],
              },
              description:
                "3-5 multiple choice quiz questions to test understanding of the content. The questions should have no additional context beyond what can be found in the question. Make sure the question only has one possible correct answer.",
            },
          },
          required: [
            "introduction",
            "keyPoints",
            "explanation",
            "examples",
            "quiz",
          ],
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Array of 1-3 tags to categorize the module. Single word only/short phrase. First letter capitalized of each word.",
        },
      },
      required: ["title", "description", "content", "tags"],
    };

//     const demo_response = {
//       reply: `# The use of Python for Data Science
// ## Table of Contents
// 1. [Introduction](#Introduction)
// 2. [What is Data Science?](#What-is-Data-Science?)
// 3. [Why Python?](#Why-Python?)
// 4. [Setting up Python for Data Science](#Setting-up-Python-for-Data-Science)
// 5. [Python Libraries for Data Science](#Python-Libraries-for-Data-Science)
// 6. [Conclusion](#Conclusion)
// 7. [Quiz](#Quiz)
// ## Introduction
// `,
//     };
//     return {
//       ...demo_response,
//       content: JSON.parse(demo_response.reply),
//     };
    const response = await chatJSON(messages, schema, additionalParams);
      const reply = JSON.parse(response.reply);
      reply.content.text = response.analysis;
    
      const savedModule = await prisma.aIModule.create({
        data: {
          title: reply.title,
          description: reply.description,
          content: reply.content,
          tags: reply.tags,
          status: "ACTIVE",
          userId: userId || null,
        },
      });
    
      return {
        ...savedModule,
        userId // Include userId in the returned data
      };
    } catch (error) {
      throw error;
    }
  // } catch (error) {
  //   console.error("Error generating module:", error);
  //   throw error;
  // }
}
