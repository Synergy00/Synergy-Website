"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Layers,
  Cpu,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { createClient } from "@/lib/supabase/client";
import { getProblemStatementById, ProblemStatement } from "@/lib/problem-statements";
import { BookOpen } from "lucide-react";

export default function Round2Page() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [round2Open, setRound2Open] = useState(true);
  const [round1Unlocked, setRound1Unlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; participantId: string } | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [activePs, setActivePs] = useState<ProblemStatement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    async function checkRound2() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }
        const userId = user.id;

        // Fetch settings
        const { data: settings } = await supabase
          .from("event_settings")
          .select("round2_open, round1_unlocked")
          .eq("id", 1)
          .single();

        if (settings) {
          setRound2Open(settings.round2_open);
          setRound1Unlocked(settings.round1_unlocked);
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, participant_id")
          .eq("id", userId)
          .single();

        if (profile) {
          setUserProfile({
            fullName: profile.full_name,
            participantId: profile.participant_id,
          });
        }

        const { data: membership } = await supabase
          .from("team_members")
          .select("team_id, teams(*)")
          .eq("user_id", userId)
          .maybeSingle();

        if (membership && membership.teams) {
          setTeam(membership.teams);
          if (membership.teams.problem_statement_id) {
            setActivePs(getProblemStatementById(membership.teams.problem_statement_id) || null);
          }
          if ((membership as any).teams?.status === "shortlisted") {
            setIsShortlisted(true);
          } else {
            setIsShortlisted(false);
          }
        } else {
          setIsShortlisted(false);
        }
      } catch {
        setIsShortlisted(false);
      } finally {
        setLoading(false);
      }
    }
    checkRound2();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isUnlocked = isShortlisted && round2Open;

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden flex">
      <AmbientGlow variant="full" />
      <Sidebar
        hasTeam={!!team}
        teamStatus={team?.status}
        round1Unlocked={round1Unlocked}
        round2Unlocked={round2Open}
        userProfile={
          userProfile
            ? { fullName: userProfile.fullName, participantId: userProfile.participantId }
            : null
        }
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-64 pt-24 md:pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        {!isUnlocked ? (
          /* Locked State */
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary mx-auto mb-4">
              <Lock className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Round 2 is Locked
            </h2>
            <p className="text-sm text-outline font-body mb-6">
              Round 2 opens exclusively for teams shortlisted after Round 1 evaluations. Shortlisted teams will be notified by October 9.
            </p>
            <Link href="/dashboard">
              <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          /* Unlocked Round 2 Finalist View */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Chip variant="lavender" pulse>
                    FINALIST QUALIFIED · OFFLINE SPRINT
                  </Chip>
                </div>
                <h1 className="text-3xl font-headline font-bold text-on-surface">
                  Round 2: Offline Rapid Build Finale
                </h1>
                <p className="text-sm text-outline mt-1 font-body">
                  Venue: Campus Hub · Date: October 10, 2026 (09:00 AM IST)
                </p>
              </div>

              <Link href="/dashboard">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Active Server Countdown Clocks */}
            <div className="flex justify-center transform scale-125 sm:scale-150 my-10">
              <ServerClockRenderer placement="round_2" />
            </div>

            {/* Congratulations & Direct Club Entry Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-secondary-container/25 border border-secondary/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary-container/40 text-secondary shrink-0">
                    <Trophy className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-headline font-bold text-on-surface mb-2">
                      Congratulations! Your Team is Shortlisted 🎉
                    </h2>
                    <p className="text-sm text-outline font-body leading-relaxed max-w-2xl">
                      Your team demonstrated outstanding product thinking in Round 1.
                      You are invited to the offline rapid build sprint and live defense.
                      <strong> Top 3 teams win Direct Club Entry into SYNERGY</strong> mapped to their technical domains of interest!
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-secondary/50 text-center shrink-0 w-full md:w-auto">
                  <Award className="w-8 h-8 text-secondary mx-auto mb-1" />
                  <div className="text-lg font-headline font-bold text-secondary">Top 3 Teams</div>
                  <div className="text-[11px] text-outline">Direct SYNERGY Entry</div>
                </div>
              </div>
            </div>

            {/* ── Problem Statement Full Details ────────────────────── */}
            {activePs && (
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
                <h2 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Your Problem Statement Details
                </h2>
                <div className="p-5 rounded-xl border border-primary/20 bg-primary-container/5 space-y-4">
                  <div>
                    <div className="text-xs font-headline font-bold tracking-widest text-primary mb-1 uppercase">{activePs.domain}</div>
                    <h3 className="text-lg font-bold text-on-surface">{activePs.title}</h3>
                    <p className="text-sm text-outline mt-2 leading-relaxed">{activePs.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-on-surface font-headline mb-2">Key Deliverables</div>
                      <ul className="space-y-1.5">
                        {activePs.keyDeliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                            <span className="text-xs text-outline">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface font-headline mb-2">Target Audience</div>
                      <p className="text-xs text-outline">{activePs.targetAudience}</p>
                      <div className="text-xs font-bold text-on-surface font-headline mt-3 mb-2">Suggested Tech Stack</div>
                      <div className="flex flex-wrap gap-1.5">
                        {activePs.suggestedTech.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-primary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Day Schedule & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-4 font-headline font-bold text-base text-primary">
                  <Clock className="w-5 h-5" /> Schedule of October 10
                </div>
                <div className="space-y-3 text-xs sm:text-sm font-body text-on-surface-variant">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span>09:00 AM</span>
                    <span className="font-semibold text-on-surface">Reporting & Desk Allocation</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span>09:30 AM</span>
                    <span className="font-semibold text-primary">Common Problem Statement Released</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span>11:30 AM</span>
                    <span className="font-semibold text-secondary">Surprise Card Feature Reveal</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span>01:00 PM – 01:30 PM</span>
                    <span className="font-semibold text-on-surface">Build Lock & Code Freeze</span>
                  </div>
                  <div className="flex justify-between">
                    <span>02:30 PM onwards</span>
                    <span className="font-semibold text-success">Live Presentations & Defense</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-4 font-headline font-bold text-base text-secondary">
                  <MapPin className="w-5 h-5" /> Venue Logistics & Rules
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm font-body text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>Bring College Physical ID cards for all team members.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>High-speed Wi-Fi and power strips provided at every team desk.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>AI coding assistants permitted; all members must be able to explain code paths.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>Live product defense format: 4-minute presentation demo + 2-minute judge Q&A.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Round 2 Official Evaluation Criteria */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold font-headline text-on-surface">
                    Round 2 Official Evaluation Framework (100 Points)
                  </h3>
                  <p className="text-xs text-outline mt-0.5 font-body">
                    Evaluated by technical leads and club coordinators
                  </p>
                </div>
                <Chip variant="lavender">100-Point Rubric</Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Product Experience / UX", weight: "25%", desc: "Is the product easy and logical to use? Does the main flow make sense?" },
                  { label: "Problem-Solution Fit", weight: "20%", desc: "Does the product address the given problem clearly?" },
                  { label: "Execution & Prioritisation", weight: "20%", desc: "What did the team choose to build within 3–4 hours, and how effectively?" },
                  { label: "Presentation & Explanation", weight: "15%", desc: "Can the team clearly explain the idea, choices, architecture, and demo?" },
                  { label: "Innovation / Thoughtful Details", weight: "10%", desc: "Useful originality or smart implementation decisions." },
                  { label: "Teamwork & Response to Questions", weight: "10%", desc: "Collaboration, ownership, and defense of architectural choices." },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-headline text-on-surface">{item.label}</span>
                        <span className="text-xs font-mono font-bold text-secondary">{item.weight}</span>
                      </div>
                      <p className="text-[11px] text-outline font-body leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tie-Break Sequence */}
              <div className="mt-6 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs font-body text-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Official Tie-Break Sequence:</strong> 1st: Higher Product Experience/UX score → 2nd: Higher Execution & Prioritisation score → 3rd: Higher Problem-Solution Fit score.</span>
                </div>
              </div>
            </div>

            {/* What 'Finishable / Complete' Means in Round 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
              <div className="mb-6">
                <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
                  DELIVERABLE STANDARD
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-headline text-on-surface mt-1">
                  What &quot;Finishable / Complete&quot; Means in Round 2
                </h3>
                <p className="text-xs sm:text-sm text-outline mt-1">
                  Teams are expected to build a meaningful, finishable MVP—not a full production-scale product.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "A clear primary user flow that works seamlessly.",
                  "At least one end-to-end working core feature.",
                  "Usable interface and sensible navigation.",
                  "Basic input validation and error handling.",
                  "A runnable/deployable build suitable for evaluation.",
                  "Clean code and inspectable project structure.",
                ].map((point, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-xs text-on-surface font-body">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Participant Checklist for Finals */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
              <div className="flex items-center gap-2 mb-4 font-headline font-bold text-base text-primary">
                <CheckCircle2 className="w-5 h-5" /> Official Participant Finals Checklist
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body text-on-surface-variant">
                {[
                  "Understand the problem before writing any code.",
                  "Define the core deliverable first; avoid unnecessary feature bloat.",
                  "Plan tasks and divide work clearly among team members.",
                  "Use Git / version control consistently during the sprint.",
                  "Keep secrets and API keys strictly out of source code repositories.",
                  "Test the primary user flow thoroughly before the code freeze.",
                  "Have a 4-minute presentation ready: Problem → Solution → Architecture → Demo → Future Scope.",
                  "Prioritise a working core flow over unfinished extra features.",
                ].map((chk, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-primary font-mono font-bold">0{idx + 1}.</span>
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Widget */}
      <WhatsAppFloatingButton />
    </div>
  );
}

