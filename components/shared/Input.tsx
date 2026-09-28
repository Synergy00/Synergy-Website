"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase tracking-wider font-semibold text-outline">
            {label}
            {props.required && <span className="text-primary ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-outline pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface placeholder:text-outline/70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-base sm:text-sm",
              leftIcon ? "pl-11" : "pl-4",
              rightIcon ? "pr-11" : "pr-4",
              error && "border-error focus:border-error focus:ring-error/20",
              props.disabled && "opacity-60 cursor-not-allowed bg-surface-container-low",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-outline">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
