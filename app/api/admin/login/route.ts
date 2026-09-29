import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/auth/adminSession";

// Removed IP attempt tracker for rate limiting as requested

export async function POST(req: NextRequest) {
  // Block this endpoint entirely on the public deployment
  if (process.env.DEPLOYMENT_TYPE === "public") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const now = Date.now();

    const { adminId, password } = await req.json();

    if (!adminId || !password) {
      return NextResponse.json({ error: "Admin ID and password are required." }, { status: 400 });
    }

    const isValid = await verifyAdminCredentials(adminId, password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Admin ID or password." }, { status: 401 });
    }

    // Success: set session cookie
    await setAdminSession(adminId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error processing login." }, { status: 500 });
  }
}
