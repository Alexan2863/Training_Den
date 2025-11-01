import { NextResponse } from "next/server";
import {
  getUserCountByRole,
  getProgramCount,
  getSessionCount,
} from "@/lib/services/stats";
import { requireRole, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";

export async function GET() {
  // Require admin role
  const authResult = await requireRole(["admin"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    // Count users by role using shared service function
    const adminsCount = await getUserCountByRole("admin");
    const employeesCount = await getUserCountByRole("employee");
    const managersCount = await getUserCountByRole("manager");
    const trainersCount = await getUserCountByRole("trainer");

    // Count active sessions
    const activeSessionsCount = await getSessionCount();

    // Count active programs
    const activeProgramsCount = await getProgramCount();

    // Return all counts
    return NextResponse.json({
      success: true,
      data: {
        admins: adminsCount,
        employees: employeesCount,
        managers: managersCount,
        trainers: trainersCount,
        activeSessions: activeSessionsCount,
        activePrograms: activeProgramsCount,
      },
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Dashboard stats failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
