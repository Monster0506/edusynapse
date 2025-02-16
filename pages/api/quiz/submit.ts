import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const { quizAttemptId, answers } = req.body

    const quizAttempt = await prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
      include: { contentItem: true },
    })

    if (!quizAttempt || quizAttempt.userId !== userId) {
      return res.status(404).json({ message: "Quiz attempt not found" })
    }

    const questions = JSON.parse(quizAttempt.contentItem.content)
    const score = calculateScore(questions, answers)

    const updatedQuizAttempt = await prisma.quizAttempt.update({
      where: { id: quizAttemptId },
      data: {
        score,
        completedAt: new Date(),
        answers: answers,
      },
    })

    res.status(200).json({ score: updatedQuizAttempt.score, feedback: generateFeedback(questions, answers) })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

function calculateScore(questions: any[], answers: Record<string, string>): number {
  let correctAnswers = 0
  questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      correctAnswers++
    }
  })
  return (correctAnswers / questions.length) * 100
}

function generateFeedback(questions: any[], answers: Record<string, string>): any[] {
  return questions.map((question, index) => ({
    question: question.question,
    userAnswer: answers[index],
    correctAnswer: question.correctAnswer,
    isCorrect: question.correctAnswer === answers[index],
  }))
}

