"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgramCard } from "@/lib/types/training-programs";
import { ErrorDisplay } from "../dashboard";
import TrainingCard from "../dashboard/shared/TrainingCard";

interface TrainingProgramsWidgetProps {
  upcomingOnly?: boolean;
}

export default function TrainingProgramsWidget({
  upcomingOnly = false,
}: TrainingProgramsWidgetProps) {
  const [programs, setPrograms] = useState<ProgramCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch training programs from an API or data source
    async function fetchPrograms() {
      try {
        const url = upcomingOnly
          ? "/api/training-programs?upcoming=true"
          : "/api/training-programs";
        const response = await fetch(url);
        const data = await response.json();
        setPrograms(data);

        if (data.success) {
          setPrograms(data.data);
        } else {
          setError(data.message || "Failed to load program");
        }

        // Trigger fade-in after data is loaded
        setTimeout(() => {
          setLoaded(true);
        }, 100);
      } catch (error) {
        setError("Failed to fetch training programs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrograms();
  }, [upcomingOnly]);

  const handleViewProgram = (programId: string) => {
    // Handle viewing a specific training program
    router.push(`/training-programs/${programId}`);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="bg-gray-200 h-10 w-full"></div>

            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-5 bg-gray-300 rounded w-8"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                </div>
              </div>

              <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>

              <div className="flex justify-end">
                <div className="h-9 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load dashboard" />;
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No training programs found</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        loaded ? "loaded" : "loading"
      } grid md:grid-cols-1 lg:grid-cols-2 gap-6`}
    >
      {programs.map((program) => (
        <TrainingCard
          key={program.id}
          program={program}
          onView={handleViewProgram}
        />
      ))}
    </div>
  );
}
