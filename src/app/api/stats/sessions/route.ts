import { NextRequest, NextResponse } from "next/server";
import { getSessionCount } from "@/lib/services/stats";

export async function GET(request: NextRequest) {
  try {
    // Get optional trainerId from query params
    const searchParams = request.nextUrl.searchParams;
    const trainerId = searchParams.get("trainerId");

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
  } catch (error: any) {
    console.error("Session count failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch session count.",
      },
      { status: 500 }
    );
  }
}
