import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";
import TrainingProgramForm from "@/components/forms/TrainingProgramForm";

export default function TrainingPrograms() {
  return (
    <div className="p-4 w-full h-full max-w-7xl">
      <div className="flex items-center justify-center p-4">
        <TrainingProgramForm />
      </div>

      <div className="p-4">
        <TrainingProgramsWidget />
      </div>
    </div>
  );
}
