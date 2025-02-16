import type React from "react";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

interface Module {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

const getDailyChallengeModule = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch("/api/modules", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch modules");
  }

  const modules: Module[] = await response.json();
  if (modules.length === 0) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash = hash & hash;
  }
  
  const selectedIndex = Math.abs(hash) % modules.length;
  return modules[selectedIndex];
};

const DailyChallenge: React.FC = () => {
  const [module, setModule] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getDailyChallengeModule()
      .then(setModule)
      .catch((err) => setError(err.message));
  }, []);

  const handleStartClick = () => {
    if (module) {
      router.push(`/modules/${module.id}`);
    }
  };

  if (!module) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-yellow-500 text-white p-3 rounded-full shadow-lg">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Daily Challenge</h2>
      </div>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">{module.title}</h3>
          <Button onClick={handleStartClick} className="w-full mt-4 font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition-all">
            Start Challenge
          </Button>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
