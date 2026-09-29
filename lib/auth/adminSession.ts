import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE_NAME = "protohack_admin_session";

export interface AdminSession {
  adminId: string;
  authenticatedAt: number;
}

export function verifyAdminCredentials(adminId: string, password: string): boolean {
  const trimmedId = adminId.trim().toLowerCase();
  const trimmedPw = password.trim();

  // Support multiple admins via ADMIN_CREDENTIALS JSON env var
  // Format: [{"id":"admin1","hash":"bcrypt_hash"},{"id":"admin2","hash":"bcrypt_hash"}]
  const credentialsJson = process.env.ADMIN_CREDENTIALS;
  if (credentialsJson) {
    try {
      const accounts: { id: string; hash: string }[] = JSON.parse(credentialsJson);
      for (const account of accounts) {
        if (trimmedId === account.id.trim().toLowerCase()) {
          return bcrypt.compareSync(trimmedPw, account.hash);
        }
      }
      return false;
    } catch (err) {
      console.warn("Failed to parse ADMIN_CREDENTIALS:", err);
    }
  }

  // Fallback: single admin via ADMIN_ID + ADMIN_PASSWORD_HASH env vars
  const expectedId = process.env.ADMIN_ID || "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (trimmedId !== expectedId.trim().toLowerCase()) return false;
  if (passwordHash) {
    try {
      return bcrypt.compareSync(trimmedPw, passwordHash);
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
