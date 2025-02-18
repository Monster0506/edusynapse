import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        email,
      },
    })

    return res.status(201).json(waitlistEntry)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already registered' })
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
