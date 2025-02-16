import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      details: 'No authorization token provided'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.decode(token) as { userId: string } | null

    if (!payload || !payload.userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'Invalid token - missing user ID'
      })
    }

    const userId = payload.userId

    if (req.method === 'POST') {
      try {
        const { title } = req.body
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          return res.status(404).json({
            error: 'User not found',
            details: 'User does not exist in database'
          })
        }

        const chat = await prisma.aIChat.create({
          data: {
            title: title || 'New Chat',
            userId: userId,
          },
        })
        
        return res.status(201).json(chat)
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to create chat',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    } else if (req.method === 'GET') {
      try {
        const { chatId } = req.query
        
        if (chatId) {
          const chat = await prisma.aIChat.findUnique({
            where: { 
              id: chatId as string,
              userId: userId,
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          })
          
          if (!chat) {
            return res.status(404).json({ error: 'Chat not found' })
          }
          
          return res.status(200).json(chat)
        } else {
          const chats = await prisma.aIChat.findMany({
            where: {
              userId: userId,
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          })
          
          return res.status(200).json(chats)
        }
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to fetch chats',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    } else if (req.method === 'DELETE') {
      try {
        const { chatId } = req.query
        if (!chatId) {
          return res.status(400).json({ error: 'Chat ID is required' })
        }

        const chat = await prisma.aIChat.findUnique({
          where: { 
            id: chatId as string,
            userId: userId,
          },
        })

        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' })
        }

        await prisma.$transaction([
          prisma.aIChatMessage.deleteMany({
            where: { chatId: chatId as string },
          }),
          prisma.aIChat.delete({
            where: { id: chatId as string },
          })
        ])

        return res.status(200).json({ message: 'Chat deleted successfully' })
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to delete chat',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      type: error.name
    })
  }
}

export async function aiChatHandler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      details: 'No authorization token provided'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.decode(token) as { userId: string } | null

    if (!payload || !payload.userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'Invalid token - missing user ID'
      })
    }

    const userId = payload.userId

    if (req.method === 'POST') {
      try {
        const { title } = req.body
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          return res.status(404).json({
            error: 'User not found',
            details: 'User does not exist in database'
          })
        }

        const chat = await prisma.aIChat.create({
          data: {
            title: title || 'New Chat',
            userId: userId,
          },
        })
        
        return res.status(201).json(chat)
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to create AI chat',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    } else if (req.method === 'GET') {
      try {
        const { chatId } = req.query
        
        if (chatId) {
          const chat = await prisma.aIChat.findUnique({
            where: { 
              id: chatId as string,
              userId: userId,
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          })
          
          if (!chat) {
            return res.status(404).json({ error: 'AI Chat not found' })
          }
          
          return res.status(200).json(chat)
        } else {
          const chats = await prisma.aIChat.findMany({
            where: {
              userId: userId,
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          })
          
          return res.status(200).json(chats)
        }
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to fetch AI chats',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    } else if (req.method === 'DELETE') {
      try {
        const { chatId } = req.query
        if (!chatId) {
          return res.status(400).json({ error: 'Chat ID is required' })
        }

        const chat = await prisma.aIChat.findUnique({
          where: { 
            id: chatId as string,
            userId: userId,
          },
        })

        if (!chat) {
          return res.status(404).json({ error: 'AI Chat not found' })
        }

        await prisma.$transaction([
          prisma.aIChatMessage.deleteMany({
            where: { chatId: chatId as string },
          }),
          prisma.aIChat.delete({
            where: { id: chatId as string },
          })
        ])

        return res.status(200).json({ message: 'AI Chat deleted successfully' })
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to delete AI chat',
          details: error.message,
          type: error.name,
          code: error.code
        })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      type: error.name
    })
  }
}
