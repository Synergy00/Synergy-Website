import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function verifyAdmin(request: NextRequest): boolean {
  return !!(request.cookies.get("protohack_admin_session")?.value);
}

// GET — fetch all attendance records with team breakdown
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("round2_attendance")
      .select("*")
      .order("scanned_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also fetch all shortlisted teams with members for absent tracking
    const { data: teams, error: teamsErr } = await supabaseAdmin
      .from("teams")
      .select(`
        id, name, status,
        team_members (
          profile_id,
          role,
          profiles ( full_name, participant_id )
        )
      `)
      .eq("status", "shortlisted");

    if (teamsErr) return NextResponse.json({ error: teamsErr.message }, { status: 500 });

    return NextResponse.json({ attendance: data || [], teams: teams || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — mark attendance by scanning QR
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { profile_id, team_id } = await request.json();
    if (!profile_id || !team_id) {
      return NextResponse.json({ error: "profile_id and team_id are required" }, { status: 400 });
    }

    // Check if already marked
    const { data: existing } = await supabaseAdmin
      .from("round2_attendance")
      .select("id, scanned_at")
      .eq("profile_id", profile_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        already_marked: true,
        scanned_at: existing.scanned_at,
        message: "Attendance already marked for this participant.",
      });
    }

    // Fetch participant details
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, participant_id")
      .eq("id", profile_id)
      .single();

    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("name")
      .eq("id", team_id)
      .single();

    const { data, error } = await supabaseAdmin
      .from("round2_attendance")
      .insert({
        profile_id,
        team_id,
        participant_id: profile?.participant_id || "",
        full_name: profile?.full_name || "",
        team_name: team?.name || "",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, record: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove an attendance record
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { profile_id } = await request.json();
    const { error } = await supabaseAdmin
      .from("round2_attendance")
      .delete()
      .eq("profile_id", profile_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
