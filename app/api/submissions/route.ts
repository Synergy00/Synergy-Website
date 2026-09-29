import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createServerSupabaseClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ppt_url, github_link } = await request.json();

    const { data: membership } = await supabaseAdmin
      .from("team_members")
      .select("team_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Not part of a team" }, { status: 403 });
    }

    const { data: settings } = await supabaseAdmin
      .from("event_settings")
      .select("round1_unlocked")
      .eq("id", 1)
      .single();

    if (!settings || !settings.round1_unlocked) {
      return NextResponse.json({ error: "Round 1 submissions are locked" }, { status: 403 });
    }

    // Save to DB
    const { error } = await supabaseAdmin
      .from("teams")
      .update({ 
        ppt_url: ppt_url,
        tech_stack: github_link // storing github link in tech_stack field as workaround
      })
      .eq("id", membership.team_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
