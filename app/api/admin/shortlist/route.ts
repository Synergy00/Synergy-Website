import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSessionCookie } from "@/lib/auth/adminSession";

const supabaseAdmin = createAdminClient();

export async function GET(request: NextRequest) {
  // Fetch all teams with submission fields for shortlisting page
  if (!verifyAdminSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: teams, error } = await supabaseAdmin
      .from("teams")
      .select(`
        id,
        name,
        code,
        status,
        problem_statement_id,
        ppt_url,
        tech_stack,
        created_at,
        team_members (
          role,
          profiles (
            full_name,
            college
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch teams for shortlisting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error("Exception during shortlist fetch:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { teamIds, status } = await request.json();

    if (!Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: "teamIds array is required" }, { status: 400 });
    }

    if (!["round1", "shortlisted"].includes(status)) {
      return NextResponse.json({ error: "status must be round1 or shortlisted" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("teams")
      .update({ status })
      .in("id", teamIds);

    if (error) {
      console.error("Failed to update team shortlist status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: teamIds.length });
  } catch (err: any) {
    console.error("Exception during shortlist update:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
