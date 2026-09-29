"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { createClient } from "@/lib/supabase/client";
import { useEventSettings } from "@/lib/event-settings";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";

  const [tab, setTab] = useState<"signin" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { settings } = useEventSettings();
  const isRegistrationClosed =
    !settings.registration_open ||
    (settings.registration_deadline
      ? new Date(settings.registration_deadline).getTime() <= Date.now()
      : false);

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    }
  }, [searchParams]);

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === "register") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Check if user already exists or session established
        if (data.session) {
          router.push("/profile/complete");
        } else {
          setSuccess("Account created! Check your email for verification link or sign in.");
          setTab("signin");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
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
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || "Google sign in failed.");
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface-container/95 border border-outline-variant/40 shadow-2xl backdrop-blur-xl relative z-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-2xl font-bold font-headline text-on-surface">
          {tab === "register" ? "Sign Up" : "Sign In"}
        </h1>
      </div>

      {/* Alert Messages */}
      {tab === "register" && isRegistrationClosed && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/40 flex items-start gap-2 text-xs text-error">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Registrations for PROTOHACK are officially closed. Existing participants can sign in below.</span>
        </div>
      )}

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
          disabled={tab === "register" && isRegistrationClosed}
        >
          {tab === "register"
            ? isRegistrationClosed
              ? "Registrations Stopped"
              : "Create Account"
            : "Sign In"}
        </Button>
      </form>

      {/* Google OAuth Temporarily Hidden */}

      {/* Footer text */}
      <div className="text-center mt-6">
        {tab === "register" ? (
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
        )}
      </div>
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
