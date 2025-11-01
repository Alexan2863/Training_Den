"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "./DashboardStatsWidget";
import ErrorDisplay from "./ErrorDisplay";

interface EmployeeDashboardData {
  totalEnrolled: number;
  overdue: number;
  completed: number;
  available: number;
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/employee/dashboard-stats");
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
}
