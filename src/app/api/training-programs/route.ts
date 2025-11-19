import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";
import { getTrainingProgramCards } from "@/lib/services/training-programs";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Check for upcoming query parameter
    const { searchParams } = new URL(request.url);
    const upcomingOnly = searchParams.get("upcoming") === "true";

    // Get cards filtered by role
    const cards = await getTrainingProgramCards(user.id, user.role, upcomingOnly);

    return NextResponse.json({
      success: true,
      data: cards,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Training programs fetch failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch training programs.",
      },
      { status: 500 }
    );
  }
}

// POST /api/training-programs - Create new training program (admin only)
export async function POST(request: NextRequest) {
  // Require admin role
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { title, notes, manager_id, deadline, is_active, sessions } = body;

    // Validate required fields
    if (!title || !manager_id || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: title, manager_id, deadline",
        },
        { status: 400 }
      );
    }

    // Validate sessions array
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one session is required",
        },
        { status: 400 }
      );
    }

    // Validate each session
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      if (!session.session_datetime || !session.duration_minutes || !session.trainer_id) {
        return NextResponse.json(
          {
            success: false,
            message: `Session ${i + 1} is missing required fields`,
          },
          { status: 400 }
        );
      }
    }

    // Insert training program
    const now = new Date().toISOString();
    const { data: programData, error: programError } = await supabase
      .from("training_program")
      .insert({
        title,
        notes: notes || null,
        manager_id,
        deadline,
        is_active: is_active ?? true,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (programError) {
      console.error("Error creating training program:", programError);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create training program: ${programError.message}`,
        },
        { status: 500 }
      );
    }

    // Insert all sessions
    const sessionsToInsert = sessions.map((session: any) => ({
      program_id: programData.id,
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
      console.error("Error creating sessions:", sessionsError);
      // Rollback: delete the program if sessions fail
      await supabase
        .from("training_program")
        .delete()
        .eq("id", programData.id);

      return NextResponse.json(
        {
          success: false,
          message: `Failed to create sessions: ${sessionsError.message}`,
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
      message: "Training program created successfully",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error in POST /api/training-programs:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
