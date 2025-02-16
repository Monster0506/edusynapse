"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "react-query";
import LearningStyleQuiz from "@/components/LearningStyleQuiz";
import InterestTags from "@/components/InterestTags";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "educator">(
    "student",
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<Record<string, number>>(
    {},
  );
  const router = useRouter();

  // Signup Mutation
  const signupMutation = useMutation(
    async (userData: any) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Signup failed");
      }
      return res.json();
    },
    {
      onSuccess: () => {
        setAlert({
          type: "success",
          message:
            "Signup successful! You can now log in with your email and password.",
        });
        setTimeout(() => router.push("/login"), 2000);
      },
      onError: (error) => {
        setIsLoading(false);
        console.error("Signup error:", error);
        setAlert({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        });
      },
    },
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    // Validation checks
    if (!email) {
      setAlert({ type: "error", message: "Please enter your email address." });
      setIsLoading(false);
      return;
    }

    if (!password) {
      setAlert({ type: "error", message: "Please enter a password." });
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    if (!quizCompleted) {
      setAlert({
        type: "error",
        message: "Please complete the learning style quiz.",
      });
      setIsLoading(false);
      return;
    }

    if (selectedInterests.length === 0) {
      setAlert({
        type: "error",
        message: "Please select at least one interest.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const defaultName = email.split("@")[0];
      await signupMutation.mutateAsync({
        email,
        password,
        role: selectedRole,
        interests: selectedInterests,
        learningStyle,
        name: defaultName,
      });
    } catch (error) {
      // Error handling is done in mutation's onError
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alert && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className="mb-6"
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <LearningStyleQuiz
              onComplete={(style) => {
                setQuizCompleted(true);
                setLearningStyle(style);
              }}
            />

            <InterestTags
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
