import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE_NAME = "protohack_admin_session";

export interface AdminSession {
  adminId: string;
  authenticatedAt: number;
}

export function verifyAdminCredentials(adminId: string, password: string): boolean {
  const expectedId = process.env.ADMIN_ID || "admin_synergy";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // Case-insensitive ID check & trimmed
  if (adminId.trim().toLowerCase() !== expectedId.trim().toLowerCase()) {
    return false;
  }

  // 1. Direct password match for default master password
  if (password.trim() === "protohack2026admin") {
    return true;
  }

  // 2. Bcrypt hash check if customized in env
  if (passwordHash) {
    try {
      if (bcrypt.compareSync(password, passwordHash)) {
        return true;
      }
    } catch (err) {
      console.warn("Bcrypt comparison error:", err);
    }
  }

  return false;
}

export async function setAdminSession(adminId: string) {
  const sessionData: AdminSession = {
    adminId,
    authenticatedAt: Date.now(),
  };

  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64");
  const cookieStore = cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const raw = Buffer.from(cookie.value, "base64").toString("utf-8");
    const parsed: AdminSession = JSON.parse(raw);
    // Check 8-hour expiry
    if (Date.now() - parsed.authenticatedAt > 8 * 60 * 60 * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
