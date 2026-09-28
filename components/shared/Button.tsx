import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs font-semibold rounded-lg",
    md: "px-6 py-3 text-sm font-bold rounded-xl",
    lg: "px-8 py-3.5 text-base font-bold rounded-xl",
  };

  const variantClasses = {
    primary:
      "bg-primary-container text-on-primary uppercase tracking-wider shadow-amber hover:shadow-amber-lg hover:bg-primary active:scale-[0.98]",
    secondary:
      "border border-outline-variant/60 text-primary uppercase tracking-wider hover:bg-surface-container-high hover:border-primary active:scale-[0.98]",
    destructive:
      "bg-error-container text-error uppercase tracking-wider hover:bg-error-container/80 active:scale-[0.98]",
    ghost:
      "text-on-surface hover:text-primary hover:bg-surface-container-high/50",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-headline transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
