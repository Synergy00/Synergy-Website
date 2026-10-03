import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  // Use the forwarded host header to build the correct origin in production (fixes http vs https mismatch)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  // Production: always redirect to the participant-facing domain, never admin
  const PRODUCTION_URL = "https://protohack.vercel.app";
  const baseUrl = isLocalEnv
    ? origin
    : PRODUCTION_URL;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth?error=Authentication+failed`);
  }

  // 1. We must create a dummy response object to hold cookies during exchange
  const cookieJar = new Map<string, { value: string; options?: any }>();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieJar.set(name, { value, options });
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

  // Determine final redirect URL
  let finalRedirect = `${baseUrl}${next}`;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // Registrations are closed! If they don't have a profile, they are not allowed in.
      await supabase.auth.signOut();
      return NextResponse.redirect(`${baseUrl}/auth?error=Registrations+are+closed.+You+do+not+have+an+active+participant+profile.`);
    }
  }

  // Create final response and attach all gathered cookies
  const response = NextResponse.redirect(finalRedirect);
  cookieJar.forEach(({ value, options }, name) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
