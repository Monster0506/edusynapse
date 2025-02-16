import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// Define type for module content check
type ModuleContent = {
  explanation?: string;
  introduction?: string;
};

// Enhanced content validation with TypeScript guards
function hasContent(content: unknown): content is ModuleContent {
  if (!content || typeof content !== "object") return false;

  const safeContent = content as ModuleContent;
  return (
    (typeof safeContent.explanation === "string" &&
      safeContent.explanation.trim().length > 0) ||
    (typeof safeContent.introduction === "string" &&
      safeContent.introduction.trim().length > 0)
  );
}

// Response type for better type safety
type ModuleResponse = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  ease: number;
  author: {
    name: string | null;
    email: string | null;
  } | null;
  practiceAttempts: {
    averageEase: number;
  } | null;
};

type ErrorResponse = {
  message: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModuleResponse[] | ErrorResponse>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const token = req.headers.authorization?.split(" ")[1]
    const { sort, limit } = req.query

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Verify JWT with proper type checking
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const userId = decoded.userId;

    // Get modules that are either:
    // 1. Created by this user (userId matches)
    // 2. Public modules (userId is null and status is ACTIVE)
    // 3. Part of a learning path that belongs to this user
    const whereClause: any = {
      AND: [
        {
          OR: [
            { content: { path: ["explanation"], not: { equals: "" } } },
            { content: { path: ["introduction"], not: { equals: "" } } },
          ],
        },
        {
          OR: [
            { userId }, // User's own modules
            {
              AND: [{ userId: null }, { status: "ACTIVE" }],
            }, // Public modules
            {
              learningPathItems: {
                some: {
                  learningPath: {
                    userId,
                  },
                },
              },
            },
          ],
        },
      ],
    };

    // Validate and parse query parameters
    const orderBy =
      sort === "lastOpened" ? { updatedAt: "desc" } : { createdAt: "desc" };
    const take = limit ? Math.min(parseInt(limit as string), 100) : undefined;

    // Fetch modules with proper typing
    const modules = await prisma.aIModule.findMany({
      where: whereClause,
      orderBy,
      take,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        PracticeAttempts: {
          orderBy: {
            averageEase: 'asc'
          },
          take: 1,
          select: {
            averageEase: true
          }
        }
      },
    });

    // Filter and transform response with type safety
    const validModules = modules.filter((module) => hasContent(module.content));
    console.log(modules.map((module)=>module.PracticeAttempts))
    const formattedModules: ModuleResponse[] = validModules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      updatedAt: module.updatedAt.toISOString(),
      ease: module.PracticeAttempts[0]?.averageEase ?? 2.5,
      author: module.user
        ? {
            name: module.user.name,
            email: module.user.email,
          }
        : null,
      practiceAttempts: module.PracticeAttempts[0] ?? null,
    }));

    return res.status(200).json(formattedModules);
  } catch (error) {
    console.error("API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isJwtError = error instanceof jwt.JsonWebTokenError;

    return res.status(isJwtError ? 401 : 500).json({
      message: isJwtError ? "Invalid token" : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: errorMessage }),
    });
  }
}
