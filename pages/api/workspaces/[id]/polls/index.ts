import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const { id } = req.query

    if (req.method === "GET") {
      const polls = await prisma.livePoll.findMany({
        where: { workspaceId: id as string },
        include: { votes: true },
      })

      res.status(200).json(
        polls.map((poll) => ({
          id: poll.id,
          question: poll.question,
          options: JSON.parse(poll.options as string),
          votes: poll.votes.reduce(
            (acc, vote) => {
              acc[vote.option] = (acc[vote.option] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        })),
      )
    } else if (req.method === "POST") {
      const { question, options } = req.body

      const newPoll = await prisma.livePoll.create({
        data: {
          question,
          options: JSON.stringify(options),
          workspaceId: id as string,
        },
      })

      res.status(201).json(newPoll)
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Live polls error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

