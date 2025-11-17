// Base user type (matches database schema)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "trainer" | "employee";
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
  role: "admin" | "manager" | "trainer" | "employee";
  phone?: string;
  password?: string; // Only for create
}
