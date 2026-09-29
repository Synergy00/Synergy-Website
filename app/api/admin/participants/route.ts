import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSessionCookie } from "@/lib/auth/adminSession";

export async function GET(request: NextRequest) {
  // 1. Verify admin session (full HMAC check)
  if (!verifyAdminSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        participant_id,
        full_name,
        reg_no,
        college,
        branch,
        department,
        section,
        contact,
        email,
        created_at,
        team_members (
          role,
          teams (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch participants via Admin API:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles });
  } catch (err: any) {
    console.error("Exception during participants fetch:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
