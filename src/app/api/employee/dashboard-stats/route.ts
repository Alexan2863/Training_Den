import { NextResponse } from "next/server";
import { getEmployeeDashboardStats } from "@/lib/services/stats";
import { requireRole, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";

export async function GET() {
  // Require employee role
  const authResult = await requireRole(["employee"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Get employee dashboard statistics
    const stats = await getEmployeeDashboardStats(user.id);

    return NextResponse.json(
      { success: true, data: stats },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Employee dashboard stats failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch employee dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
