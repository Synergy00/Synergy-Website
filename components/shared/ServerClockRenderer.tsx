"use client";

import React, { useEffect, useState } from "react";
import { Clock, Lock, Sparkles, AlertCircle, PlayCircle, Timer } from "lucide-react";
import { useEventSettings, ServerClock, ClockPlacementArea } from "@/lib/event-settings";
import { cn } from "@/lib/utils";

interface ServerClockRendererProps {
  placement: ClockPlacementArea;
  onClockExpire?: (clock: ServerClock) => void;
  className?: string;
}

interface ClockTimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function SingleClockCard({
  clock,
  onExpire,
}: {
  clock: ServerClock;
  onExpire?: (clock: ServerClock) => void;
}) {
  const [timeState, setTimeState] = useState<ClockTimeState | null>(null);

  useEffect(() => {
    if (!clock.target_time || !clock.is_active) {
      const expired = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      setTimeState(expired);
      if (onExpire) onExpire(clock);
      return;
    }

    const calc = () => {
      const target = new Date(clock.target_time).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        const expired = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
        setTimeState(expired);
        if (onExpire) onExpire(clock);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeState({ days, hours, minutes, seconds, isExpired: false });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [clock.target_time, clock.is_active]);

  const isClosed = !clock.is_active || (timeState?.isExpired ?? false);

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300",
        isClosed
          ? "bg-surface-container-low/70 border-error/30 shadow-sm"
          : "bg-surface-container-lowest/50 border-outline-variant/30 shadow-lg shadow-black/40"
      )}
    >
      {/* Status Pill Header */}
      <div className="flex items-center gap-2 mb-3">
        {isClosed ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/25 border border-error/30">
            <Lock className="w-3 h-3 text-error" />
            <span className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-widest text-error">
              {clock.expired_message || "CLOSED"}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-widest text-primary">
              {clock.title}
            </span>
          </div>
        )}
      </div>

      {/* Clock Counter Grid */}
      {isClosed ? (
        <div className="flex flex-col items-center justify-center py-1">
          <p className="text-xs sm:text-sm text-outline font-body text-center max-w-xs">
            {clock.description || "The target countdown window has concluded."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "DAYS", value: timeState?.days ?? 0 },
            { label: "HOURS", value: timeState?.hours ?? 0 },
            { label: "MINS", value: timeState?.minutes ?? 0 },
            { label: "SECS", value: timeState?.seconds ?? 0 },
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

export function ServerClockRenderer({
  placement,
  onClockExpire,
  className,
}: ServerClockRendererProps) {
  const { settings } = useEventSettings();

  // A clock matches if it's active and its placements array includes the requested area
  const matchingClocks = (settings.server_clocks || []).filter((clock) => {
    if (!clock.is_active) return false;
    const placements = Array.isArray(clock.placement) ? clock.placement : [clock.placement];
    return placements.includes(placement as any);
  });

  if (matchingClocks.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
      {matchingClocks.map((clock) => (
        <SingleClockCard key={clock.id} clock={clock} onExpire={onClockExpire} />
      ))}
    </div>
  );
}

