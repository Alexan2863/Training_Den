import { ReactNode } from "react";

interface DashboardStatsWidgetProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: ReactNode;
  variant?: "emerald" | "rose" | "fuchsia" | "sky" | "default";
}

export default function DashboardStatsWidget({
  title,
  value,
  description,
  icon,
  variant = "default",
}: DashboardStatsWidgetProps) {
  const variantClasses = {
    emerald: "bg-emerald-50 shadow-lg",
    rose: "bg-rose-50 shadow-lg",
    fuchsia: "bg-fuchsia-50 shadow-lg",
    sky: "bg-sky-50 shadow-lg",
    default: "bg-[#fafbff] shadow-lg",
  };

  const valueClasses = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    fuchsia: "text-fuchsia-600",
    sky: "text-sky-600",
    default: "text-foreground",
  };

  return (
    <div className={`${variantClasses[variant]} rounded-lg p-4 sm:p-6 shadow-lg`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${valueClasses[variant]}`}>
            {value}
          </p>
          <p className="text-xs sm:text-sm font-medium text-foreground pt-1 truncate">{title}</p>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center flex-shrink-0 ${valueClasses[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
