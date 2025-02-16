import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const modules = await prisma.aIModule.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newModule = await prisma.aIModule.create({
      data: {
        ...body,
        userId: body.userId, // Make sure to pass userId from the client
      },
    })

    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error("Error creating module:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

