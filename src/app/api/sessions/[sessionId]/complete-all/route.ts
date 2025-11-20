import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// POST /api/sessions/{sessionId}/complete-all - Mark all enrollments in session as complete (trainers only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { sessionId } = await params;

  // Only trainers can mark enrollments complete
  if (requestingUser.role !== "trainer") {
    return NextResponse.json(
      {
        success: false,
        message: "Only trainers can mark enrollments as complete",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { notes } = body;

    // Verify the session exists and the trainer owns it
    const { data: session, error: sessionError } = await supabase
      .from("training_session")
      .select("id, trainer_id, program_id, is_active")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    // Verify the trainer owns this session
    if (session.trainer_id !== requestingUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only mark completions for your own sessions",
        },
        { status: 403 }
      );
    }

    // Get all enrollments for this session
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("session_enrollment")
      .select("id, completed")
      .eq("session_id", sessionId);

    if (enrollmentsError) {
      throw enrollmentsError;
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          updated: 0,
          already_completed: 0,
          message: "No enrollments found for this session",
        },
      });
    }

    // Filter to only incomplete enrollments
    const incompleteEnrollments = enrollments.filter((e) => !e.completed);
    const alreadyCompleted = enrollments.length - incompleteEnrollments.length;

    if (incompleteEnrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          updated: 0,
          already_completed: alreadyCompleted,
          message: "All enrollments already completed",
        },
      });
    }

    // Update all incomplete enrollments
    const completionDate = new Date().toISOString();
    const { data: updatedEnrollments, error: updateError } = await supabase
      .from("session_enrollment")
      .update({
        completed: true,
        completion_date: completionDate,
        notes: notes || null,
      })
      .in(
        "id",
        incompleteEnrollments.map((e) => e.id)
      )
      .select();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: updatedEnrollments?.length || 0,
        already_completed: alreadyCompleted,
        message: `Marked ${updatedEnrollments?.length || 0} enrollments as complete`,
      },
    });
  } catch (error) {
    console.error("Error bulk completing enrollments:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
