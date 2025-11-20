import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// DELETE /api/programs/{programId}/assign/{employeeId} - Remove employee assignment with cascade (managers only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string; employeeId: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { programId, employeeId } = await params;

  // Only managers can remove assignments
  if (requestingUser.role !== "manager") {
    return NextResponse.json(
      {
        success: false,
        message: "Only managers can remove employee assignments",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();

    // Verify the program exists and the manager owns it
    const { data: program, error: programError } = await supabase
      .from("training_program")
      .select("id, manager_id")
      .eq("id", programId)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        {
          success: false,
          message: "Program not found",
        },
        { status: 404 }
      );
    }

    if (program.manager_id !== requestingUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only manage your own programs",
        },
        { status: 403 }
      );
    }

    // Verify the assignment exists
    const { data: assignment, error: assignmentError } = await supabase
      .from("program_assignment")
      .select("id")
      .eq("program_id", programId)
      .eq("employee_id", employeeId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found",
        },
        { status: 404 }
      );
    }

    // Get all sessions for this program
    const { data: sessions } = await supabase
      .from("training_session")
      .select("id")
      .eq("program_id", programId);

    const sessionIds = sessions?.map((s) => s.id) || [];

    // Delete session enrollments first (cascade)
    if (sessionIds.length > 0) {
      const { error: enrollmentsError } = await supabase
        .from("session_enrollment")
        .delete()
        .in("session_id", sessionIds)
        .eq("employee_id", employeeId);

      if (enrollmentsError) {
        throw enrollmentsError;
      }
    }

    // Delete the program assignment
    const { error: deleteError } = await supabase
      .from("program_assignment")
      .delete()
      .eq("id", assignment.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Employee removed from program",
    });
  } catch (error) {
    console.error("Error removing employee assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
