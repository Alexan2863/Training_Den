import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils/errors";

// POST /api/programs/{programId}/assign-all - Assign all available employees to program (managers only)
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
          message: "You can only assign employees to your own programs",
        },
        { status: 403 }
      );
    }

    // Get currently assigned employee IDs
    const { data: currentAssignments } = await supabase
      .from("program_assignment")
      .select("employee_id")
      .eq("program_id", programId);

    const assignedIds = currentAssignments?.map((a) => a.employee_id) || [];

    // Get all active employees
    let query = supabase
      .from("users")
      .select("id")
      .eq("role", "employee")
      .eq("is_active", true);

    // Exclude already assigned employees
    if (assignedIds.length > 0) {
      query = query.not("id", "in", `(${assignedIds.join(",")})`);
    }

    const { data: availableEmployees, error: employeesError } = await query;

    if (employeesError) {
      throw employeesError;
    }

    if (!availableEmployees || availableEmployees.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assigned: 0,
          message: "No available employees to assign",
        },
      });
    }

    // Create assignments for all available employees
    const assignments = availableEmployees.map((emp) => ({
      program_id: programId,
      employee_id: emp.id,
      assigned_by_manager_id: requestingUser.id,
      notes: null,
    }));

    const { data: createdAssignments, error: assignError } = await supabase
      .from("program_assignment")
      .insert(assignments)
      .select();

    if (assignError) {
      throw assignError;
    }

    return NextResponse.json({
      success: true,
      data: {
        assigned: createdAssignments?.length || 0,
        message: `Successfully assigned ${createdAssignments?.length || 0} employees`,
      },
    });
  } catch (error) {
    console.error("Error bulk assigning employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
