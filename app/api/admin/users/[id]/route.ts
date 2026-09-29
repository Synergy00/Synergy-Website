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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verify admin session
  const adminSessionCookie = request.cookies.get("protohack_admin_session");
  if (!adminSessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // 2. Explicitly delete from dependent tables to avoid ON DELETE RESTRICT foreign key constraint errors
    await supabaseAdmin.from("team_members").delete().eq("profile_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 3. Delete the user from auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Failed to delete user from Supabase Auth:", deleteUserError);
      return NextResponse.json(
        { error: deleteUserError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception during user deletion:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
