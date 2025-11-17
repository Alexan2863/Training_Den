import { createClient } from "../supabase/server";
import type {
  ProgramCard,
  ProgramBase,
  ProgramSession,
  ProgramAssignment,
  EmployeeInfo,
  SessionEnrollmentInfo,
  AdminStats,
  TrainerStats,
  EmployeeStats,
  AdminProgramDetail,
  ManagerProgramDetail,
  TrainerProgramDetail,
  EmployeeProgramDetail,
  ProgramDetail,
} from "../types/training-programs";

/**
 * Get training program cards filtered by user role
 * @param userId - The authenticated user's ID
 * @param role - The user's role
 * @param upcomingOnly - If true, only return programs with deadlines within 2 weeks
 * @returns Array of program cards for widget display
 */
export async function getTrainingProgramCards(
  userId: string,
  role: "admin" | "manager" | "trainer" | "employee",
  upcomingOnly: boolean = false
): Promise<ProgramCard[]> {
  const supabase = await createClient();

  // Build base query with manager name join
  let query = supabase
    .from("training_program")
    .select(
      `
      id,
      title,
      deadline,
      is_active,
      manager:users(
        first_name,
        last_name
      )
    `
    )
    .eq("is_active", true);

  // Apply date filter if upcomingOnly is true
  if (upcomingOnly) {
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);
    query = query
      .gte("deadline", now.toISOString())
      .lte("deadline", twoWeeksFromNow.toISOString());
  }

  // Apply role-based filters
  if (role === "manager") {
    query = query.eq("manager_id", userId);
  } else if (role === "trainer") {
    // Get programs where user has sessions
    const { data: trainerSessions } = await supabase
      .from("training_session")
      .select("program_id")
      .eq("trainer_id", userId)
      .eq("is_active", true);

    const programIds = trainerSessions?.map((s) => s.program_id) ?? [];
    if (programIds.length === 0) {
      return [];
    }
    query = query.in("id", programIds);
  } else if (role === "employee") {
    // Get programs where user is assigned
    const { data: assignments } = await supabase
      .from("program_assignment")
      .select("program_id")
      .eq("employee_id", userId);

    const programIds = assignments?.map((a) => a.program_id) ?? [];
    if (programIds.length === 0) {
      return [];
    }
    query = query.in("id", programIds);
  }
  // Admin sees all active programs (no additional filter)

  const { data: programs, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch training programs: ${error.message}`);
  }

  if (!programs || programs.length === 0) {
    return [];
  }

  // Get enrollment counts for all programs
  const programIds = programs.map((p) => p.id);
  const { data: enrollmentCounts, error: countError } = await supabase
    .from("program_assignment")
    .select("program_id")
    .in("program_id", programIds);

  if (countError) {
    throw new Error(
      `Failed to fetch enrollment counts: ${countError.message}`
    );
  }

  // Count enrollments per program
  const countMap = new Map<string, number>();
  enrollmentCounts?.forEach((enrollment) => {
    const count = countMap.get(enrollment.program_id) || 0;
    countMap.set(enrollment.program_id, count + 1);
  });

  // Map to ProgramCard format
  return programs.map((program) => {
    const manager = program.manager as any;
    return {
      id: program.id.toString(),
      title: program.title,
      managerName: manager
        ? `${manager.first_name} ${manager.last_name}`
        : "Unknown",
      deadline: program.deadline,
      enrollmentCount: countMap.get(program.id) || 0,
    };
  });
}

/**
 * Check if user can access a specific program
 * @param programId - The program ID
 * @param userId - The user's ID
 * @param role - The user's role
 * @returns true if user can access, false otherwise
 */
export async function canAccessProgram(
  programId: string,
  userId: string,
  role: "admin" | "manager" | "trainer" | "employee"
): Promise<boolean> {
  const supabase = await createClient();

  // Admin can access any program
  if (role === "admin") {
    return true;
  }

  // Check if program exists and is active
  const { data: program, error: programError } = await supabase
    .from("training_program")
    .select("id, manager_id, is_active")
    .eq("id", programId)
    .single();

  if (programError || !program || !program.is_active) {
    return false;
  }

  // Manager can only access their own programs
  if (role === "manager") {
    return program.manager_id === userId;
  }

  // Trainer can access if they have sessions in this program
  if (role === "trainer") {
    const { data: sessions } = await supabase
      .from("training_session")
      .select("id")
      .eq("program_id", programId)
      .eq("trainer_id", userId)
      .eq("is_active", true)
      .limit(1);

    return (sessions?.length ?? 0) > 0;
  }

  // Employee can access if assigned to this program
  if (role === "employee") {
    const { data: assignments } = await supabase
      .from("program_assignment")
      .select("id")
      .eq("program_id", programId)
      .eq("employee_id", userId)
      .limit(1);

    return (assignments?.length ?? 0) > 0;
  }

  return false;
}

/**
 * Get base program details (common to all roles)
 * @param programId - The program ID
 * @returns Base program information with manager name
 */
export async function getProgramDetails(
  programId: string
): Promise<ProgramBase> {
  const supabase = await createClient();

  const { data: program, error } = await supabase
    .from("training_program")
    .select(
      `
      id,
      title,
      notes,
      manager_id,
      deadline,
      is_active,
      created_at,
      updated_at,
      manager:users(
        first_name,
        last_name
      )
    `
    )
    .eq("id", programId)
    .eq("is_active", true)
    .single();

  if (error || !program) {
    throw new Error(
      `Failed to fetch program details: ${error?.message || "Program not found"}`
    );
  }

  const manager = program.manager as any;
  return {
    id: program.id.toString(),
    title: program.title,
    notes: program.notes,
    manager_id: program.manager_id,
    managerName: manager
      ? `${manager.first_name} ${manager.last_name}`
      : "Unknown",
    deadline: program.deadline,
    is_active: program.is_active,
    created_at: program.created_at,
    updated_at: program.updated_at,
  };
}

/**
 * Get program sessions with role-specific filtering
 * @param programId - The program ID
 * @param role - The user's role
 * @param userId - The user's ID (required for trainer role to determine ownership)
 * @returns Array of sessions with trainer details
 */
export async function getProgramSessionsForRole(
  programId: string,
  role: "admin" | "manager" | "trainer" | "employee",
  userId?: string
): Promise<ProgramSession[]> {
  const supabase = await createClient();

  // Validate that userId is provided for trainer role
  if (role === "trainer" && !userId) {
    throw new Error("userId is required for trainer role");
  }

  const { data: sessions, error } = await supabase
    .from("training_session")
    .select(
      `
      id,
      program_id,
      trainer_id,
      session_datetime,
      duration_minutes,
      notes,
      is_active,
      trainer:users(
        first_name,
        last_name
      )
    `
    )
    .eq("program_id", programId)
    .eq("is_active", true)
    .order("session_datetime", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  if (!sessions) {
    return [];
  }

  return sessions.map((session) => {
    const trainer = session.trainer as any;
    return {
      id: session.id.toString(),
      program_id: session.program_id.toString(),
      trainer_id: session.trainer_id,
      trainerName: trainer
        ? `${trainer.first_name} ${trainer.last_name}`
        : null,
      session_datetime: session.session_datetime,
      duration_minutes: session.duration_minutes,
      notes: session.notes,
      is_active: session.is_active,
      isOwner: role === "trainer" ? session.trainer_id === userId : undefined,
    };
  });
}

/**
 * Get assigned employees for a program (Manager view)
 * @param programId - The program ID
 * @returns Array of program assignments with employee details
 */
export async function getAssignedEmployees(
  programId: string
): Promise<ProgramAssignment[]> {
  const supabase = await createClient();

  const { data: assignments, error } = await supabase
    .from("program_assignment")
    .select(
      `
      id,
      assigned_by_manager_id,
      notes,
      created_at,
      employee:users(
        id,
        email,
        first_name,
        last_name
      )
    `
    )
    .eq("program_id", programId);

  if (error) {
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }

  if (!assignments) {
    return [];
  }

  return assignments.map((assignment) => {
    const emp = assignment.employee as any;
    return {
      id: assignment.id,
      employee: {
        id: emp.id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        fullName: `${emp.first_name} ${emp.last_name}`,
      },
      assigned_by_manager_id: assignment.assigned_by_manager_id,
      notes: assignment.notes,
      created_at: assignment.created_at,
    };
  });
}

/**
 * Get available employees not yet assigned to program (Manager view)
 * @param programId - The program ID
 * @returns Array of unassigned employees
 */
export async function getAvailableEmployees(
  programId: string
): Promise<EmployeeInfo[]> {
  const supabase = await createClient();

  // Get currently assigned employee IDs
  const { data: assignments } = await supabase
    .from("program_assignment")
    .select("employee_id")
    .eq("program_id", programId);

  const assignedIds = assignments?.map((a) => a.employee_id) ?? [];

  // Get all active employees
  let query = supabase
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("role", "employee")
    .eq("is_active", true);

  // Exclude already assigned employees
  if (assignedIds.length > 0) {
    query = query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data: employees, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch available employees: ${error.message}`);
  }

  if (!employees) {
    return [];
  }

  return employees.map((emp) => ({
    id: emp.id,
    email: emp.email,
    first_name: emp.first_name,
    last_name: emp.last_name,
    fullName: `${emp.first_name} ${emp.last_name}`,
  }));
}

