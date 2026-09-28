"use client";

import React, { useState } from "react";
import { MessageCircle, ExternalLink, Sparkles, X } from "lucide-react";
import { useEventSettings } from "@/lib/event-settings";
import { cn } from "@/lib/utils";

interface WhatsAppFloatingButtonProps {
  className?: string;
  showBanner?: boolean;
}

export function WhatsAppFloatingButton({ className, showBanner = true }: WhatsAppFloatingButtonProps) {
  const { settings } = useEventSettings();
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const whatsappUrl = settings.whatsapp_group_link || "https://chat.whatsapp.com";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip / Expanding Callout Pill */}
      {!isDismissed && (
        <div
          className={cn(
            "hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface-container/95 border border-[#25D366]/30 shadow-2xl backdrop-blur-xl transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-90"
          )}
        >
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-headline font-bold text-on-surface">
                Join WhatsApp Group
              </span>
            </div>
            <span className="text-[10px] text-outline font-body">
              Live updates & rapid mentor support
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors text-[11px] font-bold font-headline flex items-center gap-1"
          >
            Join <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-outline/60 hover:text-outline p-0.5 ml-1"
            title="Dismiss hint"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Official WhatsApp Group"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#1EBE5D] via-[#25D366] to-[#48E585] text-white shadow-xl shadow-[#25D366]/40 hover:shadow-2xl hover:shadow-[#25D366]/60 hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-white/20"
      >
        {/* Glowing Radar Pulse */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-60 animate-ping -z-10" />

        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 fill-white drop-shadow-md transition-transform group-hover:rotate-12 duration-300"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </div>
  );
}
