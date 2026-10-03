"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type ClockPlacementArea = "landing_hero" | "dashboard" | "round_1" | "round_2";
// ClockPlacement is now an array so a single clock can appear in multiple areas simultaneously
export type ClockPlacement = ClockPlacementArea[];

export interface ServerClock {
  id: string;
  title: string;
  target_time: string; // ISO string e.g. "2026-10-03T23:59:59+05:30"
  placement: ClockPlacement;
  is_active: boolean;
  action_on_expire?: "stop_registrations" | "lock_round_1" | "custom_message" | "none";
  expired_message?: string;
  description?: string;
}

export interface EventSettings {
  id: number;
  countdown_label: string;
  countdown_target: string | null;
  round1_unlocked: boolean;
  round2_open: boolean;
  registration_label: string;
  registration_deadline: string | null;
  registration_open: boolean;
  server_clocks: ServerClock[];
  whatsapp_group_link: string;
  drive_upload_webhook_url?: string;
}

export const DEFAULT_SERVER_CLOCKS: ServerClock[] = [
  {
    id: "clock_round1_sprint",
    title: "ROUND 1 ENDS IN",
    target_time: "2026-10-07T23:59:59+05:30",
    placement: ["landing_hero", "dashboard"],
    is_active: true,
    action_on_expire: "lock_round_1",
    expired_message: "ROUND 1 CLOSED",
    description: "Round 1 build window countdown shown on landing and dashboard.",
  },
  {
    id: "clock_round1_2_sprint",
    title: "ROUND 1 BUILD WINDOW CLOSES IN",
    target_time: "2026-10-07T23:59:59+05:30",
    placement: ["round_1"],
    is_active: true,
    action_on_expire: "lock_round_1",
    expired_message: "ROUND 1 SUBMISSION CLOSED",
    description: "Server build clock active on the Round 1 submission page.",
  },
];

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  id: 1,
  countdown_label: "ROUND 1 STARTS IN",
  countdown_target: "2026-10-04T09:00:00+05:30",
  round1_unlocked: false,
  round2_open: true,
  registration_label: "REGISTRATION CLOSES IN",
  registration_deadline: "2026-10-03T23:59:59+05:30",
  registration_open: true,
  server_clocks: DEFAULT_SERVER_CLOCKS,
  whatsapp_group_link: "https://chat.whatsapp.com/C9yfPuBdbzt54hGsmVqVQ7",
  drive_upload_webhook_url: "",
};

const STORAGE_KEY = "protohack_event_settings_v3";
const EVENT_NAME = "protohack_settings_updated";

function sanitizeClocks(clocks: any[]): ServerClock[] {
  if (!Array.isArray(clocks) || clocks.length === 0) return DEFAULT_SERVER_CLOCKS;
  return clocks.map((c) => {
    // Migrate legacy string placements to array format
    if (typeof c.placement === "string") {
      if (c.placement === "all") {
        return { ...c, placement: ["landing_hero", "dashboard", "round_1", "round_2"] as ClockPlacement };
      }
      return { ...c, placement: [c.placement] as ClockPlacement };
    }
    // Ensure placement is always an array
    if (!Array.isArray(c.placement)) {
      return { ...c, placement: ["dashboard"] as ClockPlacement };
    }
    return c;
  });
}

export function getLocalSettings(): EventSettings {
  if (typeof window === "undefined") return DEFAULT_EVENT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EVENT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EVENT_SETTINGS,
      ...parsed,
      server_clocks: sanitizeClocks(parsed.server_clocks),
      whatsapp_group_link: parsed.whatsapp_group_link || DEFAULT_EVENT_SETTINGS.whatsapp_group_link,
      drive_upload_webhook_url: parsed.drive_upload_webhook_url || "",
    };
  } catch {
    return DEFAULT_EVENT_SETTINGS;
  }
}

