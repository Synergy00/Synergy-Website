import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

const ADMIN_COOKIE_NAME = "protohack_admin_session";

export interface AdminSession {
  adminId: string;
  authenticatedAt: number;
}

// ─── HMAC Signing ─────────────────────────────────────────────────────────────
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-in-production";
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function buildCookieValue(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function parseCookieValue(value: string): AdminSession | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSig = signPayload(payload);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSig.length) return null;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) return null;

  try {
    const raw = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

// ─── Credential Verification ──────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

export async function verifyAdminCredentials(adminId: string, password: string): Promise<boolean> {
  const trimmedId = adminId.trim().toLowerCase();
  const trimmedPw = password.trim();

  // Hardcoded fallback credentials (as requested)
  if (trimmedId === "admin_1" && trimmedPw === "protohack2026admin1") return true;
  if (trimmedId === "admin_2" && trimmedPw === "protohack2026admin2") return true;
  if (trimmedId === "admin_synergy" && trimmedPw === "protohack2026admin") return true;

  // Create a server-side client with anon key (assuming admins table has public read or we use service role)
  // Actually, we must use the service role key to read password hashes, or make the table RLS open for reads.
  // It's safer to use the service role key.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, password_hash")
      .eq("id", trimmedId)
      .single();

    if (error || !admin) {
      return false;
    }

    return bcrypt.compareSync(trimmedPw, admin.password_hash);
  } catch (err) {
    console.error("Failed to verify admin against database:", err);
    return false;
  }
}

// ─── Session Management ───────────────────────────────────────────────────────
export async function setAdminSession(adminId: string) {
  const sessionData: AdminSession = {
    adminId,
    authenticatedAt: Date.now(),
  };

  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, buildCookieValue(sessionData), {
    httpOnly: true,
    secure: true, // Always secure — admin portal is always production
    sameSite: "strict", // Upgraded from "lax" — prevents CSRF
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return null;

  const parsed = parseCookieValue(cookie.value);
  if (!parsed) return null;

  // Check 8-hour expiry
  if (Date.now() - parsed.authenticatedAt > 8 * 60 * 60 * 1000) {
    return null;
  }
  return parsed;
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// ─── Request-level Verification (for API routes) ──────────────────────────────
/**
 * Verifies the admin session cookie from a NextRequest object.
 * Performs full HMAC signature check + expiry check.
 * Use this in API route handlers instead of getAdminSession() which needs server component context.
 */
export function verifyAdminSessionCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return false;

  const parsed = parseCookieValue(cookie.value);
  if (!parsed) return false;

  // 8-hour expiry check
  if (Date.now() - parsed.authenticatedAt > 8 * 60 * 60 * 1000) return false;

  return true;
}
