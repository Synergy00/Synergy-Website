"use client";

import React from "react";

interface AmbientGlowProps {
  variant?: "full" | "subtle" | "admin";
}

export function AmbientGlow({ variant = "full" }: AmbientGlowProps) {
  if (variant === "admin") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-10 w-[500px] h-[300px] bg-primary-container/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[160px]" />
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-secondary-container/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-primary-container/8 rounded-full blur-[140px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Top centered violet glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-secondary-container/20 rounded-full blur-[140px]" />
      {/* Right side molten amber glow */}
      <div className="absolute top-40 -right-20 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[160px]" />
      {/* Subtle radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,166,35,0.06)_0%,transparent_60%)]" />
    </div>
  );
}
