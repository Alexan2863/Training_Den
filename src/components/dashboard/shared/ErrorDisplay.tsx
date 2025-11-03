import { getErrorMessage } from "@/lib/utils/errors";

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
}

export default function ErrorDisplay({ error, title }: ErrorDisplayProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      {title && (
        <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      )}
      <p className="text-red-600">{errorMessage}</p>
    </div>
  );
}
