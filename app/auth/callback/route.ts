import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  // Use the forwarded host header to build the correct origin in production (fixes http vs https mismatch)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth?error=Authentication+failed`);
  }

  // Build response early so we can attach cookies to it
  let redirectUrl = `${baseUrl}${next}`;
  let response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // This is critical: sets cookies directly on the response object
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth exchange error:", error.message);
    return NextResponse.redirect(`${baseUrl}/auth?error=Authentication+failed`);
  }

  // Check if user already has a profile to decide where to send them
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // New user — send to profile creation
      response = NextResponse.redirect(`${baseUrl}/profile/complete`);
      // Must re-attach cookies to the new response
      supabase.auth.getUser(); // triggers cookie re-set on new response... handled below
      request.cookies.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value);
      });
    }
  }

  return response;
}
