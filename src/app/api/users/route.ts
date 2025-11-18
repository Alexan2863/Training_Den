import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { toUserDisplay, isValidEmail } from "@/lib/utils/user-helpers";
import { getErrorMessage } from "@/lib/utils/errors";
import { VALID_ROLES, ROLE_ORDER } from "@/lib/types/users";

// GET /api/users - List all users (any authenticated user can view)
export async function GET(request: NextRequest) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const supabase = await createClient();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const isActive = searchParams.get("is_active");
    const search = searchParams.get("search");

    // Build query
    let query = supabase.from("users").select("*");

    // Apply filters
    if (role) {
      query = query.eq("role", role);
    }

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    if (search) {
      // Search in first_name, last_name, or email
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Transform to UserDisplay format and sort by role, then by name
    const users = data.map(toUserDisplay).sort((a, b) => {
      const roleComparison = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      if (roleComparison !== 0) return roleComparison;

      // Sort by last name, then by first name
      const lastNameComparison = a.last_name.localeCompare(b.last_name);
      if (lastNameComparison !== 0) return lastNameComparison;

      return a.first_name.localeCompare(b.first_name);
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in GET /api/users:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  // Require admin role
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, first_name, last_name, role, phone, password } = body;

    // Validate required fields
    if (!email || !first_name || !last_name || !role || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role,
          phone: phone || null,
        },
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        {
          success: false,
          message: authError.message,
        },
        { status: 400 }
      );
    }

    // Insert into users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user!.id,
        email,
        first_name,
        last_name,
        role,
        phone: phone || null,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user record:", userError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in POST /api/users:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
