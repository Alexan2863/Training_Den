import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getProgramCount, getSessionCount } from "@/lib/services/stats";

export async function GET() {
  try {
    // Count employees (role='employee', is_active=true)
    const { count: employeesCount, error: employeesError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "employee")
      .eq("is_active", true);

    if (employeesError) {
      throw new Error(`Employees count failed: ${employeesError.message}`);
    }

    // Count managers (role='manager', is_active=true)
    const { count: managersCount, error: managersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "manager")
      .eq("is_active", true);

    if (managersError) {
      throw new Error(`Managers count failed: ${managersError.message}`);
    }

    // Count trainers (role='trainer', is_active=true)
    const { count: trainersCount, error: trainersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "trainer")
      .eq("is_active", true);

    if (trainersError) {
      throw new Error(`Trainers count failed: ${trainersError.message}`);
    }

    // Count active sessions
    const activeSessionsCount = await getSessionCount();

    // Count active programs
    const activeProgramsCount = await getProgramCount();

    // Return all counts
    return NextResponse.json({
      success: true,
      data: {
        employees: employeesCount ?? 0,
        managers: managersCount ?? 0,
        trainers: trainersCount ?? 0,
        activeSessions: activeSessionsCount,
        activePrograms: activeProgramsCount,
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
