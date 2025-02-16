"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface QuizQuestion {
  question: string
  options: string[]
  results: string[]
  category: "visual" | "auditory" | "kinesthetic"
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "What is your preferred way to learn new information?",
    options: ["Reading and diagrams", "Listening to lectures", "Hands-on activities"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "visual",
  },
  {
    question: "How do you best remember information?",
    options: ["Visual aids (charts, graphs)", "Audio recordings or discussions", "Physical demonstrations or practice"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "auditory",
  },
  {
    question: "What learning environment do you find most effective?",
    options: ["Quiet, well-lit space", "Interactive discussions", "Active, hands-on projects"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "kinesthetic",
  },
  {
    question: "Which of these methods helps you understand concepts better?",
    options: ["Watching videos or presentations", "Listening to explanations", "Experimenting and building"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "visual",
  },
  {
    question: "How do you prefer to receive instructions?",
    options: ["Written instructions with diagrams", "Verbal instructions", "Demonstrations and practice"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "auditory",
  },
  {
    question: "What is your preferred way to solve problems?",
    options: ["Visualizing the problem", "Talking through the problem", "Trying different approaches"],
    results: ["visual", "auditory", "kinesthetic"],
    category: "kinesthetic",
  },
]

interface LearningStyleQuizProps {
  onComplete: (style: Record<string, number>) => void
}

export default function LearningStyleQuiz({ onComplete }: LearningStyleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleAnswer = (option: string) => {
    setSelectedOption(option)
  }

  const handleNext = () => {
    if (selectedOption === null) return

    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null) // Reset selection for next question

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz completed
      const style = calculateLearningStyle(newAnswers)
      onComplete(style)
    }
  }

  const calculateLearningStyle = (answers: string[]): Record<string, number> => {
    const style = { visual: 0, auditory: 0, kinesthetic: 0 }
    answers.forEach((answer, index) => {
      const question = quizQuestions[index]
      const answerIndex = question.options.indexOf(answer)
      const category = question.results[answerIndex]
      style[category as keyof typeof style] += 1
    })
    const total = Object.values(style).reduce((sum, score) => sum + score, 0)
    return Object.fromEntries(Object.entries(style).map(([key, value]) => [key, (value / total) * 100]))
  }

  if (answers.length === quizQuestions.length) {
    return <div className="text-center text-primary font-semibold">Learning style quiz completed!</div>
  }

  const question = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">Learning Style Quiz</h3>
      <Progress value={progress} className="w-full" />
      <div className="text-sm text-muted-foreground">
        Question {currentQuestion + 1} of {quizQuestions.length}
      </div>
      <p className="font-medium text-foreground">{question.question}</p>
      <RadioGroup onValueChange={handleAnswer} value={selectedOption || undefined}>
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleNext} disabled={selectedOption === null} className="w-full">
        {currentQuestion === quizQuestions.length - 1 ? "Complete Quiz" : "Next Question"}
      </Button>
    </div>
  )
}

