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

    const { id, pollId } = req.query

    if (req.method === "POST") {
      const { option } = req.body

      const vote = await prisma.pollVote.create({
        data: {
          livePoolId: pollId as string,
          userId,
          option,
        },
      })

      const updatedPoll = await prisma.livePoll.findUnique({
        where: { id: pollId as string },
        include: { votes: true },
      })

      if (!updatedPoll) {
        return res.status(404).json({ message: "Poll not found" })
      }

      res.status(200).json({
        id: updatedPoll.id,
        question: updatedPoll.question,
        options: JSON.parse(updatedPoll.options as string),
        votes: updatedPoll.votes.reduce(
          (acc, vote) => {
            acc[vote.option] = (acc[vote.option] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      })
    } else {
      res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Poll vote error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

