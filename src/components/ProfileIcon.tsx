"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, signOut } from "../lib/auth";

// Get role-based colors
function getAvatarColors(role: AuthUser["role"]) {
  const colorMap: Record<
    AuthUser["role"],
    { bg: string; text: string }
  > = {
    admin: { bg: "bg-emerald-50", text: "text-emerald-800" },
    manager: { bg: "bg-rose-50", text: "text-rose-800" },
    trainer: { bg: "bg-fuchsia-50", text: "text-fuchsia-800" },
    employee: { bg: "bg-sky-50", text: "text-sky-800" },
  };
  return colorMap[role] || { bg: "bg-purple-50", text: "text-purple-800" };
}

// Get user initials
function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
}

// Sizes
const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
  xl: "w-16 h-16 text-2xl",
};

interface ProfileIconProps {
  user: AuthUser | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function ProfileIcon({ user, size = "md", className = "" }: ProfileIconProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = user ? getInitials(user.first_name, user.last_name) : "U";
  const avatarColors = user
    ? getAvatarColors(user.role)
    : { bg: "bg-purple-50", text: "text-purple-800" };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center justify-center rounded-full ${avatarColors.bg} ${avatarColors.text} font-regular ${sizeClasses[size]} ${className} cursor-pointer hover:opacity-80 transition-opacity`}
        aria-label="User menu"
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-50">
          {user && (
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-foreground">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-b-md transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(ProfileIcon);