/**
 * Get session enrollments for a program (Admin/Trainer view)
 * @param programId - The program ID
 * @returns Array of enrollments across all sessions in program
 */
export async function getProgramEnrollments(
  programId: string
): Promise<SessionEnrollmentInfo[]> {
  const supabase = await createClient();

  // Use a join to get enrollments directly filtered by program_id through training_session
  // This eliminates the need for two separate queries
  const { data: enrollments, error } = await supabase
    .from("session_enrollment")
    .select(
      `
      id,
      session_id,
      completed,
      completion_date,
      notes,
      employee:users(
        id,
        email,
        first_name,
        last_name
      ),
      training_session!inner(
        program_id,
        is_active
      )
    `
    )
    .eq("training_session.program_id", programId)
    .eq("training_session.is_active", true);

  if (error) {
    throw new Error(`Failed to fetch enrollments: ${error.message}`);
  }

  if (!enrollments) {
    return [];
  }

  return enrollments.map((enrollment) => {
    const emp = enrollment.employee as any;
    return {
      id: enrollment.id,
      employee: {
        id: emp.id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        fullName: `${emp.first_name} ${emp.last_name}`,
      },
      session_id: enrollment.session_id.toString(),
      completed: enrollment.completed,
      completion_date: enrollment.completion_date,
      notes: enrollment.notes,
    };
  });
}