export function saveLocalSettings(settings: Partial<EventSettings>): EventSettings {
  const current = getLocalSettings();
  const updated: EventSettings = {
    ...current,
    ...settings,
    server_clocks: settings.server_clocks !== undefined ? settings.server_clocks : current.server_clocks,
    whatsapp_group_link: settings.whatsapp_group_link !== undefined ? settings.whatsapp_group_link : current.whatsapp_group_link,
    drive_upload_webhook_url: settings.drive_upload_webhook_url !== undefined ? settings.drive_upload_webhook_url : current.drive_upload_webhook_url,
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }
  return updated;
}

export async function fetchEventSettings(): Promise<EventSettings> {
  const local = getLocalSettings();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (data && !error) {
      let parsedClocks = DEFAULT_SERVER_CLOCKS;
      if (data.server_clocks) {
        try {
          parsedClocks = typeof data.server_clocks === "string" ? JSON.parse(data.server_clocks) : data.server_clocks;
        } catch {
          parsedClocks = DEFAULT_SERVER_CLOCKS;
        }
      }

      const merged: EventSettings = {
        id: 1,
        countdown_label: data.countdown_label || DEFAULT_EVENT_SETTINGS.countdown_label,
        countdown_target: data.countdown_target ?? DEFAULT_EVENT_SETTINGS.countdown_target,
        round1_unlocked: data.round1_unlocked !== undefined ? Boolean(data.round1_unlocked) : DEFAULT_EVENT_SETTINGS.round1_unlocked,
        round2_open: data.round2_open !== undefined ? Boolean(data.round2_open) : DEFAULT_EVENT_SETTINGS.round2_open,
        registration_label: data.registration_label || DEFAULT_EVENT_SETTINGS.registration_label,
        registration_deadline: data.registration_deadline ?? DEFAULT_EVENT_SETTINGS.registration_deadline,
        registration_open: data.registration_open !== undefined ? Boolean(data.registration_open) : DEFAULT_EVENT_SETTINGS.registration_open,
        server_clocks: sanitizeClocks(parsedClocks),
        whatsapp_group_link: data.whatsapp_group_link || DEFAULT_EVENT_SETTINGS.whatsapp_group_link,
        drive_upload_webhook_url: data.drive_upload_webhook_url || "",
      };
      saveLocalSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn("Could not query event_settings from Supabase, using cached/defaults:", err);
  }
  // Only fall back to local if DB is unreachable
  return getLocalSettings();
}

export async function updateEventSettings(settings: Partial<EventSettings>): Promise<EventSettings> {
  const updated = saveLocalSettings(settings);
  try {
    const payload: Record<string, any> = { id: 1 };
    if (settings.countdown_label !== undefined) payload.countdown_label = settings.countdown_label;
    if (settings.countdown_target !== undefined) payload.countdown_target = settings.countdown_target;
    if (settings.round1_unlocked !== undefined) payload.round1_unlocked = settings.round1_unlocked;
    if (settings.round2_open !== undefined) payload.round2_open = settings.round2_open;
    if (settings.registration_label !== undefined) payload.registration_label = settings.registration_label;
    if (settings.registration_deadline !== undefined) payload.registration_deadline = settings.registration_deadline;
    if (settings.registration_open !== undefined) payload.registration_open = settings.registration_open;
    if (settings.server_clocks !== undefined) payload.server_clocks = JSON.stringify(settings.server_clocks);
    if (settings.whatsapp_group_link !== undefined) payload.whatsapp_group_link = settings.whatsapp_group_link;
    if (settings.drive_upload_webhook_url !== undefined) payload.drive_upload_webhook_url = settings.drive_upload_webhook_url;

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update settings in database");
    }
  } catch (err) {
    console.warn("Could not persist event_settings to Supabase, updated locally:", err);
  }
  return updated;
}

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(() => getLocalSettings());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const fresh = await fetchEventSettings();
    setSettings(fresh);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<EventSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getLocalSettings());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(getLocalSettings());
      }
    };

    window.addEventListener(EVENT_NAME, handleCustomUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refresh]);

  return {
    settings,
    loading,
    refresh,
    save: updateEventSettings,
  };
}
