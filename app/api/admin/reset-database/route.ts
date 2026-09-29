import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  // Block this endpoint entirely on the public deployment
  if (process.env.DEPLOYMENT_TYPE === "public") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Delete all team members
    await supabase.from("team_members").delete().neq("profile_id", "00000000-0000-0000-0000-000000000000");

    // 2. Delete all teams
    await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Delete all profiles
    await supabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 4. Delete all auth users (via Supabase Admin API)
    try {
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (usersData?.users) {
        for (const user of usersData.users) {
          await supabase.auth.admin.deleteUser(user.id);
        }
      }
    } catch (authErr) {
      console.warn("Auth users cleanup note:", authErr);
    }

    // 5. Reset Event Settings to defaults
    await supabase.from("event_settings").upsert({
      id: 1,
      countdown_label: "ROUND 1 STARTS IN",
      countdown_target: "2026-10-04T00:00:00+05:30",
      round1_unlocked: false,
      round2_open: true,
    });

    return NextResponse.json({
      success: true,
      message: "Database has been wiped and reset to a clean initial state.",
    });
  } catch (err: any) {
    console.error("Database reset error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to wipe database" },
      { status: 500 }
    );
  }
}
