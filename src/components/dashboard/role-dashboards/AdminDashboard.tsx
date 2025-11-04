"use client";

import { useEffect, useState } from "react";
import DashboardStatsWidget from "../shared/DashboardStatsWidget";
import TrainingCard from "../shared/TrainingCard";
import ErrorDisplay from "../shared/ErrorDisplay";
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

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/dashboard-stats");
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }

        setData(result.data);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
    <div className={`${loaded ? "loaded loading" : "loading"} space-y-6`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <TrainingCard/>
        </div>

        <div>
          <TrainingCard/>
        </div>

        <div>
          <TrainingCard/>
        </div>

      </div>
    </div>
  );
}
