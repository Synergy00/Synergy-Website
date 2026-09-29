import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSessionCookie } from "@/lib/auth/adminSession";

const supabaseAdmin = createAdminClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verify admin session (full HMAC check)
  if (!verifyAdminSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = params.id;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    // 2. Delete team members first (foreign key constraint)
    const { error: memberError } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("team_id", teamId);

    if (memberError) {
      console.error("Failed to delete team members:", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // 3. Delete the team itself
    const { error: teamError } = await supabaseAdmin
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (teamError) {
      console.error("Failed to delete team:", teamError);
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception during team deletion:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
