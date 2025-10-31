import { NextRequest, NextResponse } from "next/server";
import { getProgramCount } from "@/lib/services/stats";

export async function GET(request: NextRequest) {
  try {
    // Get optional managerId from query params
    const searchParams = request.nextUrl.searchParams;
    const managerId = searchParams.get("managerId");

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
