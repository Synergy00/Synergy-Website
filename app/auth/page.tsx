"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { createClient } from "@/lib/supabase/client";
import { useEventSettings } from "@/lib/event-settings";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Tab is permanently locked to signin — new account creation is disabled
  // const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";
  const initialTab: "signin" = "signin";

  const [tab] = useState<"signin" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { settings } = useEventSettings();
  // Registration permanently closed — new account creation commented out
  // const isRegistrationClosed =
  //   !settings.registration_open ||
  //   (settings.registration_deadline
  //     ? new Date(settings.registration_deadline).getTime() <= Date.now()
  //     : false);
  const isRegistrationClosed = true;

  // No longer needed — tab is always signin
  // useEffect(() => {
  //   if (searchParams.get("tab") === "register") {
  //     setTab("register");
  //   }
  // }, [searchParams]);

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Hard block on registration if closed
    if (tab === "register" && isRegistrationClosed) {
      setError("Registrations are closed. Please sign in if you already have an account.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Supabase returns "Invalid login credentials" for both wrong passwords and non-existent accounts
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Account doesn't exist or invalid credentials provided.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.session.user.id)
          .single();

        if (profile) {
          router.push("/dashboard");
        } else {
          router.push("/profile/complete");
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    // Block Google sign-up when registration is closed
    if (tab === "register" && isRegistrationClosed) {
      setError("Registrations are closed. Please sign in if you already have an account.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NODE_ENV === "development" 
            ? `${window.location.origin}/auth/callback` 
            : `https://protohack.vercel.app/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || "Google sign in failed.");
    }
  };

  // New account creation panel is commented out — registrations permanently closed
  // if (tab === "register" && isRegistrationClosed) { ... }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface-container/95 border border-outline-variant/40 shadow-2xl backdrop-blur-xl relative z-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-2xl font-bold font-headline text-on-surface">
          {tab === "register" ? "Sign Up" : "Sign In"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/40 flex items-center gap-2 text-xs text-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-success-container border border-success/40 flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.name@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<Lock className="w-4 h-4" />}
          helperText={tab === "register" ? "Minimum 8 characters" : undefined}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loading}
        >
          {tab === "register" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Google OAuth */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/40"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold text-outline">
          <span className="bg-surface-container px-2">or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full bg-surface-container hover:bg-surface-container-high border-outline-variant/40"
        onClick={handleGoogleAuth}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </Button>

      {/* Footer text — Sign Up link removed (new account creation disabled) */}
      {/* {tab === "register" ? (
        <p className="text-xs text-outline font-body">
          Already have an account?{" "}
          <button type="button" onClick={() => setTab("signin")} className="text-primary hover:underline font-semibold">
            Sign In
          </button>
        </p>
      ) : (
        <p className="text-xs text-outline font-body">
          Don't have an account?{" "}
          <button type="button" onClick={() => setTab("register")} className="text-primary hover:underline font-semibold">
            Sign Up
          </button>
        </p>
      )} */}
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between relative overflow-hidden p-4">
      <AmbientGlow variant="full" />

      {/* Back button */}
      <div className="max-w-md w-full mx-auto pt-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-outline hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to event page</span>
        </Link>
      </div>

      {/* Auth Box */}
      <div className="flex items-center justify-center my-auto">
        <Suspense fallback={<div className="text-primary font-mono text-sm">Loading authentication...</div>}>
          <AuthForm />
        </Suspense>
      </div>

      {/* Minimal footer */}
      <div className="text-center text-[10px] text-outline py-2 relative z-10">
        © 2026 SYNERGY PROTOHACK. All rights reserved.
      </div>
    </div>
  );
}
