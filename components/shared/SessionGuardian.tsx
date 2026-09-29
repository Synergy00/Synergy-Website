"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionGuardian() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Only monitor on protected routes
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/round-1") ||
      pathname.startsWith("/round-2") ||
      pathname.startsWith("/profile");

    if (!isProtected) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        // Session expired or logged out
        router.push("/auth?error=Session+expired.+Please+log+in+again.");
      }
    });

    // Check immediately in case it expired while backgrounded
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth?error=Session+expired.+Please+log+in+again.");
      }
    };
    
    // Check when window regains focus
    window.addEventListener("focus", checkSession);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", checkSession);
    };
  }, [pathname, router, supabase]);

  return null; // This is a logic-only component
}
