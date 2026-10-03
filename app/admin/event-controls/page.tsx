"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Clock,
  Unlock,
  Lock,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RefreshCw,
  Timer,
  Plus,
  Edit2,
  Eye,
  Check,
  X,
  Radio,
  MessageCircle,
  ExternalLink,
  Link2,
  Copy,
  HardDrive,
  Code,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Modal } from "@/components/shared/Modal";
import { Chip } from "@/components/shared/Chip";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import {
  fetchEventSettings,
  updateEventSettings,
  EventSettings,
  ServerClock,
  ClockPlacement,
  ClockPlacementArea,
  DEFAULT_SERVER_CLOCKS,
} from "@/lib/event-settings";

const PLACEMENT_OPTIONS: { value: ClockPlacementArea; label: string; desc: string }[] = [
  { value: "landing_hero", label: "Landing Page Hero", desc: "Public landing page hero section" },
  { value: "dashboard", label: "Participant Dashboard", desc: "Top of participant dashboard" },
  { value: "round_1", label: "Round 1 Page", desc: "Round 1 Online Sprint submission page" },
  { value: "round_2", label: "Round 2 Page", desc: "Round 2 Offline Finals page" },
];

export default function AdminEventControlsPage() {
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Event Settings state
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [clocks, setClocks] = useState<ServerClock[]>(DEFAULT_SERVER_CLOCKS);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [driveWebhookUrl, setDriveWebhookUrl] = useState("");
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);

  // Round 1 & 2 Access Switches
  const [round1Unlocked, setRound1Unlocked] = useState(false);
  const [round2Open, setRound2Open] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [pendingToggle, setPendingToggle] = useState<"round1" | "round2" | "registration" | null>(null);

  // Clock Editor Modal State
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [editingClockId, setEditingClockId] = useState<string | null>(null);
  const [clockTitle, setClockTitle] = useState("");
  const [clockDate, setClockDate] = useState("2026-10-04");
  const [clockTime, setClockTime] = useState("09:00");
  const [clockPlacement, setClockPlacement] = useState<ClockPlacement>(["dashboard"]);
  const [clockExpiredMsg, setClockExpiredMsg] = useState("TIME UP");
  const [clockDesc, setClockDesc] = useState("");
  const [clockIsActive, setClockIsActive] = useState(true);

  // Clock Delete State
  const [clockToDelete, setClockToDelete] = useState<ServerClock | null>(null);

  // Database Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Fetch directly from Admin API (service role) to bypass RLS and get fresh DB values
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const result = await response.json();
        const data = result.settings;
        if (data) {
          let parsedClocks = DEFAULT_SERVER_CLOCKS;
          if (data.server_clocks) {
            try {
              parsedClocks = typeof data.server_clocks === "string"
                ? JSON.parse(data.server_clocks)
                : data.server_clocks;
            } catch {
              parsedClocks = DEFAULT_SERVER_CLOCKS;
            }
          }
          setSettings({ ...data, server_clocks: parsedClocks });
          setClocks(parsedClocks);
          setWhatsappLink(data.whatsapp_group_link || "");
          setDriveWebhookUrl(data.drive_upload_webhook_url || "");
          setRound1Unlocked(data.round1_unlocked ?? false);
          setRound2Open(data.round2_open ?? true);
          setRegistrationOpen(data.registration_open ?? true);
          return;
        }
      }
      // Fallback to cached settings
      const data = await fetchEventSettings();
      setSettings(data);
      setClocks(data.server_clocks || DEFAULT_SERVER_CLOCKS);
      setWhatsappLink(data.whatsapp_group_link || "");
      setDriveWebhookUrl(data.drive_upload_webhook_url || "");
      setRound1Unlocked(data.round1_unlocked ?? false);
      setRound2Open(data.round2_open ?? true);
      setRegistrationOpen(data.registration_open ?? true);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const openNewClockModal = () => {
    setEditingClockId(null);
    setClockTitle("ROUND 1 SPRINT CLOSES IN");
    setClockDate("2026-10-07");
    setClockTime("23:59");
    setClockPlacement(["dashboard"]);
    setClockExpiredMsg("SUBMISSION WINDOW CLOSED");
    setClockDesc("Server countdown for Round 1 build sprint.");
    setClockIsActive(true);
    setIsClockModalOpen(true);
  };

  const openEditClockModal = (clock: ServerClock) => {
    setEditingClockId(clock.id);
    setClockTitle(clock.title);
    // Normalize to array
    const placements = Array.isArray(clock.placement) ? clock.placement : [clock.placement as any];
    setClockPlacement(placements as ClockPlacement);
    setClockExpiredMsg(clock.expired_message || "TIME UP");
    setClockDesc(clock.description || "");
    setClockIsActive(clock.is_active);

    if (clock.target_time) {
      const dateObj = new Date(clock.target_time);
      if (!isNaN(dateObj.getTime())) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        setClockDate(`${yyyy}-${mm}-${dd}`);
        setClockTime(`${hh}:${min}`);
      }
    }
    setIsClockModalOpen(true);
  };

  const handleSaveClock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockDate || !clockTime || clockPlacement.length === 0) return;

    const isoString = `${clockDate}T${clockTime}:00+05:30`;
    let updatedClocks: ServerClock[];

    if (editingClockId) {
      updatedClocks = clocks.map((c) =>
        c.id === editingClockId
          ? {
              ...c,
              title: clockTitle,
              target_time: isoString,
              placement: clockPlacement,
              expired_message: clockExpiredMsg,
              description: clockDesc,
              is_active: clockIsActive,
            }
          : c
      );
    } else {
      const newClock: ServerClock = {
        id: `clock_${Date.now()}`,
        title: clockTitle,
        target_time: isoString,
        placement: clockPlacement,
        expired_message: clockExpiredMsg,
        description: clockDesc,
        is_active: clockIsActive,
      };
      updatedClocks = [...clocks, newClock];
    }

    setClocks(updatedClocks);
    await updateEventSettings({ server_clocks: updatedClocks });

    setIsClockModalOpen(false);
    setSaveSuccess(
      editingClockId
        ? "Server clock updated and broadcasted live across all designated pages!"
        : "New server clock created and deployed to designated page location!"
    );
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleToggleClockActive = async (clockId: string) => {
    const updated = clocks.map((c) =>
      c.id === clockId ? { ...c, is_active: !c.is_active } : c
    );
    setClocks(updated);
    await updateEventSettings({ server_clocks: updated });
    setSaveSuccess("Clock status toggled live.");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleDeleteClock = async () => {
    if (!clockToDelete) return;
    const updated = clocks.filter((c) => c.id !== clockToDelete.id);
    setClocks(updated);
    await updateEventSettings({ server_clocks: updated });
    setClockToDelete(null);
    setSaveSuccess("Clock removed.");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleConfirmRoundToggle = async () => {
    if (pendingToggle === "round1") {
      const nextVal = !round1Unlocked;
      setRound1Unlocked(nextVal);
      await updateEventSettings({ round1_unlocked: nextVal });
      setSaveSuccess(`Round 1 ${nextVal ? "unlocked" : "locked"} globally!`);
    } else if (pendingToggle === "round2") {
      const nextVal = !round2Open;
      setRound2Open(nextVal);
      await updateEventSettings({ round2_open: nextVal });
      setSaveSuccess(`Round 2 ${nextVal ? "unlocked" : "locked"} globally!`);
    } else if (pendingToggle === "registration") {
      const nextVal = !registrationOpen;
      setRegistrationOpen(nextVal);
      await updateEventSettings({ registration_open: nextVal });
      setSaveSuccess(
        nextVal
          ? "Registrations are now OPEN. New accounts can be created."
          : "Registrations are now CLOSED. No new accounts can be created."
      );
    }
    setPendingToggle(null);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleSaveWhatsAppLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIntegrations(true);
    try {
      await updateEventSettings({
        whatsapp_group_link: whatsappLink.trim(),
      });
      setSaveSuccess("WhatsApp Group Link updated and broadcasted live to all participant dashboards!");
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.error("Failed to update WhatsApp link:", err);
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  const handleSaveDriveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIntegrations(true);
    try {
      await updateEventSettings({
        drive_upload_webhook_url: driveWebhookUrl.trim(),
      });
      setSaveSuccess("Google Drive Upload Webhook URL updated!");
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.error("Failed to update Drive webhook:", err);
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappLink);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handleExecuteWipeDatabase = async () => {
    if (resetConfirmText.trim().toUpperCase() !== "RESET") return;
    setIsResetting(true);

    try {
      const res = await fetch("/api/admin/reset-database", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setSaveSuccess("Database completely wiped! All participants and teams reset.");
        setIsResetModalOpen(false);
        setResetConfirmText("");
        loadSettings();
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to wipe database");
      }
    } catch (err: any) {
      alert(err?.message || "Network error: Failed to wipe database");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Live Event Controls & Server Clocks
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Configure dynamic server countdown clocks, target display locations (Landing, Dashboard, Round 1, Round 2), and global round access switches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={openNewClockModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Server Clock
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadSettings}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-success-container/90 border border-success/40 flex items-center gap-3 text-xs font-semibold text-success animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 1. DYNAMIC SERVER CLOCKS MANAGER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary/30 flex items-center justify-center text-primary">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Configured Server Clocks ({clocks.length})
              </h2>
              <p className="text-xs text-outline font-body">
                Deploy independent countdown timers to specific pages. Clocks automatically synchronize with all visitor browsers.
              </p>
            </div>
          </div>
        </div>

        {/* Clocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clocks.map((clock) => {
            const dateStr = new Date(clock.target_time).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <div
                key={clock.id}
                className={`p-5 rounded-2xl border transition-all ${
                  clock.is_active
                    ? "bg-surface-container-low border-outline-variant/30 hover:border-primary/40 shadow-sm"
                    : "bg-surface-container-lowest/50 border-outline-variant/15 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm sm:text-base text-on-surface">
                        {clock.title}
                      </span>
                      <Chip variant={clock.is_active ? "success" : "neutral"} size="sm" pulse={clock.is_active}>
                        {clock.is_active ? "LIVE" : "PAUSED"}
                      </Chip>
                    </div>
                    <div className="text-[11px] font-mono text-primary font-semibold mt-1">
                      Target (IST): {dateStr}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditClockModal(clock)}
                      className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      title="Edit Clock"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setClockToDelete(clock)}
                      className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors"
                      title="Delete Clock"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 mb-4 space-y-1.5">
                  <div className="flex items-start justify-between text-xs gap-2">
                    <span className="text-outline shrink-0">Display On:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(Array.isArray(clock.placement) ? clock.placement : [clock.placement]).map((p: any) => {
                        const opt = PLACEMENT_OPTIONS.find((o) => o.value === p);
                        return (
                          <span key={p} className="font-semibold text-on-surface px-1.5 py-0.5 rounded bg-primary-container/20 border border-primary/20 text-[10px] text-primary">
                            {opt?.label || p}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">Expired Badge:</span>
                    <span className="font-mono text-error text-[11px] font-semibold">
                      {clock.expired_message || "CLOSED"}
                    </span>
                  </div>
                  {clock.description && (
                    <div className="text-[11px] text-outline pt-1 border-t border-outline-variant/15">
                      {clock.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    variant={clock.is_active ? "secondary" : "primary"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleToggleClockActive(clock.id)}
                  >
                    {clock.is_active ? "Pause / Hide Clock" : "Activate Clock Live"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COMMUNITY & INTEGRATIONS: WHATSAPP GROUP & CLOUD WEBHOOK */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-[#25D366]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-headline font-bold text-on-surface">
                  Community & WhatsApp Group Link
                </h2>
                <Chip variant="success" size="sm" pulse>
                  LIVE BROADCAST
                </Chip>
              </div>
              <p className="text-xs text-outline font-body">
                Update the official WhatsApp group invite link shown across participant dashboards as a floating button & community banner.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form to change link */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSaveWhatsAppLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5 font-headline">
                  Official WhatsApp Group Invite URL <span className="text-primary">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#25D366]">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={whatsappLink}
                      onChange={(e) => setWhatsappLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs sm:text-sm text-on-surface font-mono focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-outline hover:text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Copy WhatsApp link"
                  >
                    {copiedWhatsApp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span className="text-success hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Test WhatsApp Link in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Test Link</span>
                  </a>
                </div>
                <p className="text-[11px] text-outline mt-1.5 font-body">
                  Paste the new WhatsApp group invite URL (e.g. <code>https://chat.whatsapp.com/invite_code</code>). Changes apply immediately to all participants without server restart.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-outline font-body flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>Synchronized with Participant Floating Button</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingIntegrations}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save WhatsApp Link
                </Button>
              </div>
            </form>

            {/* Optional Google Drive Webhook for 500+ free submissions */}
            <div className="pt-4 border-t border-outline-variant/20">
              <form onSubmit={handleSaveDriveWebhook} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline font-headline">
                    Google Drive Auto-Upload Webhook (Optional for 500+ Submissions)
                  </label>
                  <span className="text-[10px] font-mono text-primary px-2 py-0.5 rounded bg-primary-container/20">
                    $0 Server Cost
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={driveWebhookUrl}
                    onChange={(e) => setDriveWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec (Google Apps Script Webhook)"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    isLoading={isSavingIntegrations}
                  >
                    Save Webhook
                  </Button>
                </div>
                <p className="text-[10px] text-outline font-body leading-relaxed">
                  When configured, participant files uploaded in Round 1 are automatically streamed to your Google Drive folder and return an embeddable preview URL with zero database storage footprint.
                </p>
              </form>
            </div>
          </div>

          {/* Right Col: Live Preview of the Floating Widget */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-[#25D366]/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-headline font-bold text-on-surface">
                  Participant Widget Preview
                </span>
                <span className="text-[10px] text-[#25D366] font-mono font-bold">ACTIVE</span>
              </div>
              <p className="text-[11px] text-outline mb-4">
                This floating WhatsApp action button appears on participant dashboards with your configured link:
              </p>

              {/* Mock Floating Widget */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-on-surface font-headline">
                      Join WhatsApp Group
                    </div>
                    <div className="text-[9px] text-outline">
                      Live updates & mentor support
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1EBE5D] via-[#25D366] to-[#48E585] flex items-center justify-center text-white shadow-md shadow-[#25D366]/40 shrink-0">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/15 text-[10px] text-outline font-mono truncate">
              Link: {whatsappLink}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROUND ACCESS SWITCHES */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Round Access Switches
            </h2>
            <p className="text-xs text-outline font-body">
              Lock or unlock round pages and registration instantly without modifying database records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Gate Toggle */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-headline text-base text-on-surface">
                    Registration Gate
                  </span>
                  <Chip
                    variant={registrationOpen ? "success" : "error"}
                    pulse={registrationOpen}
                  >
                    {registrationOpen ? "OPEN" : "CLOSED"}
                  </Chip>
                </div>
              </div>
              <p className="text-xs text-outline font-body leading-relaxed mb-6">
                Controls whether new participants can create accounts and sign up. When closed, the Sign Up page shows a <strong>"Registrations Closed"</strong> message and all new account creation (email + Google) is blocked. Existing participants can still sign in normally.
              </p>
            </div>

            <Button
              variant={registrationOpen ? "destructive" : "primary"}
              size="sm"
              onClick={() => setPendingToggle("registration")}
              leftIcon={registrationOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            >
              {registrationOpen ? "Close Registrations (Block New Sign-Ups)" : "Reopen Registrations"}
            </Button>
          </div>

          {/* Round 1 Toggle */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold font-headline text-base text-on-surface">
                  Round 1: Online Sprint
                </span>
                <Chip
                  variant={round1Unlocked ? "success" : "neutral"}
                  pulse={round1Unlocked}
                >
                  {round1Unlocked ? "UNLOCKED" : "LOCKED"}
                </Chip>
              </div>
              <p className="text-xs text-outline font-body leading-relaxed mb-6">
                When unlocked, all registered participants in a team can access problem statements and the submission form on <code>/round-1</code>.
              </p>
            </div>

            <Button
              variant={round1Unlocked ? "destructive" : "primary"}
              size="sm"
              onClick={() => setPendingToggle("round1")}
              leftIcon={round1Unlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            >
              {round1Unlocked ? "Lock Round 1 Globally" : "Unlock Round 1 For All"}
            </Button>
          </div>

          {/* Round 2 Toggle */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold font-headline text-base text-on-surface">
                  Round 2: Shortlist Visibility
                </span>
                <Chip
                  variant={round2Open ? "success" : "neutral"}
                  pulse={round2Open}
                >
                  {round2Open ? "UNLOCKED" : "LOCKED"}
                </Chip>
              </div>
              <p className="text-xs text-outline font-body leading-relaxed mb-6">
                Controls whether shortlisted teams can view the Round 2 venue details and finals schedule.
              </p>
            </div>

            <Button
              variant={round2Open ? "destructive" : "primary"}
              size="sm"
              onClick={() => setPendingToggle("round2")}
              leftIcon={round2Open ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            >
              {round2Open ? "Lock Round 2 Globally" : "Unlock Round 2 For Finalists"}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. TESTING & DATABASE WIPE DANGER ZONE */}
      <div className="p-6 sm:p-8 rounded-2xl bg-error-container/15 border border-error/40 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-error-container/30 border border-error/40 flex items-center justify-center text-error">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold text-error">
              Testing & Database Wipe (Danger Zone)
            </h2>
            <p className="text-xs text-outline font-body">
              Testing utility for organizers to completely reset the database to a blank state before launching.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-error/30 text-xs text-on-surface-variant font-body leading-relaxed mb-6">
          Clicking the button below will delete <strong>ALL</strong> registered participant profiles, all team rosters, team codes, and authentication records, making the database 100% brand new.
        </div>

        <Button
          variant="destructive"
          size="md"
          onClick={() => setIsResetModalOpen(true)}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Wipe & Reset Entire Database
        </Button>
      </div>

      {/* Clock Editor / Creator Modal */}
      <Modal
        isOpen={isClockModalOpen}
        onClose={() => setIsClockModalOpen(false)}
        title={editingClockId ? "Edit Server Clock" : "Create New Server Clock"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClock} className="space-y-4">
          <Input
            label="Clock Headline Title"
            value={clockTitle}
            onChange={(e) => setClockTitle(e.target.value)}
            placeholder="e.g. ROUND 1 BUILD WINDOW CLOSES IN"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              value={clockDate}
              onChange={(e) => setClockDate(e.target.value)}
              required
            />

            <Input
              label="Target Time (IST)"
              type="time"
              value={clockTime}
              onChange={(e) => setClockTime(e.target.value)}
              required
            />
          </div>

          {/* Placement Selector — multi-select checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-outline uppercase tracking-wider">
                Display On <span className="text-primary">*</span>
              </label>
              <span className="text-[10px] text-outline font-body">
                {clockPlacement.length === 0 ? "Select at least one" : `${clockPlacement.length} selected`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PLACEMENT_OPTIONS.map((opt) => {
                const isSelected = clockPlacement.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setClockPlacement((prev) =>
                        isSelected
                          ? prev.filter((p) => p !== opt.value)
                          : [...prev, opt.value]
                      );
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-primary-container/15 border-primary ring-1 ring-primary"
                        : "bg-surface-container-low border-outline-variant/30 text-outline hover:border-outline-variant/60"
                    }`}
                  >
                    <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-outline-variant/50 bg-surface-container-lowest"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-on-primary" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">{opt.label}</div>
                      <div className="text-[10px] text-outline mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Expired Badge Text"
              value={clockExpiredMsg}
              onChange={(e) => setClockExpiredMsg(e.target.value)}
              placeholder="e.g. REGISTRATIONS STOPPED"
            />

            <Input
              label="Optional Subtext / Description"
              value={clockDesc}
              onChange={(e) => setClockDesc(e.target.value)}
              placeholder="e.g. Submissions will lock automatically"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsClockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
              {editingClockId ? "Save Changes" : "Deploy Server Clock"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Clock Delete Confirmation Modal */}
      <Modal
        isOpen={!!clockToDelete}
        onClose={() => setClockToDelete(null)}
        title="Delete Server Clock"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-on-surface font-body">
            Are you sure you want to delete clock{" "}
            <strong>"{clockToDelete?.title}"</strong>? It will immediately stop rendering on all configured pages.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
            <Button variant="ghost" onClick={() => setClockToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClock}>
              Delete Clock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Round Switches */}
      <Modal
        isOpen={!!pendingToggle}
        onClose={() => setPendingToggle(null)}
        title="Confirm Event Switch Toggle"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary-container/10 border border-primary/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-on-surface font-body">
              Are you sure you want to change the status of{" "}
              <strong>
                {pendingToggle === "round1"
                  ? "Round 1 Online Sprint"
                  : pendingToggle === "round2"
                  ? "Round 2 Shortlist Visibility"
                  : "Registration Gate"}
              </strong>
              ? This takes effect immediately on all participant browsers.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setPendingToggle(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmRoundToggle}>
              Confirm Switch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Wiping Database */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetConfirmText("");
        }}
        title="Wipe & Reset Entire Database"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-error-container/30 border border-error/50 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-error shrink-0 mt-0.5" />
            <div className="text-xs text-error font-body space-y-1">
              <p className="font-bold text-sm font-headline">THIS ACTION CANNOT BE UNDONE.</p>
              <p>
                This will wipe out every registered participant, delete all team codes, team memberships, and reset the event settings to clean factory defaults.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-xs font-semibold text-outline uppercase tracking-wider">
              Type <span className="text-error font-bold font-mono">RESET</span> to confirm:
            </label>
            <input
              type="text"
              placeholder="RESET"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-error/40 text-on-surface font-mono font-bold text-center uppercase tracking-widest outline-none focus:border-error"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/30">
            <Button
              variant="ghost"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={resetConfirmText.trim().toUpperCase() !== "RESET" || isResetting}
              isLoading={isResetting}
              onClick={handleExecuteWipeDatabase}
            >
              Confirm Wipe & Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
