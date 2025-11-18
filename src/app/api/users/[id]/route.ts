import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";
import { VALID_ROLES } from "@/lib/types/users";

// GET /api/users/{id} - Get single user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { id } = await params;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in GET /api/users/[id]:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/{id} - Update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { first_name, last_name, role, phone, is_active } = body;

    // Prevent admin from modifying their own role or deactivating themselves
    if (id === user.id) {
      if (role !== undefined && role !== user.role) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot change your own role",
          },
          { status: 403 }
        );
      }
      if (is_active === false) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot deactivate your own account",
          },
          { status: 403 }
        );
      }
    }

    // Build update object (only include provided fields)
    const updates: any = { updated_at: new Date().toISOString() };

    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (role !== undefined) {
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
      updates.role = role;
    }
    if (phone !== undefined) updates.phone = phone;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in PATCH /api/users/[id]:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/{id} - Soft delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  // Prevent admin from deactivating their own account
  if (id === user.id) {
    return NextResponse.json(
      {
        success: false,
        message: "You cannot deactivate your own account",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from("users")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
      data: { id: data.id, is_active: false },
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in DELETE /api/users/[id]:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
