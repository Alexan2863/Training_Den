import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    //  Check users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role")
      .limit(5);

    if (usersError)
      throw new Error(`Users query failed: ${usersError.message}`);

    // Check training_program table
    const { data: programs, error: programsError } = await supabase
      .from("training_program")
      .select("id, title, created_at")
      .limit(3);

    if (programsError)
      throw new Error(`Programs query failed: ${programsError.message}`);

    // Check training_session table
    const { data: sessions, error: sessionsError } = await supabase
      .from("training_session")
      .select("id, session_datetime, duration_minutes")
      .limit(3);

    if (sessionsError)
      throw new Error(`Sessions query failed: ${sessionsError.message}`);

    // Check session_enrollment table
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("session_enrollment")
      .select("id, completed")
      .limit(3);

    if (enrollmentsError)
      throw new Error(`Enrollments query failed: ${enrollmentsError.message}`);

    // If we get here, everything worked
    return NextResponse.json({
      success: true,
      message: "Database connection successful! All tables accessible.",
      data: {
        users: users || [],
        programs: programs || [],
        sessions: sessions || [],
        enrollments: enrollments || [],
      },
      counts: {
        users: users?.length || 0,
        programs: programs?.length || 0,
        sessions: sessions?.length || 0,
        enrollments: enrollments?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message:
          "Database connection failed. Check your Supabase configuration.",
      },
      { status: 500 }
    );
  }
}
