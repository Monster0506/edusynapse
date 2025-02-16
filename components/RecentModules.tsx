import { useQuery } from "react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  lastOpened?: string;
  learningPathItems: {
    id: string;
    learningPathId: string;
  }[];
}

const RecentModules = () => {
  const { data: modules, isLoading, error } = useQuery<Module[]>(
    "recentModules",
    async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const res = await fetch("/api/modules?sort=lastOpened&limit=3", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch recent modules");
      }

      const data = await res.json();
      return data.slice(0, 3); // Ensure we only get 3 modules
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <Card className="shadow-md border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
            <Clock className="w-5 h-5 text-red-500" />
            Recent Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!modules?.length) {
    return (
      <Card className="shadow-md border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Modules
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">No recently opened modules</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
          <Clock className="w-5 h-5 text-blue-500" />
          Recent Modules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules?.map((module) => {
            // Find the first learning path item that has a valid learning path ID
            const learningPathItem = module.learningPathItems?.find(item => item.learningPathId);
            const moduleUrl = learningPathItem
              ? `/learning-paths/${learningPathItem.learningPathId}/modules/${module.id}`
              : `/modules/${module.id}`; // Fallback to direct module link

            return (
              <Link
                key={module.id}
                href={moduleUrl}
                className="block group bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {module.description}
                  </p>
                  {module.lastOpened && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Last opened: {new Date(module.lastOpened).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentModules;
