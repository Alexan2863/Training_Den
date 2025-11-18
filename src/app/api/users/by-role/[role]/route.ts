import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";
import { VALID_ROLES } from "@/lib/types/users";

// GET /api/users/by-role/{role} - Get users by role (any authenticated user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { role } = await params;

  try {
    const supabase = await createClient();

    // Validate role
    if (!VALID_ROLES.includes(role as any)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role")
      .eq("role", role)
      .eq("is_active", true)
      .order("last_name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Transform to simple format for dropdowns
    const users = data.map((user) => ({
      id: user.id,
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
    }));

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in GET /api/users/by-role/[role]:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
