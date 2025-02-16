"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import PracticeGenerator from "../components/PracticeGenerator";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuickAccessToolbar from "@/components/QuickAccessToolbar";

interface PracticeQuestion {
  question: string;
  type: string;
  options?: string[];
  streak?: number;
  ease?: number;
}

interface PracticeAttempt {
  id: string;
  questions: PracticeQuestion[];
  score?: number;
  averageEase?: number;
}

interface GradeResult {
  score: number;
  feedback: string;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

export default function PracticePage() {
  const router = useRouter();
  const [currentAttempt, setCurrentAttempt] = useState<PracticeAttempt | null>(
    null,
  );
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionGrades, setQuestionGrades] = useState<GradeResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const decodedToken = jwt.decode(token) as { userId: string } | null;
      if (decodedToken) {
        setUserId(decodedToken.userId);
        setIsLoading(false);
      } else {
        setError("Invalid token");
      }
    }
  }, [router]);

  const { data: modules, error: modulesError } = useSWR(
    !isLoading ? "/api/modules" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (modulesError) {
      setError("Failed to load modules. Please refresh the page.");
    }
  }, [modulesError]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateNewEase = (
    oldEase: number | undefined,
    streak: number,
    isCorrect: boolean,
  ): number => {
    const a = 0.1; // Correct answer factor
    const b = 0.2; // Incorrect answer factor
    const defaultEase = 2.5;
    const minEase = 1.3; // Prevent ease from going too low
    
    // Initialize ease if it doesn't exist
    const currentEase = oldEase ?? defaultEase;
    
    let newEase;
    if (isCorrect) {
      // For correct answers, use the new streak to increase difficulty
      newEase = currentEase * (1 + a);
    } else {
      // For wrong answers, apply penalty directly
      newEase = currentEase * (1 - b);
    }

    // Ensure ease doesn't go below minimum and round to 2 decimal places
    return Math.round(Math.max(minEase, newEase) * 100) / 100;
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem("token");
      const grades: GradeResult[] = [];
      let totalScore = 0;

      // Create a deep copy of the questions to preserve all properties
      const updatedQuestions = JSON.parse(JSON.stringify(currentAttempt.questions));

      for (let i = 0; i < currentAttempt.questions.length; i++) {
        const question = currentAttempt.questions[i];
        const userAnswer = userAnswers[i]?.trim() || "";

        const response = await fetch("/api/practice/grade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            question: question.question,
            type: question.type,
            options: question.options,
            userAnswer,
          }),
        });

        if (!response.ok) {
          throw new Error("Grading failed");
        }

        const result: GradeResult = await response.json();
        grades.push(result);
        totalScore += result.score;

        // Update streak and ease factor
        const isCorrect = result.score >= 1;
        const oldStreak = question.streak || 0;
        // Calculate new streak first
        const newStreak = isCorrect ? oldStreak + 1 : 0;
        // Use new streak for correct answers, but use 1 for wrong answers
        const newEase = calculateNewEase(question.ease, newStreak, isCorrect);

        updatedQuestions[i] = {
          ...question,
          streak: newStreak,
          ease: newEase,
        };

        console.log(`Question ${i + 1}:
          Old ease: ${question.ease?.toFixed(2) || '2.50'}
          New ease: ${newEase.toFixed(2)}
          Old streak: ${oldStreak}
          New streak: ${newStreak}
          Correct: ${isCorrect}
          Score: ${result.score}/2
          Calculation: ${question.ease || 2.5} * ${isCorrect ? '1.1' : '0.8'} = ${newEase}`);
      }

      const calculatedScore = (totalScore / (currentAttempt.questions.length * 2)) * 100;
      
      // Calculate average ease factor
      const averageEase = Math.round(
        (updatedQuestions.reduce((sum, q) => sum + (q.ease || 2.5), 0) / updatedQuestions.length) * 100
      ) / 100;

      setScore(calculatedScore);
      setQuestionGrades(grades);
      setSubmitted(true);

      // Update the practice attempt with the final score, updated questions, and average ease
      await fetch(`/api/practice/${currentAttempt.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          score: calculatedScore,
          questions: updatedQuestions,
          averageEase,
        }),
      });

      // Update the current attempt with new streaks, ease factors, and average ease
      setCurrentAttempt({
        ...currentAttempt,
        questions: updatedQuestions,
        averageEase,
      });

      console.log(`
        Practice Attempt Summary:
        Score: ${calculatedScore.toFixed(1)}%
        Average Ease: ${averageEase.toFixed(2)}
        Questions: ${updatedQuestions.length}
        Individual Ease Factors: ${updatedQuestions.map(q => q.ease?.toFixed(2) || '2.50').join(', ')}
      `);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    // Keep the current questions with their streaks and ease factors
    const currentQuestions = currentAttempt?.questions || [];
    setUserAnswers({});
    setQuestionGrades([]);
    setSubmitted(false);
    setScore(null);

    // Ensure we keep the same questions with their properties
    setCurrentAttempt((prev) =>
      prev ? { ...prev, questions: currentQuestions } : null,
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <QuickAccessToolbar />
      <div className="flex h-screen bg-gray-100 bg-background">
        <aside className="w-64 bg-dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 text-foreground">
            Practice Module
          </h1>
          <PracticeGenerator onGenerate={setCurrentAttempt} />
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <ScrollArea className="h-full">
            {currentAttempt ? (
              <div className="space-y-8">
                {currentAttempt.questions.map((question, index) => (
                  <Card key={index} className="question-card">
                    <CardHeader>
                      <CardTitle className="flex items-start">
                        <span className="text-lg font-medium mr-2">
                          Q{index + 1}.
                        </span>
                        <p className="text-lg">{question.question}</p>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question.type === "multiple_choice" && (
                        <RadioGroup
                          onValueChange={(value) =>
                            handleAnswerChange(index.toString(), value)
                          }
                          disabled={submitted}
                          className="space-y-2"
                        >
                          {question.options?.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`option-${index}-${optionIndex}`}
                              />
                              <Label htmlFor={`option-${index}-${optionIndex}`}>
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {question.type === "short_answer" && (
                        <Input
                          type="text"
                          value={userAnswers[index] || ""}
                          onChange={(e) =>
                            handleAnswerChange(index.toString(), e.target.value)
                          }
                          disabled={submitted}
                          placeholder="Type your answer here..."
                          className="w-full"
                        />
                      )}

                      {question.type === "coding_problem" && (
                        <Editor
                          value={userAnswers[index] || ""}
                          onValueChange={(code) =>
                            handleAnswerChange(index.toString(), code)
                          }
                          highlight={(code) =>
                            highlight(code, languages.javascript, "javascript")
                          }
                          padding={15}
                          style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                          }}
                          className="border rounded"
                        />
                      )}

                      {submitted && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {questionGrades[index]?.score === 2 ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                              ) : questionGrades[index]?.score === 1 ? (
                                <CheckCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                              )}
                              <strong className="text-sm">
                                Score: {questionGrades[index]?.score}/2
                              </strong>
                            </div>
                            <div className="flex items-center space-x-4">
                              {question.streak > 0 && (
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  🔥 Streak: {question.streak}
                                </span>
                              )}
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                Ease: {typeof question.ease === "number"
                                  ? question.ease.toFixed(2)
                                  : "2.50"}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Feedback:</span>{" "}
                            {questionGrades[index]?.feedback}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!submitted ? (
                  <Button
                    onClick={handleSubmit}
                    className="mt-6"
                    disabled={
                      isGenerating ||
                      Object.keys(userAnswers).length <
                      currentAttempt.questions.length
                    }
                  >
                    {isGenerating ? "Generating..." : "Submit Answers"}
                  </Button>
                ) : (
                  <Card className="mt-6">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Your Score: {score?.toFixed(1)}%</h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {score && score >= 80 ? "Great job! 🎉" : "Keep practicing! 💪"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Average Difficulty: {currentAttempt?.averageEase?.toFixed(2)}
                            {currentAttempt?.averageEase && currentAttempt.averageEase > 3 ? " (Easy)" : 
                             currentAttempt?.averageEase && currentAttempt.averageEase < 2 ? " (Hard)" : " (Medium)"}
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <Button onClick={handleRetry} variant="secondary">
                            Try Again
                          </Button>
                          <Button onClick={() => setCurrentAttempt(null)} variant="outline">
                            New Module
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Select a module to start practicing
                </p>
              </div>
            )}
          </ScrollArea>
        </main>
      </div>
    </>
  );
}
