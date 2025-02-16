import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create a new message
    try {
      const { chatId, content, role, display } = req.body
      if (!chatId || !content || !role) {
        return res.status(400).json({ error: 'Chat ID, content, and role are required' })
      }

      const message = await prisma.aIChatMessage.create({
        data: {
          chatId,
          content,
          role,
          display: display || null // Explicitly handle display field
        },
      })

      return res.status(201).json(message)
    } catch (error) {
      console.error('Error creating message:', error)
      return res.status(500).json({ error: 'Failed to create message' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
