"use client";

import { useParams, useRouter } from "next/navigation";
import TrainingProgramForm from "@/components/forms/TrainingProgramForm";

export default function EditTrainingProgramPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const handleSuccess = () => {
    // Navigate back to the program detail page after successful update
    // Add timestamp to force a fresh data fetch
    router.push(`/training-programs/${programId}?t=${Date.now()}`);
  };

  const handleCancel = () => {
    // Navigate back to the program detail page when cancelled
    router.push(`/training-programs/${programId}`);
  };

  return (
    <div className="w-full h-full p-6 overflow-y-scroll flex justify-center">
      <TrainingProgramForm
        programId={programId}
        initialOpen={true}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
