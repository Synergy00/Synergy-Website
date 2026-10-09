"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  CameraOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserCheck,
  UserX,
  Building2,
  ScanLine,
  Save
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";

interface AttendanceRecord {
  id: string;
  profile_id: string;
  team_id: string;
  participant_id: string;
  full_name: string;
  team_name: string;
  scanned_at: string;
}

interface TeamMember {
  profile_id: string;
  role: string;
  profiles: { full_name: string; participant_id: string } | null;
}

interface Team {
  id: string;
  name: string;
  status: string;
  team_members: TeamMember[];
}

export default function Round2AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: "success" | "already" | "error"; message: string; name?: string; team?: string } | null>(null);

  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  const [pendingAttendance, setPendingAttendance] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/round2-attendance");
      const data = await res.json();
      setAttendance(data.attendance || []);
      setTeams(data.teams || []);
      
      const initial: Record<string, boolean> = {};
      (data.attendance || []).forEach((a: any) => { initial[a.profile_id] = true; });
      setPendingAttendance(initial);
      setHasUnsavedChanges(false);
    } catch {
      console.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startScanner = useCallback(async () => {
    setScannerActive(true);
    setScanResult(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        async (decodedText: string) => {
          if (scanning) return;
          setScanning(true);
          // Parse QR: synergy_r2|profile_id|team_id|participantId
          const parts = decodedText.split("|");
          if (parts[0] !== "synergy_r2" || parts.length < 3) {
            setScanResult({ type: "error", message: "Invalid QR code. Not a SYNERGY Round 2 badge." });
            setScanning(false);
            return;
          }
          const [, profile_id, team_id] = parts;
          try {
            const res = await fetch("/api/admin/round2-attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile_id, team_id }),
            });
            const data = await res.json();
            if (data.already_marked) {
              setScanResult({ type: "already", message: "Already marked present!", name: data.record?.full_name });
            } else if (data.success) {
              setScanResult({ type: "success", message: "Attendance marked!", name: data.record?.full_name, team: data.record?.team_name });
              await loadData();
            } else {
              setScanResult({ type: "error", message: data.error || "Failed to mark attendance." });
            }
          } catch {
            setScanResult({ type: "error", message: "Network error. Try again." });
          }
          setTimeout(() => setScanning(false), 2000);
        },
        () => {} // ignore decode errors
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setScannerActive(false);
    }
  }, [scanning]);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {}
    setScannerActive(false);
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const handleDeleteAttendance = async (profile_id: string) => {
    if (!confirm("Remove attendance for this participant?")) return;
    await fetch("/api/admin/round2-attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id }),
    });
    await loadData();
  };

  const handleManualAttendance = async (profile_id: string, team_id: string) => {
    try {
      await fetch("/api/admin/round2-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id, team_id }),
      });
      await loadData();
    } catch {
      alert("Failed to mark attendance.");
    }
  };

  const handleTogglePending = (profileId: string) => {
    setPendingAttendance(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
    setHasUnsavedChanges(true);
  };

  const handleBulkSave = async () => {
    setIsSavingBulk(true);
    const originalSet = new Set(attendance.map(a => a.profile_id));
    const promises: Promise<any>[] = [];

    teams.forEach(team => {
      team.team_members.forEach(member => {
        const wasPresent = originalSet.has(member.profile_id);
        const isNowPresent = pendingAttendance[member.profile_id];

        if (isNowPresent && !wasPresent) {
          promises.push(
            fetch("/api/admin/round2-attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile_id: member.profile_id, team_id: team.id }),
            })
          );
        } else if (!isNowPresent && wasPresent) {
          promises.push(
            fetch("/api/admin/round2-attendance", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile_id: member.profile_id }),
            })
          );
        }
      });
    });

    try {
      await Promise.all(promises);
      await loadData();
      alert("Attendance updated successfully!");
    } catch (err) {
      alert("Some updates failed. Please verify the table.");
      await loadData();
    } finally {
      setIsSavingBulk(false);
    }
  };


  const attendedProfileIds = new Set(attendance.map(a => a.profile_id));
  const totalShortlisted = teams.reduce((acc, t) => acc + t.team_members.length, 0);
  const totalPresent = attendance.length;
  const totalAbsent = totalShortlisted - totalPresent;
  const teamsFullyPresent = teams.filter(t => t.team_members.every(m => attendedProfileIds.has(m.profile_id))).length;
  const teamsPartial = teams.filter(t => t.team_members.some(m => attendedProfileIds.has(m.profile_id)) && !t.team_members.every(m => attendedProfileIds.has(m.profile_id))).length;
  const teamsAbsent = teams.filter(t => t.team_members.every(m => !attendedProfileIds.has(m.profile_id))).length;

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Hero Scanner Section */}
      <div className="relative rounded-3xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-container-high" style={{ minHeight: 260 }}>
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-secondary/80">Round 2 · Live Attendance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mb-1">QR Attendance Scanner</h1>
              <p className="text-xs text-outline font-body max-w-md">
                Scan participant QR codes to mark their Round 2 attendance. Each code is unique to the participant and their team.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { label: "Teams", value: teams.length, color: "text-primary" },
                  { label: "Present", value: totalPresent, color: "text-success" },
                  { label: "Absent", value: totalAbsent, color: "text-error" },
                  { label: "Total Shortlisted", value: totalShortlisted, color: "text-on-surface" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/30">
                    <span className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</span>
                    <span className="text-[10px] text-outline font-body">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              {!scannerActive ? (
                <Button variant="primary" size="md" onClick={startScanner} leftIcon={<Camera className="w-4 h-4" />}>
                  Start QR Scanner
                </Button>
              ) : (
                <Button variant="destructive" size="md" onClick={stopScanner} leftIcon={<CameraOff className="w-4 h-4" />}>
                  Stop Scanner
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Scanner & result */}
          {scannerActive && (
            <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative">
                <div id="qr-reader" className="rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg" style={{ width: 300, height: 300 }} />
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
                  <div className="w-[200px] h-[200px] border-2 border-primary rounded-xl opacity-60 animate-pulse" />
                </div>
                <div className="absolute top-2 left-2 right-2 flex justify-center">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 text-[10px] font-bold text-primary font-headline flex items-center gap-1">
                    <ScanLine className="w-3 h-3" /> Scanning…
                  </span>
                </div>
              </div>

              {scanResult && (
                <div className={`flex-1 p-5 rounded-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 ${
                  scanResult.type === "success" ? "bg-success-container/30 border-success/50" :
                  scanResult.type === "already" ? "bg-primary-container/20 border-primary/40" :
                  "bg-error-container/30 border-error/50"
                }`}>
                  {scanResult.type === "success" && <CheckCircle2 className="w-8 h-8 text-success mb-2" />}
                  {scanResult.type === "already" && <CheckCircle2 className="w-8 h-8 text-primary mb-2" />}
                  {scanResult.type === "error" && <AlertTriangle className="w-8 h-8 text-error mb-2" />}
                  <div className="font-headline font-bold text-on-surface text-base mb-1">{scanResult.message}</div>
                  {scanResult.name && <div className="text-sm text-outline">{scanResult.name}</div>}
                  {scanResult.team && <div className="text-xs text-outline mt-0.5">Team: {scanResult.team}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Fully Present Teams", value: teamsFullyPresent, icon: CheckCircle2, color: "text-success", bg: "bg-success-container/20 border-success/30" },
          { label: "Partial Attendance", value: teamsPartial, icon: Users, color: "text-primary", bg: "bg-primary-container/20 border-primary/30" },
          { label: "Absent Teams", value: teamsAbsent, icon: XCircle, color: "text-error", bg: "bg-error-container/20 border-error/30" },
          { label: "Total Shortlisted Teams", value: teams.length, icon: Building2, color: "text-secondary", bg: "bg-secondary-container/20 border-secondary/30" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`p-5 rounded-2xl border ${card.bg} flex flex-col gap-2`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
              <div className={`text-2xl font-mono font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[11px] text-outline font-body">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Team-wise Breakdown Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">Manual Attendance Table</h2>
            <p className="text-xs text-outline font-body mt-0.5">Toggle P (Present) or A (Absent) and click save</p>
          </div>
          <div className="flex items-center gap-4">
            <Chip variant="lavender">{teams.length} Teams</Chip>
            {hasUnsavedChanges && (
              <Button
                variant="primary"
                onClick={handleBulkSave}
                disabled={isSavingBulk}
                leftIcon={isSavingBulk ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {isSavingBulk ? "Saving..." : "Save Attendance"}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 text-outline text-sm font-body">
            No shortlisted teams found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs text-outline font-headline font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-4">Member Name</th>
                  <th className="py-4 px-4">Participant ID</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                {teams.flatMap((team, tIdx) => team.team_members.map((member, i) => {
                  const isPendingPresent = !!pendingAttendance[member.profile_id];
                  const rowClass = i === team.team_members.length - 1 
                    ? "border-b border-outline-variant/30" 
                    : "border-b border-outline-variant/10";
                    
                  return (
                    <tr key={member.profile_id} className={`${rowClass} hover:bg-surface-container-highest/50 transition-colors`}>
                      <td className="py-3 px-4 font-headline font-bold text-on-surface">
                        {i === 0 ? team.name : ""}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        {member.profiles?.full_name || "Unknown"} 
                        {member.role === "lead" && <span className="text-[9px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-bold">LEAD</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-outline text-xs">
                        {member.profiles?.participant_id || ""}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleTogglePending(member.profile_id)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-l-lg transition-colors border ${
                              isPendingPresent ? "bg-success/20 text-success border-success/40" : "bg-surface-container-high text-outline border-outline-variant/30 hover:text-on-surface"
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleTogglePending(member.profile_id)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-r-lg transition-colors border ${
                              !isPendingPresent ? "bg-error/20 text-error border-error/40" : "bg-surface-container-high text-outline border-outline-variant/30 hover:text-on-surface"
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Scans Log */}
      {attendance.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <h3 className="text-base font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> Recent Scans
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {[...attendance].slice(0, 20).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div>
                    <span className="font-semibold text-on-surface">{record.full_name}</span>
                    <span className="text-outline ml-2">{record.team_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-outline text-[11px]">
                    {new Date(record.scanned_at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <button
                    onClick={() => handleDeleteAttendance(record.profile_id)}
                    className="p-1 rounded text-outline hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
