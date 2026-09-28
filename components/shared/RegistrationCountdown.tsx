"use client";

import React, { useEffect, useState } from "react";
import { Clock, Lock, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationCountdownProps {
  label?: string;
  deadline?: string | null;
  registrationOpen?: boolean;
  className?: string;
  onStatusChange?: (isExpired: boolean) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function RegistrationCountdown({
  label = "REGISTRATION CLOSES IN",
  deadline = "2026-10-03T23:59:59+05:30",
  registrationOpen = true,
  className,
  onStatusChange,
}: RegistrationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!deadline || !registrationOpen) {
      const expiredState = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
      setTimeLeft(expiredState);
      if (onStatusChange) onStatusChange(true);
      return;
    }

    const calculate = () => {
      const target = new Date(deadline).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0 || !registrationOpen) {
        const state = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
        setTimeLeft(state);
        if (onStatusChange) onStatusChange(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const state = { days, hours, minutes, seconds, isExpired: false };
      setTimeLeft(state);
      if (onStatusChange) onStatusChange(false);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadline, registrationOpen, onStatusChange]);

  const isClosed = !registrationOpen || (timeLeft?.isExpired ?? false);

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300",
        isClosed
          ? "bg-surface-container-low/70 border-error/30 shadow-sm"
          : "bg-surface-container-lowest/50 border-outline-variant/30 shadow-lg shadow-black/40",
        className
      )}
    >
      {/* Top Status Header */}
      <div className="flex items-center gap-2 mb-3">
        {isClosed ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/25 border border-error/30">
            <Lock className="w-3 h-3 text-error" />
            <span className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-widest text-error">
              REGISTRATIONS STOPPED
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-widest text-primary">
              {label || "REGISTRATION CLOSES IN"}
            </span>
          </div>
        )}
      </div>

      {/* Clock Display */}
      {isClosed ? (
        <div className="flex flex-col items-center justify-center py-1">
          <p className="text-xs sm:text-sm text-outline font-body text-center max-w-xs">
            The registration portal is currently closed. Stay tuned for Round 1 announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "DAYS", value: timeLeft?.days ?? 0 },
            { label: "HOURS", value: timeLeft?.hours ?? 0 },
            { label: "MINS", value: timeLeft?.minutes ?? 0 },
            { label: "SECS", value: timeLeft?.seconds ?? 0 },
          ].map((unit) => (
            <div
              key={unit.label}
              className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] px-2.5 py-2 rounded-xl bg-surface-container-low/80 border border-outline-variant/20 shadow-inner"
            >
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[10px] font-headline font-semibold text-outline tracking-wider mt-0.5">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
