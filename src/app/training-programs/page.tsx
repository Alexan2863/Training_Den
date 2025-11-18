"use client";

import { useState } from "react";
import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";
import TrainingProgramForm from "@/components/forms/TrainingProgramForm";

export default function TrainingPrograms() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProgramCreated = () => {
    // Increment refresh trigger to refetch programs
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4 w-full h-full max-w-7xl">
      <div className="flex items-center justify-center p-4">
        <TrainingProgramForm onSuccess={handleProgramCreated} />
      </div>

      <div className="p-4">
        <TrainingProgramsWidget refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
