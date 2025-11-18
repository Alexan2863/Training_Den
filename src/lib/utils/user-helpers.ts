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
 * Validate phone format (optional, flexible validation)
 * Accepts various formats:
 * - 123-456-7890
 * - (123) 456-7890
 * - 123.456.7890
 * - 1234567890
 * - +1 123-456-7890
 * - +1-123-456-7890
 * Validates that phone contains 10 digits (optionally with +1 country code)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters except '+'
  const digitsOnly = phone.replace(/[^\d+]/g, "");

  // Check if it's 10 digits or 11 digits starting with +1
  if (digitsOnly.length === 10 && /^\d{10}$/.test(digitsOnly)) {
    return true;
  }

  if (digitsOnly.length === 11 && /^\+1\d{10}$/.test(digitsOnly)) {
    return true;
  }

  return false;
}
