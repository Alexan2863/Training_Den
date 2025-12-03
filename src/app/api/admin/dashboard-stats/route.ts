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
    // Fetch all counts in parallel for better performance
    const [
      adminsCount,
      employeesCount,
      managersCount,
      trainersCount,
      activeSessionsCount,
      activeProgramsCount,
    ] = await Promise.all([
      getUserCountByRole("admin"),
      getUserCountByRole("employee"),
      getUserCountByRole("manager"),
      getUserCountByRole("trainer"),
      getSessionCount(),
      getProgramCount(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          admins: adminsCount,
          employees: employeesCount,
          managers: managersCount,
          trainers: trainersCount,
          activeSessions: activeSessionsCount,
          activePrograms: activeProgramsCount,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
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
