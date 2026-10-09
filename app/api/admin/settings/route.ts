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

function verifyAdmin(request: NextRequest): boolean {
  const adminSessionCookie = request.cookies.get("protohack_admin_session");
  return !!(adminSessionCookie?.value);
}

// GET: Fetch live settings from database
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Failed to fetch event settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Save settings to database
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Ensure ID is 1 for the single settings row
    payload.id = 1;

    // Let Supabase handle json/jsonb serialization automatically
    // No need to manually stringify server_clocks

    const { data, error } = await supabaseAdmin
      .from("event_settings")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to update event settings via Admin API:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    console.error("Exception during event settings update:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
