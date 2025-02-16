import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateRecommendedTopics } from "@/lib/ai/defaults/generate_recommended_topics";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, role, interests, learningStyle, name } = req.body;

  if (!email || !role || !interests || !learningStyle) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!Array.isArray(interests) || interests.length === 0) {
    return res.status(400).json({ message: "Interests must be a non-empty array" });
  }

  if (
    typeof learningStyle !== "object" ||
    Object.keys(learningStyle).length === 0
  ) {
    return res.status(400).json({ message: "Invalid learning style data" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        interests,
        learningStyle: learningStyle as any,
        name: name || email.split("@")[0],
      },
    });

    const aiResponse = await generateRecommendedTopics(user.interests);
    let recommendations;

    try {
      recommendations = JSON.parse(aiResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
    }

    if (recommendations) {
      await prisma.aIRecommendation.create({
        data: {
          userId: user.id,
          content: JSON.stringify(recommendations),
        },
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ user, token: jwtToken });
  } catch (error) {
    console.error("Signup error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed on the fields: (`email`)")
    ) {
      return res.status(400).json({ message: "Email already in use" });
    }
    if (error instanceof Error) {
      return res.status(500).json({
        message: "An error occurred during signup",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "An unknown error occurred during signup",
    });
  }
}
