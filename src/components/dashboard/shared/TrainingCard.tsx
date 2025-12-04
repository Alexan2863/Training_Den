import { ProgramCard } from "@/lib/types/training-programs";
import { StudentIcon } from "@phosphor-icons/react";

interface TrainingCardProps {
  program: ProgramCard;
  onView: (programId: string) => void;
}

export default function TrainingCard({ program, onView }: TrainingCardProps) {
  const deadlineDate = new Date(program.deadline);
  const datePart = deadlineDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timePart = deadlineDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const formattedDeadline = `${datePart} - ${timePart}`;

  return (
    <div className="TrainingCardV1">
      <div className="deadline flex items-center rounded-t-lg rounded-b-none">
        <p>Deadline: {formattedDeadline}</p>
      </div>
      <div>
        <div className="flex items-center">
          <p className="font-bold p-4 pb-2 text-md">{program.title}</p>

          <div className="flex ml-auto pr-5">
            <p className="text-lg pr-1">{program.enrollmentCount}</p>
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
