"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      // Hide the restored message after 3 seconds
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-500 transform animate-in slide-in-from-bottom-5",
        !isOnline
          ? "bg-error-container/95 border border-error/30 text-error"
          : "bg-success-container/95 border border-success/30 text-success"
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold font-headline tracking-wide">
            You are offline. Waiting for connection...
          </span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold font-headline tracking-wide">
            Connection restored
          </span>
        </>
      )}
    </div>
  );
}
