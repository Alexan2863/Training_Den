import { supabase } from "../supabase";

/**
 * Get count of active training programs
 * @param filters - Optional filters (e.g., managerId to filter by manager)
 * @returns Count of active programs
 */
export async function getProgramCount(filters?: { managerId?: string }) {
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
 * @returns Completion rate data
 */
export async function getCompletionRates() {
  // Get total enrollments
  const { count: totalEnrollments, error: totalError } = await supabase
    .from("session_enrollment")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    throw new Error(`Failed to get total enrollments: ${totalError.message}`);
  }

  // Get completed enrollments
  const { count: completedEnrollments, error: completedError } = await supabase
    .from("session_enrollment")
    .select("*", { count: "exact", head: true })
    .eq("completed", true);

  if (completedError) {
    throw new Error(
      `Failed to get completed enrollments: ${completedError.message}`
    );
  }

  const total = totalEnrollments ?? 0;
  const completed = completedEnrollments ?? 0;
  const rate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    rate: Math.round(rate * 100) / 100, // Round to 2 decimal places
  };
}
