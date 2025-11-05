import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  canAccessProgram,
  getProgramDetailForRole,
} from "@/lib/services/training-programs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require authentication (any role)
  const authResult = await requireAuth();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;
  const programId = params.id;

  try {
    // Check authorization
    const hasAccess = await canAccessProgram(programId, user.id, user.role);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "You do not have permission to access this program.",
        },
        { status: 403 }
      );
    }

    // Get role-specific details
    const programDetail = await getProgramDetailForRole(
      programId,
      user.id,
      user.role
    );

    return NextResponse.json({
      success: true,
      data: programDetail,
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Training program detail fetch failed:", errorMessage);

    // Check if error is "not found"
    if (errorMessage.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: "Training program not found or inactive.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch training program details.",
      },
      { status: 500 }
    );
  }
}
