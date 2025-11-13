"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgramCard } from "@/lib/types/training-programs";
import { ErrorDisplay } from "../dashboard";
import TrainingCard from "../dashboard/shared/TrainingCard";

export default function TrainingProgramsWidget() {
  const [programs, setPrograms] = useState<ProgramCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch training programs from an API or data source
    async function fetchPrograms() {
      try {
        const response = await fetch("/api/training-programs");
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
  }, []);

  const handleViewProgram = (programId: string) => {
    // Handle viewing a specific training program
    router.push(`/training-programs/${programId}`);
  };

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load dashboard" />;
  }

  if (!programs) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
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