/**
 * Get employee's own enrollments for a program
 * @param programId - The program ID
 * @param employeeId - The employee's user ID
 * @returns Array of employee's enrollments in this program
 */
export async function getEmployeeEnrollments(
  programId: string,
  employeeId: string
): Promise<SessionEnrollmentInfo[]> {
  const supabase = await createClient();

  // Use a join to get enrollments directly filtered by program_id through training_session
  // This eliminates the need for two separate queries
  const { data: enrollments, error } = await supabase
    .from("session_enrollment")
    .select(
      `
      id,
      session_id,
      completed,
      completion_date,
      notes,
      employee:users(
        id,
        email,
        first_name,
        last_name
      ),
      training_session!inner(
        program_id,
        is_active
      )
    `
    )
    .eq("training_session.program_id", programId)
    .eq("training_session.is_active", true)
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to fetch employee enrollments: ${error.message}`);
  }

  if (!enrollments) {
    return [];
  }

  return enrollments.map((enrollment) => {
    const emp = enrollment.employee as any;
    return {
      id: enrollment.id,
      employee: {
        id: emp.id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        fullName: `${emp.first_name} ${emp.last_name}`,
      },
      session_id: enrollment.session_id.toString(),
      completed: enrollment.completed,
      completion_date: enrollment.completion_date,
      notes: enrollment.notes,
    };
  });
}

/**
 * Get admin statistics for a program
 * @param programId - The program ID
 * @returns Admin stats with total, completed, and overdue counts
 */
export async function getAdminStats(programId: string): Promise<AdminStats> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Use database aggregation to calculate stats in parallel
  const [totalEnrolledResult, completedResult, overdueResult] =
    await Promise.all([
      // Total enrolled (program assignments)
      supabase
        .from("program_assignment")
        .select("*", { count: "exact", head: true })
        .eq("program_id", programId),

      // Completed enrollments: join with training_session and count where completed=true
      supabase
        .from("session_enrollment")
        .select("*, training_session!inner(program_id)", {
          count: "exact",
          head: true,
        })
        .eq("training_session.program_id", programId)
        .eq("training_session.is_active", true)
        .eq("completed", true),

      // Overdue enrollments: not completed AND session datetime has passed
      supabase
        .from("session_enrollment")
        .select("*, training_session!inner(program_id, session_datetime)", {
          count: "exact",
          head: true,
        })
        .eq("training_session.program_id", programId)
        .eq("training_session.is_active", true)
        .eq("completed", false)
        .lt("training_session.session_datetime", now),
    ]);

  return {
    totalEnrolled: totalEnrolledResult.count ?? 0,
    completed: completedResult.count ?? 0,
    overdue: overdueResult.count ?? 0,
  };
}

/**
 * Get trainer statistics for a program
 * @param programId - The program ID
 * @returns Trainer stats with total and completed counts
 */
export async function getTrainerStats(
  programId: string
): Promise<TrainerStats> {
  const supabase = await createClient();

  // Get all sessions for this program
  const { data: sessions } = await supabase
    .from("training_session")
    .select("id")
    .eq("program_id", programId)
    .eq("is_active", true);

  const sessionIds = sessions?.map((s) => s.id) ?? [];

  if (sessionIds.length === 0) {
    return {
      totalEnrolled: 0,
      completed: 0,
    };
  }

  // Get all enrollments
  const { data: enrollments } = await supabase
    .from("session_enrollment")
    .select("completed")
    .in("session_id", sessionIds);

  const totalEnrolled = enrollments?.length ?? 0;
  const completed = enrollments?.filter((e) => e.completed).length ?? 0;

  return {
    totalEnrolled,
    completed,
  };
}

/**
 * Get employee statistics for a program
 * @param programId - The program ID
 * @param employeeId - The employee's user ID
 * @returns Employee stats with enrolled, completed, and available counts
 */
export async function getEmployeeStats(
  programId: string,
  employeeId: string
): Promise<EmployeeStats> {
  const supabase = await createClient();

  // Get all sessions for this program
  const { data: sessions } = await supabase
    .from("training_session")
    .select("id")
    .eq("program_id", programId)
    .eq("is_active", true);

  const sessionIds = sessions?.map((s) => s.id) ?? [];
  const totalSessions = sessionIds.length;

  if (totalSessions === 0) {
    return {
      enrolled: 0,
      completed: 0,
      available: 0,
    };
  }

  // Get employee's enrollments
  const { data: enrollments } = await supabase
    .from("session_enrollment")
    .select("completed")
    .in("session_id", sessionIds)
    .eq("employee_id", employeeId);

  const enrolled = enrollments?.length ?? 0;
  const completed = enrollments?.filter((e) => e.completed).length ?? 0;
  const available = totalSessions - enrolled;

  return {
    enrolled,
    completed,
    available,
  };
}

/**
 * Get complete program details for admin role
 * @param programId - The program ID
 * @returns Admin program detail with all data
 */
export async function getAdminProgramDetail(
  programId: string
): Promise<AdminProgramDetail> {
  const [base, sessions, enrolledEmployees, stats] = await Promise.all([
    getProgramDetails(programId),
    getProgramSessionsForRole(programId, "admin"),
    getProgramEnrollments(programId),
    getAdminStats(programId),
  ]);

  return {
    ...base,
    sessions,
    enrolledEmployees,
    stats,
  };
}

/**
 * Get complete program details for manager role
 * @param programId - The program ID
 * @returns Manager program detail with assignment data
 */
export async function getManagerProgramDetail(
  programId: string
): Promise<ManagerProgramDetail> {
  const [base, assignedEmployees, availableEmployees] = await Promise.all([
    getProgramDetails(programId),
    getAssignedEmployees(programId),
    getAvailableEmployees(programId),
  ]);

  return {
    ...base,
    assignedEmployees,
    availableEmployees,
  };
}

/**
 * Get complete program details for trainer role
 * @param programId - The program ID
 * @param trainerId - The trainer's user ID
 * @returns Trainer program detail with sessions and enrollments
 */
export async function getTrainerProgramDetail(
  programId: string,
  trainerId: string
): Promise<TrainerProgramDetail> {
  const [base, sessions, enrolledEmployees, stats] = await Promise.all([
    getProgramDetails(programId),
    getProgramSessionsForRole(programId, "trainer", trainerId),
    getProgramEnrollments(programId),
    getTrainerStats(programId),
  ]);

  return {
    ...base,
    sessions,
    enrolledEmployees,
    stats,
  };
}

/**
 * Get complete program details for employee role
 * @param programId - The program ID
 * @param employeeId - The employee's user ID
 * @returns Employee program detail with sessions and personal enrollments
 */
export async function getEmployeeProgramDetail(
  programId: string,
  employeeId: string
): Promise<EmployeeProgramDetail> {
  const [base, sessions, myEnrollments, stats] = await Promise.all([
    getProgramDetails(programId),
    getProgramSessionsForRole(programId, "employee"),
    getEmployeeEnrollments(programId, employeeId),
    getEmployeeStats(programId, employeeId),
  ]);

  return {
    ...base,
    sessions,
    myEnrollments,
    stats,
  };
}

/**
 * Get role-appropriate program details
 * @param programId - The program ID
 * @param userId - The user's ID
 * @param role - The user's role
 * @returns Role-specific program details
 */
export async function getProgramDetailForRole(
  programId: string,
  userId: string,
  role: "admin" | "manager" | "trainer" | "employee"
): Promise<ProgramDetail> {
  switch (role) {
    case "admin":
      return getAdminProgramDetail(programId);
    case "manager":
      return getManagerProgramDetail(programId);
    case "trainer":
      return getTrainerProgramDetail(programId, userId);
    case "employee":
      return getEmployeeProgramDetail(programId, userId);
    default:
      // TypeScript's exhaustiveness check ensures this is unreachable
      const _exhaustiveCheck: never = role;
      throw new Error(`Invalid role: ${_exhaustiveCheck}`);
  }
}
