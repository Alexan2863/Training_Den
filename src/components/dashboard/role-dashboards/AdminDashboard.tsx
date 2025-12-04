"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "../shared/DashboardStatsWidget";
import ErrorDisplay from "../shared/ErrorDisplay";
import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";
import {
  MedalIcon,
  SuitcaseSimpleIcon,
  TrendUpIcon,
  UsersFour,
} from "@phosphor-icons/react";

interface AdminDashboardData {
  admins: number;
  employees: number;
  managers: number;
  trainers: number;
  activeSessions: number;
  activePrograms: number;
}

function StatsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-24 mb-3 sm:mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 border border-gray-200 rounded-lg p-4 sm:p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-3 sm:mb-4"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 border border-gray-200 rounded-lg p-4 sm:p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3 sm:mb-4"></div>
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData(retryCount = 0) {
      try {
        const response = await fetch("/api/admin/dashboard-stats");

        // Retry on 401 - cookies may not be synced yet after refresh
        if (response.status === 401 && retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return fetchData(retryCount + 1);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 stagger-fade-in">
                  <DashboardStatsWidget
                    title="Total Admins"
                    value={data.admins}
                    variant="emerald"
                    icon={<TrendUpIcon size={32} />}
                  />
                  <DashboardStatsWidget
                    title="Total Managers"
                    value={data.managers}
                    variant="rose"
                    icon={<SuitcaseSimpleIcon size={32} />}
                  />
                  <DashboardStatsWidget
                    title="Total Trainers"
                    value={data.trainers}
                    variant="fuchsia"
                    icon={<MedalIcon size={32} />}
                  />
                  <DashboardStatsWidget
                    title="Total Employees"
                    value={data.employees}
                    variant="sky"
                    icon={<UsersFour size={32} />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 stagger-fade-in">
                <DashboardStatsWidget
                  title="Active Programs"
                  value={data.activePrograms}
                  variant="default"
                />
                <DashboardStatsWidget
                  title="Active Sessions"
                  value={data.activeSessions}
                  variant="default"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Programs section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Upcoming Programs
        </h3>
        <TrainingProgramsWidget upcomingOnly={true} />
      </div>
    </div>
  );
}
