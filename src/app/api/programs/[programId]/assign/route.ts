import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// POST /api/programs/{programId}/assign - Assign employee to program (managers only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { programId } = await params;

  // Only managers can assign employees
  if (requestingUser.role !== "manager") {
    return NextResponse.json(
      {
        success: false,
        message: "Only managers can assign employees to programs",
      },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { employeeId, notes } = body;

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Verify the program exists and the manager owns it
    const { data: program, error: programError } = await supabase
      .from("training_program")
      .select("id, manager_id, title, is_active")
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

    // Verify the manager owns this program
    if (program.manager_id !== requestingUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only assign employees to your own programs",
        },
        { status: 403 }
      );
    }

    // Verify the employee exists and is an employee role
    const { data: employee, error: employeeError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, is_active")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    if (employee.role !== "employee") {
      return NextResponse.json(
        {
          success: false,
          message: "Can only assign users with employee role",
        },
        { status: 400 }
      );
    }

    if (!employee.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot assign inactive employees",
        },
        { status: 400 }
      );
    }

    // Check if employee is already assigned
    const { data: existingAssignment } = await supabase
      .from("program_assignment")
      .select("id")
      .eq("program_id", programId)
      .eq("employee_id", employeeId)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee is already assigned to this program",
        },
        { status: 400 }
      );
    }

    // Create the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from("program_assignment")
      .insert({
        program_id: programId,
        employee_id: employeeId,
        assigned_by_manager_id: requestingUser.id,
        notes: notes || null,
      })
      .select()
      .single();

    if (assignmentError) {
      throw assignmentError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: assignment.id,
        employee: {
          id: employee.id,
          email: employee.email,
          first_name: employee.first_name,
          last_name: employee.last_name,
          fullName: `${employee.first_name} ${employee.last_name}`,
        },
        created_at: assignment.created_at,
      },
    });
  } catch (error) {
    console.error("Error assigning employee to program:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/{programId}/assign - Remove all assignments (managers only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user: requestingUser } = authResult;
  const { programId } = await params;

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

    // Get all assignments for this program
    const { data: assignments, error: assignmentsError } = await supabase
      .from("program_assignment")
      .select("id, employee_id")
      .eq("program_id", programId);

    if (assignmentsError) {
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          removed: 0,
          message: "No assignments to remove",
        },
      });
    }

    const employeeIds = assignments.map((a) => a.employee_id);

    // Get all sessions for this program
    const { data: sessions } = await supabase
      .from("training_session")
      .select("id")
      .eq("program_id", programId);

    const sessionIds = sessions?.map((s) => s.id) || [];

    // Delete session enrollments first (cascade)
    if (sessionIds.length > 0 && employeeIds.length > 0) {
      const { error: enrollmentsError } = await supabase
        .from("session_enrollment")
        .delete()
        .in("session_id", sessionIds)
        .in("employee_id", employeeIds);

      if (enrollmentsError) {
        throw enrollmentsError;
      }
    }

    // Delete all program assignments
    const { error: deleteError } = await supabase
      .from("program_assignment")
      .delete()
      .eq("program_id", programId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      data: {
        removed: assignments.length,
        message: `Successfully removed ${assignments.length} employee assignments`,
      },
    });
  } catch (error) {
    console.error("Error removing all assignments:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
