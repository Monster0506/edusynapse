import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    if (req.method === "GET") {
      const learningPaths = await prisma.learningPath.findMany({
        where: { userId },
        include: {
          aiModuleItems: {
            include: {
              aiModule: true,
            },
            orderBy: {
              order: "asc",
            },
            where: {
              aiModule: {
                content: {
                  not: null
                }
              }
            }
          },
        },
      });
      return res.status(200).json(learningPaths);
    }

    if (req.method === "POST") {
      const { title, description, content, status, visibility } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Missing required fields: title and content" });
      }

      try {
        const result = await prisma.$transaction(async (tx) => {
          const learningPath = await tx.learningPath.create({
            data: {
              title,
              description,
              content,
              userId
            }
          });

          const modulePromises = content.modules
            .filter((moduleData: any) => moduleData.content || moduleData.objectives?.length > 0)
            .map(async (moduleData: any, index: number) => {
              const aiModule = await tx.aIModule.create({
                data: {
                  title: moduleData.title,
                  description: moduleData.description,
                  content: {
                    introduction: moduleData.content || "",
                    keyPoints: moduleData.objectives || [],
                    explanation: "",
                    examples: [],
                    quiz: []
                  },
                  status: "ACTIVE",
                  userId: userId,
                  tags: [],
                  difficulty: "BEGINNER"
                }
              });

              await tx.aIModuleLearningPathItem.create({
                data: {
                  order: index,
                  learningPathId: learningPath.id,
                  aiModuleId: aiModule.id,
                  confidence: 0
                }
              });

              return aiModule;
            });

          const createdModules = await Promise.all(modulePromises);

          return await tx.learningPath.findUnique({
            where: { id: learningPath.id },
            include: {
              aiModuleItems: {
                include: {
                  aiModule: true
                },
                orderBy: {
                  order: "asc"
                },
                where: {
                  aiModule: {
                    content: {
                      not: null
                    }
                  }
                }
              }
            }
          });
        });

        return res.status(201).json(result);
      } catch (error) {
        console.error("Prisma error creating learning path:", error);
        return res.status(500).json({
          message: "Failed to create learning path in database",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
