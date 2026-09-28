import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/auth/adminSession";

// Simple IP attempt tracker for 5-attempt rate limiting
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const now = Date.now();

    const currentAttempt = loginAttempts.get(ip);
    if (currentAttempt && currentAttempt.lockedUntil > now) {
      const remainingSecs = Math.ceil((currentAttempt.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many failed attempts. Locked for ${remainingSecs} seconds.` },
        { status: 429 }
      );
    }

    const { adminId, password } = await req.json();

    if (!adminId || !password) {
      return NextResponse.json({ error: "Admin ID and password are required." }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(adminId, password);

    if (!isValid) {
      const prev = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      const newCount = prev.count + 1;
      if (newCount >= 5) {
        loginAttempts.set(ip, { count: 0, lockedUntil: now + 5 * 60 * 1000 }); // 5 min lockout
        return NextResponse.json(
          { error: "Too many failed attempts. Account locked for 5 minutes." },
          { status: 429 }
        );
      } else {
        loginAttempts.set(ip, { count: newCount, lockedUntil: 0 });
      }
      return NextResponse.json({ error: "Invalid Admin ID or password." }, { status: 401 });
    }

    // Success: reset attempts & set session cookie
    loginAttempts.delete(ip);
    await setAdminSession(adminId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error processing login." }, { status: 500 });
  }
}
