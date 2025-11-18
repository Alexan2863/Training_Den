import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  canAccessProgram,
  getProgramDetailForRole,
} from "@/lib/services/training-programs";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;
  const { id: programId } = await params;

  try {
    // Check authorization
    const hasAccess = await canAccessProgram(programId, user.id, user.role);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to access this program.",
        },
        { status: 403 }
      );
    }

    // Get role-specific details
    const programDetail = await getProgramDetailForRole(
      programId,
      user.id,
      user.role
    );

    return NextResponse.json({
      success: true,
      data: programDetail,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Training program detail fetch failed:", errorMessage);

    // Check if error is "not found"
    if (errorMessage.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          message: "Training program not found or inactive.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch training program details.",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/training-programs/[id] - Update training program (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin role
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { id: programId } = await params;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { title, notes, manager_id, deadline, is_active, sessions } = body;

    const now = new Date().toISOString();

    // Update training program
    const { data: programData, error: programError } = await supabase
      .from("training_program")
      .update({
        title,
        notes: notes || null,
        manager_id,
        deadline,
        is_active: is_active ?? true,
        updated_at: now,
      })
      .eq("id", programId)
      .select()
      .single();

    if (programError) {
      console.error("Error updating training program:", programError);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update training program: ${programError.message}`,
        },
        { status: 500 }
      );
    }

    // Handle sessions update if provided
    if (sessions && Array.isArray(sessions)) {
      // Delete existing sessions for this program
      const { error: deleteError } = await supabase
        .from("training_session")
        .delete()
        .eq("program_id", programId);

      if (deleteError) {
        console.error("Error deleting old sessions:", deleteError);
        return NextResponse.json(
          {
            success: false,
            message: `Failed to update sessions: ${deleteError.message}`,
          },
          { status: 500 }
        );
      }

      // Insert new sessions
      const sessionsToInsert = sessions.map((session: any) => ({
        program_id: programId,
        session_datetime: session.session_datetime,
        duration_minutes: session.duration_minutes,
        trainer_id: session.trainer_id,
        notes: session.notes || null,
        is_active: session.is_active ?? true,
        created_at: now,
        updated_at: now,
      }));

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("training_session")
        .insert(sessionsToInsert)
        .select();

      if (sessionsError) {
        console.error("Error creating new sessions:", sessionsError);
        return NextResponse.json(
          {
            success: false,
            message: `Failed to update sessions: ${sessionsError.message}`,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          program: programData,
          sessions: sessionsData,
        },
        message: "Training program updated successfully",
      });
    }

    return NextResponse.json({
      success: true,
      data: programData,
      message: "Training program updated successfully",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in PATCH /api/training-programs/[id]:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
