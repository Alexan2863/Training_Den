"use client";

import { useState, useEffect } from "react";
import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";
import TrainingProgramForm from "@/components/forms/TrainingProgramForm";
import { useUser } from "@/components/UserProvider";

export default function TrainingPrograms() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    // Simulate initial load to show skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleProgramCreated = () => {
    // Increment refresh trigger to refetch programs
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="p-4 w-full h-full max-w-7xl">
        <div className="animate-pulse">
          {/* Button skeleton */}
          <div className="flex items-center justify-center p-4">
            <div className="h-10 bg-gray-300 rounded w-48"></div>
          </div>

          {/* Programs grid skeleton */}
          <div className="p-4">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-200 h-10 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full max-w-7xl">
      {user?.role === "admin" && (
        <div className="flex items-center justify-center p-4">
          <TrainingProgramForm onSuccess={handleProgramCreated} />
        </div>
      )}

      <div className="p-4">
        <TrainingProgramsWidget refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
