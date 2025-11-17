import { User, UserDisplay } from "../types/users";

/**
 * Convert User to UserDisplay with computed fields
 */
export function toUserDisplay(user: User): UserDisplay {
  return {
    ...user,
    fullName: `${user.first_name} ${user.last_name}`,
    initials: `${user.first_name[0]}${user.last_name[0]}`.toUpperCase(),
  };
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (optional, basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}
