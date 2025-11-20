import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// POST /api/sessions/{sessionId}/enroll - Enroll in session (employees only)
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

  // Only employees can enroll in sessions
  if (requestingUser.role !== "employee") {
    return NextResponse.json(
      {
        success: false,
        message: "Only employees can enroll in sessions",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { notes } = body;

    // Verify the session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from("training_session")
      .select("id, program_id, trainer_id, session_datetime, is_active")
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

    if (!session.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot enroll in inactive session",
        },
        { status: 400 }
      );
    }

    // Verify the employee is assigned to this program
    const { data: assignment, error: assignmentError } = await supabase
      .from("program_assignment")
      .select("id")
      .eq("program_id", session.program_id)
      .eq("employee_id", requestingUser.id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be assigned to this program to enroll in sessions",
        },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("session_enrollment")
      .select("id")
      .eq("session_id", sessionId)
      .eq("employee_id", requestingUser.id)
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already enrolled in this session",
        },
        { status: 400 }
      );
    }

    // Create the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("session_enrollment")
      .insert({
        session_id: sessionId,
        employee_id: requestingUser.id,
        completed: false,
        completion_date: null,
        notes: notes || null,
      })
      .select()
      .single();

    if (enrollmentError) {
      throw enrollmentError;
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Error enrolling in session:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/{sessionId}/enroll - Unenroll from session (employees only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { sessionId } = await params;

  // Only employees can unenroll from sessions
  if (requestingUser.role !== "employee") {
    return NextResponse.json(
      {
        success: false,
        message: "Only employees can unenroll from sessions",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();

    // Find the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("session_enrollment")
      .select("id, completed, session_id, employee_id")
      .eq("session_id", sessionId)
      .eq("employee_id", requestingUser.id)
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

    // Prevent unenrolling from completed sessions
    if (enrollment.completed) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot unenroll from completed sessions",
        },
        { status: 400 }
      );
    }

    // Delete the enrollment
    const { error: deleteError } = await supabase
      .from("session_enrollment")
      .delete()
      .eq("id", enrollment.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from session",
    });
  } catch (error) {
    console.error("Error unenrolling from session:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
