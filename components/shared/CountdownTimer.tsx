"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  label?: string;
  targetDate?: string | null;
  round1Unlocked?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({
  label = "ROUND 1 STARTS IN",
  targetDate,
  round1Unlocked = false,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const targetTime = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate || !timeLeft) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary mb-3">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-sm uppercase tracking-widest font-headline font-bold text-primary mb-1">
          {label}
        </p>
        <p className="text-base text-outline font-body">
          Countdown will be announced soon
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-2xl bg-surface-container/90 backdrop-blur-xl border border-primary/30 shadow-amber-subtle text-center relative overflow-hidden",
        className
      )}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 border border-primary/30 mb-6">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest font-headline text-primary">
          {timeLeft.isExpired
            ? round1Unlocked
              ? "ROUND 1 IS LIVE"
              : "COMMENCING SOON"
            : label}
        </span>
      </div>

      {timeLeft.isExpired ? (
        <div className="py-4">
          <h4 className="text-2xl sm:text-3xl font-bold font-headline text-primary mb-3">
            {round1Unlocked ? "It's Time! Start Building" : "Final Preparation"}
          </h4>
          {round1Unlocked ? (
            <Link
              href="/round-1"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-bold uppercase tracking-wider shadow-amber hover:bg-primary transition-all"
            >
              Head to Round 1 →
            </Link>
          ) : (
            <p className="text-sm text-outline">Organizers are preparing problem statements...</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MINS", value: timeLeft.minutes },
            { label: "SECS", value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-surface-container-lowest/80 border border-outline-variant/30 rounded-xl p-3 sm:p-4 text-center shadow-inner"
            >
              <div className="text-2xl sm:text-4xl lg:text-5xl font-mono font-bold text-primary tracking-tight">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-wider text-outline mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
