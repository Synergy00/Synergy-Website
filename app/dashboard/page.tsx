"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  KeyRound,
  AlertTriangle,
  Copy,
  Check,
  Crown,
  Search,
  CheckCircle2,
  Trash2,
  Lock,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Terminal,
  ArrowRight,
  BookOpen,
  Trophy,
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { CodeInput } from "@/components/shared/CodeInput";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { Chip } from "@/components/shared/Chip";
import { createClient } from "@/lib/supabase/client";
import { useEventSettings } from "@/lib/event-settings";
import {
  OFFICIAL_PROBLEM_STATEMENTS,
  getProblemStatementById,
  ProblemStatement,
} from "@/lib/problem-statements";
import { generateTeamCode } from "@/lib/utils";
import { NoTeamView } from "@/components/dashboard/NoTeamView";
import { TeamStatus } from "@/components/dashboard/TeamStatus";

interface TeamMember {
  id: string;
  fullName: string;
  participantId: string;
  role: "lead" | "member";
  college: string;
}

interface TeamData {
  id: string;
  name: string;
  code: string;
  status: "round1" | "shortlisted";
  problemStatementId?: string;
  problemStatementTitle?: string;
  problemStatementDomain?: string;
  is_locked?: boolean;
  members: TeamMember[];
}

