interface RoleBadgeProps {
  role: "admin" | "manager" | "trainer" | "employee";
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const roleStyles = {
    admin: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-800",
      label: "Admin",
    },
    manager: {
      bg: "bg-rose-50",
      border: "border-rose-300",
      text: "text-rose-800",
      label: "Manager",
    },
    trainer: {
      bg: "bg-fuchsia-50",
      border: "border-fuchsia-300",
      text: "text-fuchsia-800",
      label: "Trainer",
    },
    employee: {
      bg: "bg-sky-50",
      border: "border-sky-300",
      text: "text-sky-800",
      label: "Employee",
    },
  };

  const style = roleStyles[role];

  return (
    <span
      className={`
      ${style.bg}
      ${style.border}
      ${style.text}
      px-3 py-3
      border
      rounded-full
      text-sm
      font-medium
    `}
    >
      {style.label}
    </span>
  );
}
