import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // 0. Deployment Separation Logic
  const deploymentType = process.env.DEPLOYMENT_TYPE; // "public" or "admin"
  
  // If this is the public deployment, hide all admin routes
  if (deploymentType === "public" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // If this is the admin deployment, redirect public traffic to the admin portal
  if (deploymentType === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 1. Admin Route Protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSessionCookie = request.cookies.get("protohack_admin_session");
    if (!adminSessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Participant Protected Routes
  const isParticipantRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/round-1") ||
    pathname.startsWith("/round-2") ||
    pathname.startsWith("/profile/complete");

  if (isParticipantRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