interface ParticipantSearchResult {
  id: string;
  fullName: string;
  participantId: string;
  college: string;
  inTeam: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { settings: globalSettings } = useEventSettings();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    fullName: string;
    participantId: string;
    email: string;
    college: string;
  } | null>(null);

  const [team, setTeam] = useState<TeamData | null>(null);
  const [eventSettings, setEventSettings] = useState<{
    countdownLabel: string;
    countdownTarget: string | null;
    round1Unlocked: boolean;
    round2Open: boolean;
  }>({
    countdownLabel: "ROUND 1 STARTS IN",
    countdownTarget: "2026-10-04T00:00:00+05:30",
    round1Unlocked: false,
    round2Open: true,
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Create team state
  const [teamName, setTeamName] = useState("");
  const [selectedPsId, setSelectedPsId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ParticipantSearchResult[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<ParticipantSearchResult[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);

  // Join team state
  const [joinCode, setJoinCode] = useState("");
  const [joinPreview, setJoinPreview] = useState<{
    name: string;
    leadName: string;
    memberCount: number;
  } | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth");
          return;
        }

        const currentUserId = user.id;
        const currentUserEmail = user.email || "";

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUserId)
          .single();

        if (!profileData) {
          router.push("/profile/complete");
          return;
        } else {
          setProfile({
            id: profileData.id,
            fullName: profileData.full_name,
            participantId: profileData.participant_id,
            email: profileData.email || currentUserEmail,
            college: profileData.college || "Unknown College",
          });
        }

        // Fetch team membership
        const { data: membership } = await supabase
          .from("team_members")
          .select("team_id, role")
          .eq("profile_id", currentUserId)
          .maybeSingle();

        if (membership) {
          const { data: teamData } = await supabase
            .from("teams")
            .select("*")
            .eq("id", membership.team_id)
            .single();

          if (teamData) {
            const { data: membersList } = await supabase
              .from("team_members")
              .select("profile_id, role, profiles(full_name, participant_id, college)")
              .eq("team_id", teamData.id);

            const mappedMembers: TeamMember[] = (membersList || []).map((m: any) => ({
              id: m.profile_id,
              fullName: m.profiles?.full_name || "Team Member",
              participantId: m.profiles?.participant_id || "PH26-00000",
              role: m.role,
              college: m.profiles?.college || "University",
            }));

            const activePs = getProblemStatementById(teamData.problem_statement_id) || OFFICIAL_PROBLEM_STATEMENTS[0];
            setTeam({
              id: teamData.id,
              name: teamData.name,
              code: teamData.code,
              status: teamData.status,
              problemStatementId: activePs.id,
              problemStatementTitle: activePs.title,
              problemStatementDomain: activePs.domain,
              is_locked: teamData.is_locked || false,
              members: mappedMembers,
            });
          }
        }

        // Fetch event settings
        const { data: settings } = await supabase
          .from("event_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (settings) {
          setEventSettings({
            countdownLabel: settings.countdown_label || "ROUND 1 STARTS IN",
            countdownTarget: settings.countdown_target || "2026-10-04T00:00:00+05:30",
            round1Unlocked: settings.round1_unlocked,
            round2Open: settings.round2_open,
          });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, supabase]);

  // Handle participant search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, participant_id, college")
          .neq("id", profile?.id || "")
          .or(`full_name.ilike.%${searchQuery}%,participant_id.ilike.%${searchQuery}%`)
          .limit(8);

        if (data) {
          const results: ParticipantSearchResult[] = data.map((p: any) => ({
            id: p.id,
            fullName: p.full_name,
            participantId: p.participant_id,
            college: p.college,
            inTeam: false,
          }));
          setSearchResults(results);
        }
      } catch (err) {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, profile, supabase]);

  // Handle Create Team
  const handleCreateTeam = async () => {
    if (teamName.trim().length < 3) {
      setCreateError("Team name must be at least 3 characters.");
      return;
    }
    if (!selectedPsId) {
      setCreateError("Please select an official Problem Statement for your team.");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);

    const chosenPs = getProblemStatementById(selectedPsId) || OFFICIAL_PROBLEM_STATEMENTS[0];

    try {
      const currentProfileId = profile?.id;
      if (!currentProfileId) throw new Error("No active profile session found.");
      
      const { count } = await supabase
        .from("teams")
        .select("id", { count: "exact", head: true });

      const teamNum = (count || 0) + 1;
      const code = generateTeamCode(teamNum);

      // 1. Insert Team
      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName.trim(),
          code: code,
          lead_id: currentProfileId,
          status: "round1",
          problem_statement_id: chosenPs.id,
        })
        .select()
        .single();

      if (teamError) {
        if (teamError.message.includes("unique") || teamError.message.includes("teams_name_ci")) {
          setCreateError("A team with this name already exists. Please choose a different name.");
          setCreateLoading(false);
          return;
        }
        throw new Error(teamError.message || "Database rejected team insertion.");
      }

      if (!newTeam) throw new Error("Failed to insert team (no data returned).");
      const teamId = newTeam.id;

      // 2. Insert Lead & Added Members
      const membersToInsert = [
        { profile_id: currentProfileId, team_id: teamId, role: "lead" },
        ...selectedMembers.map((m) => ({
          profile_id: m.id,
          team_id: teamId,
          role: "member",
        })),
      ];

      await supabase.from("team_members").insert(membersToInsert);

      // Local State Update
      const selfMember: TeamMember = {
        id: currentProfileId,
        fullName: profile?.fullName || "Team Lead",
        participantId: profile?.participantId || "TBA",
        role: "lead",
        college: profile?.college || "Unknown College",
      };

      const addedMembersMapped: TeamMember[] = selectedMembers.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        participantId: m.participantId,
        role: "member",
        college: m.college,
      }));

      setTeam({
        id: teamId,
        name: teamName.trim(),
        code: code,
        status: "round1",
        problemStatementId: chosenPs.id,
        problemStatementTitle: chosenPs.title,
        problemStatementDomain: chosenPs.domain,
        members: [selfMember, ...addedMembersMapped],
      });

      setCreatedTeamCode(code);
    } catch (err: any) {
      console.error("Failed to create team:", err);
      setCreateError(err?.message || "An unexpected error occurred while creating the team.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Join Code lookup
  useEffect(() => {
    const cleanCode = joinCode.trim().toUpperCase();
    if (cleanCode.length >= 4) {
      const lookup = async () => {
        setJoinError(null);
        try {
          const { data: teamFound } = await supabase
            .from("teams")
            .select("name, lead_id, is_locked, profiles!teams_lead_id_fkey(full_name)")
            .eq("code", cleanCode)
            .single();

          if (teamFound) {
            if (teamFound.is_locked) {
              setJoinError("This team has been locked by its leader and is not accepting new members.");
            } else {
              setJoinPreview({
                name: teamFound.name,
                leadName: (teamFound as any).profiles?.full_name || "Team Lead",
                memberCount: 2,
              });
            }
          } else {
            setJoinError("Invalid team code. Please check with your team lead.");
          }
        } catch {
          setJoinError("Invalid team code. Please check with your team lead.");
        }
      };
      lookup();
    } else {
      setJoinPreview(null);
      setJoinError(null);
    }
  }, [joinCode, supabase]);

  // Handle Join Confirm
  const handleJoinTeam = async () => {
    if (!joinPreview) return;
    setJoinLoading(true);
    setJoinError(null);

    try {
      const currentProfileId = profile?.id;
      if (!currentProfileId) throw new Error("No profile found");

      // Find the team id
      const { data: teamData, error: teamErr } = await supabase
        .from("teams")
        .select("id, is_locked")
        .eq("code", joinCode.toUpperCase())
        .single();
        
      if (teamErr || !teamData) {
         throw new Error("Team not found");
      }

      if (teamData.is_locked) {
         throw new Error("This team has been locked by its leader and is not accepting new members.");
      }

      // Insert membership
      const { error: joinErr } = await supabase
        .from("team_members")
        .insert({
          team_id: teamData.id,
          profile_id: currentProfileId,
          role: "member"
        });

      if (joinErr) throw joinErr;

      // Reload page to fetch full fresh team state
      window.location.reload();
      
    } catch (err: any) {
      console.error("Failed to join team:", err);
      setJoinError(err?.message || "Failed to join team. The team might be full.");
    } finally {
      setJoinLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden flex">
      <AmbientGlow variant="full" />
      <Sidebar
        hasTeam={!!team}
        teamStatus={team?.status}
        round1Unlocked={eventSettings.round1Unlocked}
        round2Unlocked={eventSettings.round2Open}
        userProfile={
          profile
            ? { fullName: profile.fullName, participantId: profile.participantId }
            : null
        }
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-64 pt-24 md:pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              Hello, {profile?.fullName.split(" ")[0]} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-outline font-body">Participant ID:</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-surface-container-high border border-outline-variant text-xs font-mono font-bold text-primary">
                <span>{profile?.participantId}</span>
                <button
                  onClick={() => copyId(profile?.participantId || "")}
                  className="hover:text-on-surface transition-colors"
                  title="Copy Participant ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {team && team.status === "shortlisted" && (
            <div className="flex items-center gap-2">
              <Chip variant="amber" pulse>
                Shortlisted for Round 2 🎉
              </Chip>
            </div>
          )}
        </div>

        {/* Live Server Countdown Clocks */}
        <div className="mb-6 flex justify-center">
          <ServerClockRenderer placement="dashboard" />
        </div>

        {/* 🎉 SHORTLISTED BANNER — only appears when admin marks the team as shortlisted */}
        {team?.status === "shortlisted" && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-primary/50 shadow-amber backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shadow-amber">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">Official Notice</span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <h2 className="text-lg font-headline font-bold text-on-surface">
                  🎉 Your Team Has Been Shortlisted for Round 2!
                </h2>
                <p className="text-xs text-outline font-body mt-0.5">
                  Congratulations! Your team <strong className="text-on-surface">{team.name}</strong> has been selected to advance to Round 2 — the offline rapid-build finale. Head to Round 2 for details.
                </p>
              </div>
              <a href="/round-2">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Round 2
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* --- NO TEAM STATE --- */}
        {!team ? (
          <NoTeamView
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onOpenJoinModal={() => setIsJoinOpen(true)}
          />
        ) : (
          /* --- WITH TEAM STATE --- */
          <TeamStatus
            team={team}
            eventSettings={eventSettings}
            globalSettings={globalSettings}
            copyCode={copyCode}
            copiedCode={copiedCode}
            currentUserId={profile?.id || ""}
          />
        )}
      </main>

      {/* Floating WhatsApp Action Widget (Dynamically linked to admin setting) */}
      <WhatsAppFloatingButton />

      {/* --- CREATE TEAM MODAL --- */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreatedTeamCode(null);
          setTeamName("");
          setSelectedMembers([]);
        }}
        title={createdTeamCode ? "Team Created 🎉" : "Create Your Team"}
        maxWidth="lg"
      >
        {createdTeamCode ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-amber">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-1">
                Your Team is Ready!
              </h4>
              <p className="text-xs text-outline font-body">
                Share this unique 6-character code with your teammates so they can join.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest border border-primary/60 shadow-inner flex items-center justify-center gap-4 max-w-xs mx-auto">
              <span className="font-mono text-3xl font-bold text-primary tracking-widest">
                {createdTeamCode}
              </span>
              <button
                onClick={() => copyCode(createdTeamCode)}
                className="p-2 rounded-lg bg-surface-container-high text-primary hover:text-on-surface transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setIsCreateOpen(false);
                setCreatedTeamCode(null);
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-primary-container/10 border border-primary/30 text-xs text-primary font-body">
              <strong>Notice:</strong> Team creation is mandatory. If you are participating solo, just create a team and don't add members. Max 3 members total. Team rosters are permanently locked upon formation.
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-xs text-error">
                {createError}
              </div>
            )}

            <Input
              label="Team Name"
              placeholder="e.g. Apex Innovators"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              helperText="3 to 30 characters (letters & numbers only)"
            />

            {/* Problem Statement Selection (Mandatory) */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-outline font-headline">
                Select Your Problem Statement (PS01–PS10) <span className="text-primary">*</span>
              </label>
              
              <div className="space-y-2">
                <select
                  value={selectedPsId}
                  onChange={(e) => setSelectedPsId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs sm:text-sm font-headline font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="" disabled>-- Select a Problem Statement --</option>
                  {OFFICIAL_PROBLEM_STATEMENTS.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.id}: {ps.title} ({ps.domain})
                    </option>
                  ))}
                </select>

                {/* Selected PS Preview Card */}
                {selectedPsId && (() => {
                  const activePs = getProblemStatementById(selectedPsId);
                  if (!activePs) return null;
                  return (
                    <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-primary/30 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-container/20 border border-primary/40">
                            {activePs.id}
                          </span>
                          <span className="text-xs font-bold text-on-surface font-headline">
                            {activePs.domain}
                          </span>
                        </div>
                        <Chip
                          variant={
                            activePs.difficulty === "Beginner Friendly"
                              ? "success"
                              : activePs.difficulty === "Intermediate"
                              ? "amber"
                              : "lavender"
                          }
                          size="sm"
                        >
                          {activePs.difficulty}
                        </Chip>
                      </div>
                      <p className="text-xs text-outline font-body leading-relaxed">
                        {activePs.shortDesc}
                      </p>
                      <div className="text-[10px] text-primary font-mono pt-1 border-t border-outline-variant/20 truncate">
                        Tech: {activePs.suggestedTech.join(", ")}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Search members */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-outline">
                Add Members (Optional, up to 2 more)
              </label>
              <Input
                placeholder="Search by Participant ID (e.g. PH26-00125) or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />

              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  {searchResults.map((res) => {
                    const alreadySelected = selectedMembers.some((m) => m.id === res.id);
                    return (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors"
                      >
                        <div className="text-left">
                          <div className="text-xs font-bold text-on-surface font-headline">
                            {res.fullName}
                          </div>
                          <div className="text-[10px] font-mono text-primary">
                            {res.participantId} · {res.college}
                          </div>
                        </div>

                        {alreadySelected ? (
                          <span className="text-[10px] text-outline font-semibold px-2 py-1">
                            Added
                          </span>
                        ) : selectedMembers.length >= 2 ? (
                          <span className="text-[10px] text-outline font-semibold px-2 py-1">
                            Team Full
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedMembers([...selectedMembers, res])}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Team Roster Preview */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline font-bold text-outline">
                <span>YOUR TEAM ROSTER</span>
                <span>{1 + selectedMembers.length} / 3</span>
              </div>

              <div className="space-y-2">
                {/* Lead row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary-container/20 text-primary flex items-center justify-center font-bold text-xs font-headline">
                      {profile?.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface font-headline flex items-center gap-1.5">
                        <span>{profile?.fullName}</span>
                        <span className="text-[10px] text-primary font-mono">(You)</span>
                      </div>
                      <div className="text-[10px] font-mono text-outline">
                        {profile?.participantId}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-headline font-bold px-2 py-0.5 rounded bg-primary-container/20 text-primary">
                    Team Lead
                  </span>
                </div>

                {/* Added members */}
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs font-headline">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface font-headline">
                          {m.fullName}
                        </div>
                        <div className="text-[10px] font-mono text-outline">
                          {m.participantId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedMembers(selectedMembers.filter((item) => item.id !== m.id))
                      }
                      className="p-1 rounded-md text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreateOpen(false);
                  setSelectedMembers([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTeam}
                isLoading={createLoading}
                disabled={teamName.trim().length < 3}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- JOIN TEAM MODAL --- */}
      <Modal
        isOpen={isJoinOpen}
        onClose={() => {
          setIsJoinOpen(false);
          setJoinCode("");
          setJoinPreview(null);
          setJoinSuccess(null);
        }}
        title={joinSuccess ? "Team Joined 🎉" : "Join a Team"}
        maxWidth="md"
      >
        {joinSuccess ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-success-container border border-success/40 flex items-center justify-center text-success mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-1">
                Welcome to the Team!
              </h4>
              <p className="text-xs text-outline font-body">{joinSuccess}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setIsJoinOpen(false);
                setJoinSuccess(null);
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-xs text-outline font-body">
              Enter the team code provided by your team lead (e.g. <code>PHT01-DWFW</code>).
            </p>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                placeholder="e.g. PHT01-DWFW"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full text-center py-3.5 px-4 font-mono text-xl sm:text-2xl font-bold uppercase tracking-widest rounded-xl bg-surface-container-lowest border border-primary/50 text-primary focus:ring-2 focus:ring-primary/40 outline-none shadow-inner"
              />
            </div>

            {joinError && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-xs text-error">
                {joinError}
              </div>
            )}

            {/* Live Team Preview */}
            {joinPreview && (
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-success/40 text-left space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-headline font-bold text-primary">
                    TEAM FOUND
                  </span>
                  <Chip variant="success" size="sm">
                    {joinPreview.memberCount} / 3 Members
                  </Chip>
                </div>
                <div className="text-base font-bold font-headline text-on-surface">
                  {joinPreview.name}
                </div>
                <div className="text-xs text-outline font-body">
                  Team Lead: <span className="text-on-surface">{joinPreview.leadName}</span>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-primary-container/10 border border-primary/30 text-xs text-primary text-left">
              <strong>Warning:</strong> Joining a team is permanent. You cannot leave or transfer afterwards.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsJoinOpen(false);
                  setJoinCode("");
                  setJoinPreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleJoinTeam}
                isLoading={joinLoading}
                disabled={!joinPreview}
              >
                Join Team
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
