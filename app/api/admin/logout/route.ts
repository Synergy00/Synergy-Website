import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth/adminSession";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
