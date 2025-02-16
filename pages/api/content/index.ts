import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Content API called with query:", req.query)
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const { difficulty, format, search } = req.query

    console.log("Prisma query:", {
      difficulty: difficulty as string | undefined,
      type: format as string | undefined,
      OR: search
        ? [
            { title: { contains: search as string, mode: "insensitive" } },
            { description: { contains: search as string, mode: "insensitive" } },
          ]
        : undefined,
    })

    const contentItems = await prisma.contentItem.findMany({
      where: {
        difficulty: difficulty as string | undefined,
        type: format as string | undefined,
        OR: search
          ? [
              { title: { contains: search as string, mode: "insensitive" } },
              { description: { contains: search as string, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        bookmarks: {
          where: {
            userId: userId,
          },
        },
      },
    })

    res.status(200).json(contentItems)
  } catch (error) {
    console.error("Error fetching content:", error)
    res
      .status(500)
      .json({ message: "Something went wrong", error: error instanceof Error ? error.message : String(error) })
  }
}

