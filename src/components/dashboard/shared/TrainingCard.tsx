import { ProgramCard } from "@/lib/types/training-programs";
import { StudentIcon } from "@phosphor-icons/react";

interface TrainingCardProps {
  program: ProgramCard;
  onView: (programId: string) => void;
}

export default function TrainingCard({ program, onView }: TrainingCardProps) {
  const formattedDeadline = new Date(program.deadline).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="TrainingCardV1">
      <div className="deadline flex items-center rounded-t-lg rounded-b-none">
        <p>Deadline: {formattedDeadline}</p>
      </div>
      <div>
        <div className="flex items-center">
          <p className="font-bold p-4 pb-2 text-lg">{program.title}</p>

          <div className="flex ml-auto pr-5">
            <p className="text-xl pr-1">{program.enrollmentCount}</p>
            <StudentIcon weight="fill" size={32} />
          </div>
        </div>

        <p className="pl-5">{program.managerName}</p>
      </div>
      <div className="flex pr-4 pb-4">
        <button
          className="btn-secondary ml-auto"
          onClick={() => onView(program.id)}
        >
          View
        </button>
      </div>
    </div>
  );
}
