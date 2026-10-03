import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ─── Admin Cookie HMAC Verification (Web Crypto — Edge-compatible) ────────────
// Middleware runs in the Edge runtime which does NOT support Node.js `crypto`.
// We use SubtleCrypto (Web Crypto API) which is available in Edge/browser/Node 18+.

async function verifyAdminCookie(cookieValue: string): Promise<boolean> {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-in-production";

  try {
    // Import the HMAC key using SubtleCrypto
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Compute expected signature
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSig.length) return false;
    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (diff !== 0) return false;

    // Check 8-hour expiry
    const raw = atob(payload); // atob is available in Edge runtime
    const session = JSON.parse(raw);
    if (Date.now() - session.authenticatedAt > 8 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { pathname } = request.nextUrl;
  const isLocalEnv = process.env.NODE_ENV === "development";
  const host = request.headers.get("host") || "";
  
  // In local dev, Next.js Edge runtime caches process.env across concurrently instances.
  // We use the port (3000 for public, 3001 for admin) to safely determine deployment type locally.
  const deploymentType = isLocalEnv 
    ? (host.includes("3001") ? "admin" : "public")
    : process.env.DEPLOYMENT_TYPE; // "public" | "admin" | undefined

  // ─── OAUTH CALLBACK FALLBACK ──────────────────────────────────────────────
  // If Supabase redirects to the root Site URL instead of /auth/callback due to configuration issues
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const code = request.nextUrl.searchParams.get("code");
    return NextResponse.redirect(new URL(`/auth/callback?code=${code}`, request.url));
  }

  // If the OAuth callback accidentally lands on the admin domain, bounce it over to the public domain
  if (deploymentType === "admin" && pathname === "/auth/callback" && request.nextUrl.searchParams.has("code")) {
    const code = request.nextUrl.searchParams.get("code");
    const next = request.nextUrl.searchParams.get("next") || "/dashboard";
    return NextResponse.redirect(`https://protohack.vercel.app/auth/callback?code=${code}&next=${next}`);
  }

  // ─── 0. DEPLOYMENT ISOLATION ──────────────────────────────────────────────
  // Public deployment: block ALL admin routes completely (return 404, not redirect)
  if (deploymentType === "public" && pathname.startsWith("/admin")) {
    return new NextResponse(null, { status: 404 });
  }

  // Admin deployment: block ALL public/participant routes
  if (deploymentType === "admin") {
    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/round-1") ||
      pathname.startsWith("/round-2") ||
      pathname.startsWith("/profile");

    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Also block admin API routes from being accessed on public deployment
    if (pathname.startsWith("/api/admin")) {
      // Allow on admin deployment — fall through to session check below
    }
  }

  // Block admin API routes on the public deployment entirely
  if (deploymentType === "public" && pathname.startsWith("/api/admin")) {
    return new NextResponse(null, { status: 404 });
  }

  // ─── 1. ADMIN ROUTE PROTECTION ────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSessionCookie = request.cookies.get("protohack_admin_session");

    // Full HMAC signature + expiry verification
    if (!adminSessionCookie?.value || !(await verifyAdminCookie(adminSessionCookie.value))) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("protohack_admin_session"); // Clear invalid/expired cookie
      return res;
    }
  }

  // ─── 2. PARTICIPANT ROUTE PROTECTION ──────────────────────────────────────
  const isParticipantRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/round-1") ||
    pathname.startsWith("/round-2") ||
    pathname.startsWith("/profile/complete");

  if (isParticipantRoute) {
    // Always enforce — regardless of NODE_ENV
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
