"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "../shared/DashboardStatsWidget";
import ErrorDisplay from "../shared/ErrorDisplay";
import UpcomingSessions from "../employee/UpcomingSessions";
import { UpcomingSession } from "@/lib/types/training-programs";

interface EmployeeDashboardData {
  totalEnrolled: number;
  overdue: number;
  completed: number;
  available: number;
}

function StatsSkeleton() {
  return (
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
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [sessions, setSessions] = useState<UpcomingSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData(retryCount = 0) {
      try {
        // Fetch stats and sessions in parallel
        const [statsResponse, sessionsResponse] = await Promise.all([
          fetch("/api/employee/dashboard-stats"),
          fetch("/api/employee/upcoming-sessions"),
        ]);

        // Retry on 401 - cookies may not be synced yet after refresh
        if (statsResponse.status === 401 && retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return fetchData(retryCount + 1);
        }

        const [statsResult, sessionsResult] = await Promise.all([
          statsResponse.json(),
          sessionsResponse.json(),
        ]);

        if (!statsResult.success) {
          throw new Error(statsResult.message || "Failed to fetch dashboard data");
        }

        setData(statsResult.data);
        setSessions(sessionsResult.success ? sessionsResult.data : []);
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 stagger-fade-in">
              <DashboardStatsWidget
                title="Enrolled Sessions"
                value={data.totalEnrolled}
                description="Total sessions you're enrolled in"
                variant="default"
              />
              <DashboardStatsWidget
                title="Overdue Sessions"
                value={data.overdue}
                description="Sessions past due date"
                variant="default"
              />
              <DashboardStatsWidget
                title="Completed Sessions"
                value={data.completed}
                description="Sessions you've completed"
                variant="default"
              />
              <DashboardStatsWidget
                title="Available Sessions"
                value={data.available}
                description="Sessions available to enroll"
                variant="default"
              />
            </div>
          )}
        </div>
      </div>

      {/* Upcoming sessions */}
      <UpcomingSessions sessions={sessions} />
    </div>
  );
}
