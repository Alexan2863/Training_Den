"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "./DashboardStatsWidget";
import ErrorDisplay from "./ErrorDisplay";
import { getCurrentUser } from "@/lib/auth";

interface TrainerDashboardData {
  activeSessions: number;
}

export default function TrainerDashboard() {
  const [data, setData] = useState<TrainerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user to fetch their ID
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Fetch session count with trainerId parameter
        const response = await fetch(
          `/api/stats/sessions?trainerId=${user.id}`
        );
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch session data");
        }

        setData({
          activeSessions: result.data.activeSessions,
        });
        // Trigger fade-in after data is loaded
        setTimeout(() => {
          setLoaded(true);
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load dashboard" />;
  }

  if (!data) {
    return null;
  }

  return (
    <div
      className={`${loaded ? "loaded loading" : "loading"} grid grid-cols-1 md:grid-cols-2 gap-6`}
    >
      <DashboardStatsWidget
        title="Your Sessions"
        value={data.activeSessions}
        variant="default"
      />
    </div>
  );
}
