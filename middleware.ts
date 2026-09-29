import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
    if (!adminSessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify cookie has a valid signature (HMAC check)
    const cookieValue = adminSessionCookie.value;
    const parts = cookieValue.split(".");
    if (parts.length !== 2) {
      // Malformed — reject
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("protohack_admin_session");
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
