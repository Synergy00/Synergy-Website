import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSessionCookie } from "@/lib/auth/adminSession";

export async function GET(request: NextRequest) {
  // 1. Verify admin session cookie (HMAC-signed)
  const isValid = await verifyAdminSessionCookie(request);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        code,
        status,
        created_at,
        lead_id,
        problem_statement_id,
        ppt_url,
        tech_stack,
        team_members (
          role,
          profiles (
            id,
            full_name,
            participant_id,
            college
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch teams via Admin API:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error("Exception during teams fetch:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
