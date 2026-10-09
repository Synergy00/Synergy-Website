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
import { ShaderBackground } from "@/components/ui/waves-background-2";
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

export default function AdminTimersPage() {
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
          return;
        }
      }
      // Fallback to cached settings
      const data = await fetchEventSettings();
      setSettings(data);
      setClocks(data.server_clocks || DEFAULT_SERVER_CLOCKS);
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

      {/* ── LIVE EVENT TIMER HERO ── */}
      <div className="relative rounded-3xl overflow-hidden border border-outline-variant/30 shadow-2xl" style={{ minHeight: 220 }}>
        {/* Shader animated background */}
        <div className="absolute inset-0">
          <ShaderBackground className="w-full h-full" />
        </div>
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px]" />
        {/* Content */}
        <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary/80">Live Event Timer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mb-1">
              Server Countdown Clocks
            </h2>
            <p className="text-xs text-outline font-body max-w-md">
              Deploy real-time countdown timers to any page — Landing, Dashboard, Round 1, or Round 2. Changes broadcast live to all participants.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["landing_hero", "dashboard", "round_1", "round_2"].map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-lg bg-primary-container/20 border border-primary/25 text-[10px] font-mono text-primary font-bold">
                  /{p.replace("_", "-")}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-primary-container/20 border border-primary/30 text-primary">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-on-surface">{clocks.length}</div>
                <div className="text-[10px] text-outline font-body">Active clocks</div>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={openNewClockModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Timer
            </Button>
          </div>
        </div>
        {/* Live preview of round_2 clock at bottom if any */}
        {clocks.some(c => c.is_active && c.placement?.includes("round_2")) && (
          <div className="relative z-10 border-t border-outline-variant/20 px-8 py-4 flex items-center gap-4">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline shrink-0">Live Preview (Round 2):</span>
            <ServerClockRenderer placement="round_2" />
          </div>
        )}
      </div>

      {/* ── CONFIGURED CLOCKS MANAGER ── */}
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
    </div>
  );
}
