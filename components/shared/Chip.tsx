"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  variant?: "amber" | "lavender" | "success" | "neutral" | "error";
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function Chip({
  children,
  variant = "amber",
  size = "md",
  pulse = false,
  className,
  icon,
}: ChipProps) {
  const variantStyles = {
    amber: "bg-primary-container/15 border-primary/30 text-primary",
    lavender: "bg-secondary-container/30 border-secondary/30 text-secondary",
    success: "bg-success-container border-success/40 text-success",
    neutral: "bg-surface-container-high border-outline-variant/40 text-on-surface-variant",
    error: "bg-error-container/30 border-error/40 text-error",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  const pulseColors = {
    amber: "bg-primary",
    lavender: "bg-secondary",
    success: "bg-success",
    neutral: "bg-outline",
    error: "bg-error",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border uppercase font-bold tracking-wider font-headline",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            pulseColors[variant]
          )}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
