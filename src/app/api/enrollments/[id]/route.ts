import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// PATCH /api/enrollments/{id} - Mark enrollment as complete (trainers only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { id: enrollmentId } = await params;

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
    const { completed, notes } = body;

    // Validate that we're only allowing marking as complete (not unmarking)
    if (completed !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Can only mark enrollments as complete, not incomplete",
        },
        { status: 400 }
      );
    }

    // Get the enrollment and verify it exists
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("session_enrollment")
      .select(
        `
        id,
        session_id,
        employee_id,
        completed,
        completion_date,
        notes,
        training_session!inner(
          id,
          trainer_id,
          program_id
        )
      `
      )
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment not found",
        },
        { status: 404 }
      );
    }

    // Verify the trainer owns this session
    const session = enrollment.training_session as any;
    if (session.trainer_id !== requestingUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only mark completions for your own sessions",
        },
        { status: 403 }
      );
    }

    // Update the enrollment
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("session_enrollment")
      .update({
        completed: true,
        completion_date: new Date().toISOString(),
        notes: notes || enrollment.notes,
      })
      .eq("id", enrollmentId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
