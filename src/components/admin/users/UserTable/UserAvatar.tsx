interface UserAvatarProps {
  initials: string;
  role: "admin" | "manager" | "trainer" | "employee";
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({
  initials,
  role,
  size = "md",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const roleColors = {
    admin: "bg-emerald-100 text-emerald-800",
    manager: "bg-rose-100 text-rose-800",
    trainer: "bg-fuchsia-100 text-fuchsia-800",
    employee: "bg-sky-100 text-sky-800",
  };

  return (
    <div
      className={`
      ${sizeClasses[size]}
      ${roleColors[role]}
      rounded-full
      flex items-center justify-center
      font-semibold
    `}
    >
      {initials}
    </div>
  );
}
