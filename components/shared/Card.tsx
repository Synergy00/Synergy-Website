"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "glass-low" | "amber-border";
  glow?: boolean;
}

export function Card({
  children,
  className,
  variant = "glass",
  glow = false,
  ...props
}: CardProps) {
  const variantStyles = {
    glass: "bg-surface-container/90 backdrop-blur-xl border border-outline-variant/30",
    "glass-low": "bg-surface-container-low/90 backdrop-blur-lg border border-outline-variant/20",
    "amber-border":
      "bg-surface-container/95 backdrop-blur-xl border border-primary/40 shadow-amber-subtle",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-8 transition-all",
        variantStyles[variant],
        glow && "hover:border-primary/60 hover:shadow-amber-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
