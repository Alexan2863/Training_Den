import { NextResponse } from "next/server";
import { getCompletionRates } from "@/lib/services/stats";

export async function GET() {
  try {
    // Get completion rate statistics
    const stats = await getCompletionRates();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Completion rates failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch completion rates.",
      },
      { status: 500 }
    );
  }
}
