import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "@/lib/prisma"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const module = await prisma.aIModule.findUnique({
      where: { id },
      include: { topic: true, learningPathItems: true, quizAttempts: true, ratings: true, user: true },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error("Error fetching module:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request)

    if (!(user instanceof NextResponse)) {
      const id = params.id
      const body = await request.json()

      const module = await prisma.aIModule.findUnique({ where: { id } })

      if (!module) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 })
      }

      if (module.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      const updatedModule = await prisma.aIModule.update({
        where: { id },
        data: body,
      })

      return NextResponse.json(updatedModule)
    } else {
      return user
    }
  } catch (error) {
    console.error("Error updating module:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request)

    if (!(user instanceof NextResponse)) {
      const id = params.id

      const module = await prisma.aIModule.findUnique({ where: { id } })

      if (!module) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 })
      }

      if (module.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      await prisma.aIModule.delete({
        where: { id },
      })

      return NextResponse.json({ message: "Module deleted successfully" })
    } else {
      return user
    }
  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

