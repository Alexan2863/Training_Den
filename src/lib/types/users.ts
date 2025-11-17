// Role type and constants
export type UserRole = "admin" | "manager" | "trainer" | "employee";

// Valid roles for validation
export const VALID_ROLES: readonly UserRole[] = [
  "admin",
  "manager",
  "trainer",
  "employee",
] as const;

// Role order for sorting (lower number = higher priority)
export const ROLE_ORDER: Record<UserRole, number> = {
  admin: 0,
  manager: 1,
  trainer: 2,
  employee: 3,
} as const;

// Base user type (matches database schema)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended user with computed properties
export interface UserDisplay extends User {
  fullName: string;
  initials: string;
}

// User for dropdowns/selects
export interface UserOption {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

// Form data for create/update
export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  password?: string; // Only for create
}
