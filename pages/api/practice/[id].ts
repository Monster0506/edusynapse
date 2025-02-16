import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const userId = decoded.userId;

    const { id } = req.query;

    if (req.method === 'PUT') {
      const { score, questions, averageEase } = req.body;
      
      console.log('Updating practice attempt:', {
        id,
        score,
        averageEase,
        questionsCount: questions?.length
      });

      const updatedAttempt = await prisma.practiceAttempt.update({
        where: { id: id as string },
        data: {
          score: parseFloat(score),
          averageEase: parseFloat(averageEase),
          questions: questions ? JSON.stringify(questions) : undefined,
          completedAt: new Date()
        }
      });

      console.log('Updated practice attempt:', updatedAttempt);
      return res.status(200).json(updatedAttempt);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error updating practice attempt:', error);
    const isJwtError = error instanceof jwt.JsonWebTokenError;
    return res.status(isJwtError ? 401 : 500).json({ 
      error: isJwtError ? 'Invalid token' : 'Failed to update attempt' 
    });
  }
}