"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "../shared/DashboardStatsWidget";
import ErrorDisplay from "../shared/ErrorDisplay";
import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";
import { AuthUser } from "@/lib/auth";

interface TrainerDashboardData {
  activeSessions: number;
}

interface TrainerDashboardProps {
  user: AuthUser;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 sm:p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3 sm:mb-4"></div>
        <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export default function TrainerDashboard({ user }: TrainerDashboardProps) {
  const [data, setData] = useState<TrainerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user.id]);

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load dashboard" />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats section with crossfade */}
      <div className="crossfade-container">
        <div className={`crossfade-skeleton ${!isLoading ? "hidden" : ""}`}>
          <StatsSkeleton />
        </div>
        <div className={`crossfade-content ${!isLoading && data ? "visible" : ""}`}>
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 stagger-fade-in">
              <DashboardStatsWidget
                title="Your Sessions"
                value={data.activeSessions}
                variant="default"
              />
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Programs section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Your Upcoming Programs
        </h3>
        <TrainingProgramsWidget upcomingOnly={true} />
      </div>
    </div>
  );
}
