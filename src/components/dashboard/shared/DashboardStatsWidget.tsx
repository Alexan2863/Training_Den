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
    <div className={`${variantClasses[variant]} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-3xl font-bold mt-2 ${valueClasses[variant]}`}>
            {value}
          </p>
          <p className="text-sm font-medium text-foreground pt-1">{title}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center ${valueClasses[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
