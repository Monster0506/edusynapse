"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism-solarizedlight.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import {
  CodeIcon as CodeBracketIcon,
  CalculatorIcon,
  TextIcon as DocumentTextIcon,
} from "lucide-react";
import { Copy, Play, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

// Custom renderer for code blocks
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [pyodide, setPyodide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPythonBlock, setIsPythonBlock] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  let language = match ? match[1] : "";

  // Improved language detection
  if (language == "javascript" || !language && children) {
    const code = children.toString();
    // Detect JavaScript
    // Detect C++
    if (code.includes('cout') || code.includes('cin') || 
             code.includes('#include') || /int\s+main\s*\(/.test(code) ||
             /(int|float|double|char|bool)\s+\w+\s*=/.test(code)) {
      language = 'cpp';
    }
    else if (code.includes('var ') || code.includes('let ') || code.includes('const ') ||
        /function\s+\w+\s*\(/.test(code) || code.includes('=>') ||
        /class\s+\w+/.test(code)) {
      language = 'javascript';
    }
    // Detect Python
    else if (code.includes('def ') || code.includes('import ') || 
             code.includes('print(') || code.includes('class ') ||
             /#\s*[^\n]+/.test(code)) {
      language = 'python';
    }
    // Default to JavaScript for basic variable declarations
  }

  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if this is a Python block
  useEffect(() => {
    if (!isClient) return;

    const isPython =
      language === "python" ||
      language === "py" ||
      children.toString().includes("import numpy") ||
      children.toString().includes("import pandas") ||
      children.toString().includes("print(") ||
      children.toString().includes("def ");
    setIsPythonBlock(isPython);
  }, [language, children, isClient]);

  useEffect(() => {
    if (!isClient || !isPythonBlock) return;

    let mounted = true;
    let scriptLoadAttempts = 0;
    const MAX_ATTEMPTS = 3;

    const loadPyodideScript = async () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script is already loaded and window.loadPyodide exists
        if (typeof window !== "undefined" && window.loadPyodide) {
          resolve();
          return;
        }

        // Check for existing script
        const existingScript = document.querySelector(
          'script[src*="pyodide.js"]',
        );
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", (e) => reject(e));
          return;
        }

        // Create new script
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          resolve();
        };

        script.onerror = (err) => {
          reject(err);
        };

        document.body.appendChild(script);
      });
    };

    const initPyodide = async () => {
      if (!mounted) return;

      try {
        if (typeof window === "undefined") {
          return;
        }

        if (!window.loadPyodide) {
          if (scriptLoadAttempts >= MAX_ATTEMPTS) {
            throw new Error("Failed to load Pyodide after multiple attempts");
          }

          await loadPyodideScript();
          scriptLoadAttempts++;

          // Wait a bit to ensure the script is properly initialized
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!window.loadPyodide) {
          throw new Error("Pyodide failed to load properly");
        }

        if (!pyodide && mounted) {
          const pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
            stdout: (text: string) => {
              setOutput((prev) => prev + text + "\n");
            },
            stderr: (text: string) => {
              setError((prev) => (prev ? prev + "\n" + text : text));
            },
          });

          if (mounted) {
            setPyodide(pyodideInstance);
          }
        }
      } catch (err) {
        console.error("Failed to initialize Pyodide:", err);
        if (mounted) {
          setError(
            "Failed to initialize Python environment. Please try refreshing the page.",
          );
        }
      }
    };

    // Start initialization
    initPyodide();

    return () => {
      mounted = false;
    };
  }, [isPythonBlock, isClient, pyodide]);

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const highlighted = language
    ? Prism.highlight(
        children.toString(),
        Prism.languages[language] || Prism.languages.javascript,
        language,
      )
    : Prism.highlight(children.toString(), Prism.languages.javascript, "javascript");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children.toString());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleRun = async () => {
    if (!isClient) return;

    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      if (isPythonBlock) {
        if (!pyodide) {
          throw new Error(
            "Python environment is not ready. Please wait a moment and try again.",
          );
        }
        try {
          const result = await pyodide.runPython(children.toString());
          setOutput((prev) => prev + String(result));
        } catch (err: any) {
          setError(err.message);
        }
      } else if (language === "javascript") {
        try {
          const customConsole = {
            log: (...args: any[]) => {
              const newOutput =
                args
                  .map((arg) =>
                    typeof arg === "object"
                      ? JSON.stringify(arg, null, 2)
                      : String(arg),
                  )
                  .join(" ") + "\n";
              setOutput((prev) => prev + newOutput);
            },
            error: (...args: any[]) => {
              const errorOutput =
                args
                  .map((arg) =>
                    typeof arg === "object"
                      ? JSON.stringify(arg, null, 2)
                      : String(arg),
                  )
                  .join(" ") + "\n";
              setError((prev) => (prev ? prev + errorOutput : errorOutput));
            },
            warn: (...args: any[]) => {
              const warnOutput =
                args
                  .map((arg) =>
                    typeof arg === "object"
                      ? JSON.stringify(arg, null, 2)
                      : String(arg),
                  )
                  .join(" ") + "\n";
              setOutput((prev) => prev + "Warning: " + warnOutput);
            },
          };

          const executeCode = new Function("console", children.toString());
          const originalConsole = window.console;
          (window as any).console = customConsole;

          executeCode(customConsole);

          (window as any).console = originalConsole;
        } catch (err: any) {
          setError(err.message);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const canRun = isPythonBlock || language === "javascript";

  return (
    <div className="relative group">
      <pre className="relative rounded-lg bg-gray-800 p-4">
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy code"
          >
            <Copy className="h-4 w-4" />
            {copySuccess && (
              <span className="absolute right-0 top-full mt-2 text-sm text-green-500 bg-gray-800 px-2 py-1 rounded">
                Copied!
              </span>
            )}
          </button>
          {canRun && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="p-2 text-gray-400 hover:text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              title="Run code"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        <code
          dangerouslySetInnerHTML={{ __html: highlighted }}
          className={className}
          {...props}
        />
      </pre>
      {(output || error || isRunning) && (
        <div className="mt-2 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <h4 className="text-sm font-medium text-gray-200">
              {isRunning ? "Running..." : error ? "Error" : "Output"}
            </h4>
          </div>
          <div className="bg-gray-900 p-4">
            {isRunning ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing code...</span>
              </div>
            ) : error ? (
              <pre className="text-sm text-red-400 whitespace-pre-wrap">
                {error}
              </pre>
            ) : (
              <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                {output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom renderer for paragraphs that may contain math
const MathParagraph = ({ children }: any) => {
  if (typeof children !== "string") {
    return <p>{children}</p>;
  }

  // Split by all possible math delimiters: [...], ( ... ), and $$...$$
  const parts = children.split(/(\[.*?\]|$$ .*? $$|\\\\?$$.*?\\\\?$$)/g);
  return (
    <p>
      {parts.map((part, index) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          const mathExpression = part.slice(1, -1).trim();
          return <InlineMath key={index} math={mathExpression} />;
        }
        if (part.startsWith("( ") && part.endsWith(" )")) {
          const mathExpression = part.slice(2, -2).trim();
          return <InlineMath key={index} math={mathExpression} />;
        }
        if (
          (part.startsWith("$$") && part.endsWith("$$")) ||
          (part.startsWith("\\$$") && part.endsWith("\\$$"))
        ) {
          const mathExpression = part
            .replace(/^\\?\$\$?|\\?\$\$?$/g, "")
            .trim();
          return <InlineMath key={index} math={mathExpression} />;
        }
        return part;
      })}
    </p>
  );
};

interface ModuleContentProps {
  content: {
    introduction: string;
    keyPoints: string[];
    examples: {
      type: "code" | "math" | "text";
      content: string;
      explanation: string;
    }[];
    quiz: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
    text: string;
  };
  pathId: string | null;
  moduleId: string;
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  content,
  pathId,
  moduleId,
}) => {
  const sections = [
    "Introduction",
    "Content",
    "Key Points",
    "Examples",
    "Quiz",
  ];
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<boolean[]>(
    new Array(sections.length).fill(false),
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(
    new Array(content.quiz?.length || 0).fill(-1),
  );
  const [progress, setProgress] = useState(0);
  const [highestAchievedTabIndex, setHighestAchievedTabIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const newProgress =
      ((Math.max(activeTabIndex, highestAchievedTabIndex) + 1) /
        sections.length) *
      100;
    setProgress(newProgress);
  }, [activeTabIndex, highestAchievedTabIndex]);

  const markSectionAsCompleted = (index: number) => {
    setCompletedSections((prev) => {
      if (!prev[index]) {
        const updatedSections = [...prev];
        updatedSections[index] = true;
        return updatedSections;
      }
      return prev;
    });
  };

  const markModuleAsCompleted = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `/api/learning-paths/${pathId}/modules/${moduleId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        },
      );

      if (!res.ok) {
        console.error("Failed to update module status");
      }
    } catch (error) {
      console.error("Error updating module status:", error);
    }
  };

  const handleNext = async () => {
    if (!completedSections[activeTabIndex]) {
      markSectionAsCompleted(activeTabIndex);
    }

    const nextIndex = activeTabIndex + 1;
    setActiveTabIndex(nextIndex);
    setHighestAchievedTabIndex(Math.max(nextIndex, highestAchievedTabIndex));

    if (nextIndex === sections.length) {
      await markModuleAsCompleted();
      router.push(`/learning-paths/${pathId}?completed=true`);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);

    if (!completedSections[activeTabIndex]) {
      markSectionAsCompleted(activeTabIndex);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground text-center">
        Progress: {progress.toFixed(0)}%
      </p>

      <Tabs
        value={sections[activeTabIndex]}
        onValueChange={(value) => setActiveTabIndex(sections.indexOf(value))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-4">
          {sections.map((section, index) => (
            <TabsTrigger
              key={section}
              value={section}
              disabled={index > highestAchievedTabIndex}
            >
              {section}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Introduction">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  p: MathParagraph,
                }}
              >
                {content.introduction}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Content">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  p: MathParagraph,
                }}
              >
                {content.text}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Key Points">
          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 list-none pl-0">
                {content.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground leading-relaxed">
                        <MathParagraph>{point}</MathParagraph>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Examples">
          <div className="space-y-6">
            {content.examples?.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {example.type === "code" ? (
                      <CodeBracketIcon className="w-5 h-5" />
                    ) : example.type === "math" ? (
                      <CalculatorIcon className="w-5 h-5" />
                    ) : (
                      <DocumentTextIcon className="w-5 h-5" />
                    )}
                    <span className="capitalize">{example.type} Example</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {example.type === "code" ? (
                      <ReactMarkdown
                        components={{
                          code: CodeBlock,
                        }}
                      >
                        {`\`\`\`${example.content.includes("python") ? "python" : "javascript"}\n${example.content}\n\`\`\``}
                      </ReactMarkdown>
                    ) : example.type === "math" ? (
                      <div className="bg-muted p-4 rounded-md font-mono text-foreground">
                        <MathParagraph>{example.content}</MathParagraph>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded-md">
                        <ReactMarkdown
                          className="prose max-w-none"
                          components={{
                            code: CodeBlock,
                            p: MathParagraph,
                          }}
                        >
                          {example.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-md border-l-4 border-primary">
                    <h4 className="font-medium text-foreground mb-2">
                      Explanation
                    </h4>
                    <MathParagraph>{example.explanation}</MathParagraph>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuizSubmit} className="space-y-6">
                {content.quiz?.map((question, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-foreground mb-4">{question.question}</p>
                    <RadioGroup
                      onValueChange={(value) => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = Number.parseInt(value);
                        setQuizAnswers(newAnswers);
                      }}
                      disabled={quizSubmitted}
                      className="space-y-2"
                    >
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={optionIndex.toString()}
                            id={`q${index}_o${optionIndex}`}
                          />
                          <Label
                            htmlFor={`q${index}_o${optionIndex}`}
                            className="text-sm"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {quizSubmitted && (
                      <div className="mt-4 p-4 rounded-md bg-muted">
                        <p
                          className={`text-sm font-semibold ${
                            quizAnswers[index] === question.correctAnswer
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {quizAnswers[index] === question.correctAnswer
                            ? "Correct!"
                            : "Incorrect"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Explanation: {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {!quizSubmitted && (
                  <Button type="submit" className="w-full">
                    Submit Quiz
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {activeTabIndex > 0 && (
        <div className="mt-4">
          <Button
            onClick={() => router.push(`/learning-paths/${pathId}`)}
            variant="link"
            className="text-sm"
          >
            Back to Learning Path
          </Button>
        </div>
      )}

      <div className="flex justify-between mt-6">
        {activeTabIndex === 0 ? (
          <Button
            onClick={() => router.push(`/learning-paths/${pathId}`)}
            variant="outline"
          >
            Back to Learning Path
          </Button>
        ) : (
          <Button
            onClick={() => setActiveTabIndex((prev) => Math.max(prev - 1, 0))}
            variant="outline"
          >
            Previous
          </Button>
        )}

        {activeTabIndex === sections.length - 1 ? (
          <Button
            onClick={async () => {
              await markModuleAsCompleted();
              router.push(`/learning-paths/${pathId}?completed=true`);
            }}
            variant="default"
          >
            Finish Module
          </Button>
        ) : (
          <Button onClick={handleNext} variant="default">
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModuleContent;
