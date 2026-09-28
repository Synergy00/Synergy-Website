"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: CodeInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, char: string) => {
    const sanitized = char.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "");
    if (!sanitized && char) return; // Disallow disallowed chars like 0, O, 1, I

    const newCode = value.split("");
    newCode[index] = sanitized.slice(-1);
    const updated = newCode.join("");
    onChange(updated);

    // Auto advance
    if (sanitized && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-HJ-NP-Z2-9]/g, "")
      .slice(0, length);
    onChange(pasted);
    const targetIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] || "";
        return (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={cn(
              "w-10 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold uppercase rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-primary shadow-inner outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all",
              char && "border-primary/60 bg-surface-container-low"
            )}
          />
        );
      })}
    </div>
  );
}
