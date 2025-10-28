import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Count active sessions (is_active=true)
    const { count: activeSessionsCount, error: sessionsError } = await supabase
      .from("training_session")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (sessionsError) {
      throw new Error(`Active sessions count failed: ${sessionsError.message}`);
    }

    // Count active programs (is_active=true)
    const { count: activeProgramsCount, error: programsError } = await supabase
      .from("training_program")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (programsError) {
      throw new Error(`Active programs count failed: ${programsError.message}`);
    }

    // Return all counts
    return NextResponse.json({
      success: true,
      data: {
        employees: employeesCount ?? 0,
        managers: managersCount ?? 0,
        trainers: trainersCount ?? 0,
        activeSessions: activeSessionsCount ?? 0,
        activePrograms: activeProgramsCount ?? 0,
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
