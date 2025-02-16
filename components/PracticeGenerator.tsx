import { useState, useEffect } from "react";
import useSWR from "swr";
import jwt from "jsonwebtoken";

interface AIModule {
  id: string
  title: string
}

interface PracticeAttempt {
  id: string
  questions: Array<{
    question: string
    type: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }>
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json()
}

export default function PracticeGenerator({
  onGenerate,
}: {
  onGenerate: (practice: PracticeAttempt) => void;
}) {
  const [selectedModule, setSelectedModule] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch available modules
  const { data: modules, error: fetchError } = useSWR<AIModule[]>(
    "/api/modules",
    fetcher,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt.decode(token) as { userId: string } | null
      if (decodedToken) {
        setUserId(decodedToken.userId)
      }
    }
  }, [])

  const generatePractice = async () => {
    if (!userId || !selectedModule) return;

    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/practice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moduleId: selectedModule }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const practice: PracticeAttempt = await response.json();
      onGenerate(practice);
    } catch (error) {
      console.error("Practice generation error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate practice",
      );
    } finally {
      setIsGenerating(false)
    }
  }

  if (fetchError)
    return <div className="text-red-500">Failed to load modules</div>;
  if (!modules) return <div>Loading...</div>;

  return (
    <div className="practice-generator space-y-4">
      <h2 className="text-xl font-semibold">Practice Generator</h2>
      {error && <div className="text-red-500">{error}</div>}
      <div className="controls space-y-2">
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a module</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>

        <button
          onClick={generatePractice}
          disabled={!selectedModule || isGenerating}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Practice"}
        </button>
      </div>
    </div>
  );
}