"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid ID or password.");
      } else {
        router.push("/admin/participants");
      }
    } catch {
      // Offline / demo fallback check
      if (adminId === "admin_synergy" && password === "protohack2026admin") {
        document.cookie = `protohack_admin_session=${btoa(
          JSON.stringify({ adminId, authenticatedAt: Date.now() })
        )}; path=/; max-age=28800; SameSite=Strict`;
        router.push("/admin/participants");
      } else {
        setError("Invalid ID or password. (Demo: admin_synergy / protohack2026admin)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between relative overflow-hidden p-4">
      <AmbientGlow variant="admin" />

      <div className="flex items-center justify-center my-auto relative z-10">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface-container/95 border border-secondary/40 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/40 flex items-center justify-center text-secondary mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-headline text-on-surface">
                PROTOHACK
              </h1>
              <span className="text-[10px] uppercase font-headline font-bold px-2 py-0.5 rounded bg-secondary-container text-secondary border border-secondary/40">
                Admin
              </span>
            </div>
            <p className="text-xs text-outline font-body mt-1">
              Organizer Operations & Database Controls
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/40 flex items-center gap-2 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin ID"
              placeholder="e.g. admin_synergy"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In to Admin Portal
            </Button>
          </form>

          <p className="text-[10px] text-center text-outline/70 mt-6 font-body">
            Strictly authorized organizer access only. All sessions and mutations are monitored.
          </p>
        </div>
      </div>

      <div className="text-center text-xs font-headline font-bold tracking-widest uppercase text-outline/40 py-6 relative z-10">
        © {new Date().getFullYear()} SYNERGY AI Club. All rights reserved.
      </div>
    </div>
  );
}
