import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  const adminSessionCookie = request.cookies.get("protohack_admin_session");
  if (!adminSessionCookie?.value) {
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
