import TrainingProgramsWidget from "@/components/training/TrainingProgramsWidget";

export default function TrainingPrograms() {
  return (
    <div className="p-4 w-full h-full max-w-7xl">
      <div className="flex items-center justify-center p-4">
        <button className="btn btn-primary">Create Training Program</button>
      </div>

      <div className="p-4">
        <TrainingProgramsWidget />
      </div>
    </div>
  );
}
