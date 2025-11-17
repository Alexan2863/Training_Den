import { createClient } from "./supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "trainer" | "employee";
  phone?: string;
}

// Sign up
export async function signUp(
  email: string,
  password: string,
  userData: {
    first_name: string;
    last_name: string;
    role?: "admin" | "manager" | "trainer" | "employee";
    phone?: string;
  }
) {
  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Set user metadata on signup so it's cached in session
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || "employee",
          phone: userData.phone,
          is_active: true,
        },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || "employee",
        phone: userData.phone,
        // is_active: true, default value set in the database
      });

      if (profileError) throw profileError;
    }

    return { user: authData.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

// Sign in
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Note: We no longer update session metadata here to reduce sign-in latency.
    // Authorization checks always validate against the database in getAuthenticatedUser()
    // to prevent privilege escalation from stale metadata.

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

// Sign out
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    // Always query database to get current user data
    // This ensures we have up-to-date role and status information
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, phone")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return null;

    return profile as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}
