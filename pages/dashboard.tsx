"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "react-query";
import type React from "react";

// Components
import QuickAccessToolbar from "@/components/QuickAccessToolbar";
import UpcomingReviews from "@/components/UpcomingReviews";
import DailyChallenge from "@/components/DailyChallenge";
import AIRecommendations from "@/components/AIRecommendations";
import RecentModules from "@/components/RecentModules";

// shadcn components
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Fetch the main dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery(
    "dashboardData",
    async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      return res.json();
    },
    {
      retry: false,
      onError: (error) => {
        console.error("Dashboard fetch error:", error);
        if ((error as Error).message === "No token found") {
          router.push("/login");
        }
      },
    }
  );

  // Fetch upcoming reviews and ensure it's always present
  const {
    data: modulesByEase,
    isLoading: isModulesLoading,
  } = useQuery(
    "modulesByEase",
    async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const res = await fetch("/api/modules/by-ease", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch modules by ease");
      }

      return res.json();
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Ensure recommendations always have a default value
  const recommendations = dashboardData?.aiRecommendations || [];

  if (isDashboardLoading || isModulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-[300px] h-[20px] rounded-full" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="w-[90%] max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(dashboardError as Error).message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QuickAccessToolbar />
      <div className="container mx-auto px-6 py-8 max-w-[1400px]">
        <h1 className="text-4xl font-bold mb-12 text-foreground">
          Welcome back, {dashboardData?.name || "User"}!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            <RecentModules />
            {recommendations.length > 0 ? (
              <AIRecommendations
                recommendations={recommendations}
                onUpdateRecommendations={(newRecommendations) => {
                  queryClient.setQueryData("dashboardData", {
                    ...dashboardData,
                    aiRecommendations: newRecommendations,
                  });
                }}
              />
            ) : (
              <p className="text-muted-foreground">No recommendations available.</p>
            )}
          </div>
          <div className="space-y-12">
            <DailyChallenge />
            <UpcomingReviews />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
