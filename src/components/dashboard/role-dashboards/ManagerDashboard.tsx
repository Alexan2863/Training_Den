"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "../shared/DashboardStatsWidget";
import ErrorDisplay from "../shared/ErrorDisplay";
import { getCurrentUser } from "@/lib/auth";

interface ManagerDashboardData {
  activePrograms: number;
}

export default function ManagerDashboard() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
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

        // Fetch program count with managerId parameter
        const programResponse = await fetch(
          `/api/stats/programs?managerId=${user.id}`
        );
        const programResult = await programResponse.json();

        if (!programResult.success) {
          throw new Error(
            programResult.message || "Failed to fetch program data"
          );
        }

        setData({
          activePrograms: programResult.data.activePrograms,
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
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
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
        title="Your Programs"
        value={data.activePrograms}
        variant="default"
      />
    </div>
  );
}
