import { NextRequest, NextResponse } from "next/server";
import { getSessionCount } from "@/lib/services/stats";
import { requireRole, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  // Require admin or trainer role
  const authResult = await requireRole(["admin", "trainer"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Get optional trainerId from query params
    const searchParams = request.nextUrl.searchParams;
    const trainerId = searchParams.get("trainerId");

    // Authorization check: trainers can only access their own data
    if (user.role === "trainer") {
      if (!trainerId) {
        return NextResponse.json(
          {
            success: false,
            error: "Bad Request",
            message: "Trainers must provide a trainerId parameter.",
          },
          { status: 400 }
        );
      }

      if (trainerId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "You can only access your own session data.",
          },
          { status: 403 }
        );
      }
    }

    // Call service function with optional filter
    const count = await getSessionCount(
      trainerId ? { trainerId } : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        activeSessions: count,
      },
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Session count failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch session count.",
      },
      { status: 500 }
    );
  }
}
