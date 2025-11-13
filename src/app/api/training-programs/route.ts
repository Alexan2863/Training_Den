import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";
import { getTrainingProgramCards } from "@/lib/services/training-programs";

export async function GET(request: Request) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Check for upcoming query parameter
    const { searchParams } = new URL(request.url);
    const upcomingOnly = searchParams.get("upcoming") === "true";

    // Get cards filtered by role
    const cards = await getTrainingProgramCards(user.id, user.role, upcomingOnly);

    return NextResponse.json({
      success: true,
      data: cards,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Training programs fetch failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch training programs.",
      },
      { status: 500 }
    );
  }
}
