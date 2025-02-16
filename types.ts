import { PrismaClient } from "@prisma/client"
import type { AIModule } from "@prisma/client"

const prisma = new PrismaClient()
type PrismaModels = Omit<typeof prisma, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">

export type Topic = PrismaModels["topic"]["create"]["data"]
export type LearningPathItem = PrismaModels["learningPathItem"]["create"]["data"]
export type ContentItem = PrismaModels["contentItem"]["create"]["data"]
export type Bookmark = PrismaModels["bookmark"]["create"]["data"]

// Removed duplicate LearningPathWithItems interface

export interface ContentItemWithBookmarks extends ContentItem {
  bookmarks: Bookmark[]
  rating?: number
  ratingCount?: number
  version?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
}

export interface Annotation {
  id: string
  text: string
  annotation: string
  userId: string
  contentItemId: string
  createdAt: string
}

export interface LearningItem {
  id: string
  title: string
  type: string
  difficulty: string
  estimatedTime: string
}

export interface ReviewSession {
  id: string
  userId: string
  dueDate: string
  completed: boolean
  isUrgent: boolean
  items: ReviewItem[]
  completedAt?: string
}

export interface ReviewItem {
  id: string
  type: "flashcard" | "quiz"
  question: string
  answer: string
  isCorrect?: boolean
  answeredAt?: string
}

export interface PeerComparison {
  percentile: number
}

export interface LearningPathModule {
  title: string
  description: string
}

export interface LearningPathContent {
  title: string
  description: string
  modules: LearningPathModule[]
}

export interface LearningPath {
  id: string
  title: string
  description: string
  content: LearningPathContent
}

export interface LearningPathWithItems extends LearningPath {
  items: {
    id: string
    order: number
    aiModule: AIModule
  }[]
}
