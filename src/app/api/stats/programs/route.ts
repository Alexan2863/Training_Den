import { NextRequest, NextResponse } from "next/server";
import { getProgramCount } from "@/lib/services/stats";
import { requireRole, isAuthError } from "@/lib/auth/api";

export async function GET(request: NextRequest) {
  // Require admin or manager role
  const authResult = await requireRole(["admin", "manager"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Get optional managerId from query params
    const searchParams = request.nextUrl.searchParams;
    const managerId = searchParams.get("managerId");

    // Authorization check: managers can only access their own data
    if (user.role === "manager") {
      if (!managerId) {
        return NextResponse.json(
          {
            success: false,
            error: "Bad Request",
            message: "Managers must provide a managerId parameter.",
          },
          { status: 400 }
        );
      }

      if (managerId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "You can only access your own program data.",
          },
          { status: 403 }
        );
      }
    }

    // Call service function with optional filter
    const count = await getProgramCount(
      managerId ? { managerId } : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        activePrograms: count,
      },
    });
  } catch (error: any) {
    console.error("Program count failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch program count.",
      },
      { status: 500 }
    );
  }
}
