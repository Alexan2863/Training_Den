import { NextResponse } from "next/server";
import { createClient } from "../supabase/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "trainer" | "employee";
  phone?: string;
  is_active: boolean;
}

/**
 * Get the authenticated user from the request
 * Uses server-side Supabase client with cookies
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();

    // Get the authenticated user from Supabase session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get the user profile from the users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as AuthenticatedUser;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns the authenticated user or a 401 response
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser } | NextResponse
> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to access this resource.",
      },
      { status: 401 }
    );
  }

  if (!user.is_active) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message: "Your account is inactive.",
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Require specific role(s) for an API route
 * Returns the authenticated user or a 401/403 response
 */
export async function requireRole(
  allowedRoles: Array<"admin" | "manager" | "trainer" | "employee">
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth();

  // If requireAuth returned a NextResponse (error), pass it through
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message: "You do not have permission to access this resource.",
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Helper to check if auth result is an error response
 */
export function isAuthError(
  result: { user: AuthenticatedUser } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
