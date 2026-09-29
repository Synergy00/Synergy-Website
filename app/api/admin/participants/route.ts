import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  // 1. Verify admin session
  const adminSessionCookie = request.cookies.get("protohack_admin_session");
  if (!adminSessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
