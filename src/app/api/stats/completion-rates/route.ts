import { NextResponse } from "next/server";
import { getCompletionRates } from "@/lib/services/stats";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";

export async function GET() {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    // Get completion rate statistics
    const stats = await getCompletionRates();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Completion rates failed:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch completion rates.",
      },
      { status: 500 }
    );
  }
}
