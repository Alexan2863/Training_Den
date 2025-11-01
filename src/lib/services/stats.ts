import { createClient } from "../supabase/server";

/**
 * Get count of active users by role
 * @param role - The user role to count
 * @returns Count of active users with the specified role
 */
export async function getUserCountByRole(
  role: "admin" | "manager" | "trainer" | "employee"
) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", role)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to count ${role}s: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Get count of active training programs
 * @param filters - Optional filters (e.g., managerId to filter by manager)
 * @returns Count of active programs
 */
export async function getProgramCount(filters?: { managerId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("training_program")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Apply manager filter if provided
  if (filters?.managerId) {
    query = query.eq("manager_id", filters.managerId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get program count: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Get count of active training sessions
 * @param filters - Optional filters (e.g., trainerId to filter by trainer)
 * @returns Count of active sessions
 */
export async function getSessionCount(filters?: { trainerId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("training_session")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Apply trainer filter if provided
  if (filters?.trainerId) {
    query = query.eq("trainer_id", filters.trainerId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get session count: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Get completion rate statistics for training sessions
 * Single query optimization - fetches all enrollment completion statuses in one round-trip
 * @returns Completion rate data
 */
export async function getCompletionRates() {
  const supabase = await createClient();

  // Fetch all enrollment completion statuses in a single query
  const { data, error } = await supabase
    .from("session_enrollment")
    .select("completed");

  if (error) {
    throw new Error(`Failed to get enrollment data: ${error.message}`);
  }

  // Aggregate counts from the fetched data
  const total = data?.length ?? 0;
  const completed =
    data?.filter((enrollment) => enrollment.completed).length ?? 0;
  const rate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    rate: Math.round(rate * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Get employee dashboard statistics
 * @param userId - The employee's user ID
 * @returns Employee dashboard data including enrolled, overdue, completed, and available sessions
 */
export async function getEmployeeDashboardStats(userId: string) {
  const supabase = await createClient();

  // Get all enrollments for this employee with session details
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("session_enrollment")
    .select(
      `
      id,
      completed,
      training_session!inner(
        id,
        session_datetime,
        is_active
      )
    `
    )
    .eq("employee_id", userId);

  if (enrollmentError) {
    throw new Error(
      `Failed to get employee enrollments: ${enrollmentError.message}`
    );
  }

  const now = new Date();

  // Count total enrolled sessions (only active ones)
  const totalEnrolled =
    enrollments?.filter((e: any) => e.training_session.is_active).length ?? 0;

  // Count overdue sessions (not completed AND session date has passed)
  const overdue =
    enrollments?.filter(
      (e: any) =>
        !e.completed &&
        e.training_session.is_active &&
        new Date(e.training_session.session_datetime) < now
    ).length ?? 0;

  // Count completed sessions
  const completed =
    enrollments?.filter((e: any) => e.completed && e.training_session.is_active)
      .length ?? 0;

  // Get programs the employee is assigned to
  const { data: programAssignments, error: assignmentError } = await supabase
    .from("program_assignment")
    .select("program_id")
    .eq("employee_id", userId);

  if (assignmentError) {
    throw new Error(
      `Failed to get program assignments: ${assignmentError.message}`
    );
  }

  const assignedProgramIds =
    programAssignments?.map((pa: any) => pa.program_id) ?? [];

  // Get available sessions from assigned programs (excluding already enrolled sessions)
  let availableCount = 0;

  if (assignedProgramIds.length > 0) {
    // Get enrolled session IDs
    const enrolledSessionIds =
      enrollments?.map((e: any) => e.training_session.id) ?? [];

    // Query for available sessions
    const { data: allSessions, error: availableError } = await supabase
      .from("training_session")
      .select("id")
      .in("program_id", assignedProgramIds)
      .eq("is_active", true);

    if (availableError) {
      throw new Error(
        `Failed to get available sessions: ${availableError.message}`
      );
    }

    // Filter out enrolled sessions on the client side
    availableCount =
      allSessions?.filter(
        (session: any) => !enrolledSessionIds.includes(session.id)
      ).length ?? 0;
  }

  return {
    totalEnrolled,
    overdue,
    completed,
    available: availableCount,
  };
}
