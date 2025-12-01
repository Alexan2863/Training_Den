import { NextResponse } from "next/server";
import { getUpcomingEnrolledSessions } from "@/lib/services/stats";
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
    // Get upcoming enrolled sessions for this employee
    const sessions = await getUpcomingEnrolledSessions(user.id);

    return NextResponse.json(
      { success: true, data: sessions },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Upcoming sessions fetch failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch upcoming sessions.",
      },
      { status: 500 }
    );
  }
}
