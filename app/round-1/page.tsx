"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FolderOpen,
  Upload,
  BookOpen,
  ShieldCheck,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { createClient } from "@/lib/supabase/client";
import { getProblemStatementById, ProblemStatement } from "@/lib/problem-statements";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";

// ── Constants ──────────────────────────────────────────────────────────────────
const DRIVE_UPLOAD_FOLDER = "https://drive.google.com/drive/folders/1Zp6j2BhqX8pHZwNCkftzWmFGC6MhTHB8?usp=sharing";
const PPT_TEMPLATE_URL = "https://drive.google.com/drive/folders/1uoxwbjFep0hgwKEFHBAncwvSGXJMU7wV?usp=sharing";

const SUBMISSION_GUIDELINES = [
  "Upload your PPT/PDF file to the shared Google Drive folder above using your team's Google account.",
  "Name your file exactly as: TeamName.pptx (e.g. ApexInnovators.pptx).",
  "Once uploaded, your submission is considered complete. You can update your file in the drive folder as many times as you want before the deadline.",
  "Only the latest file in the folder at the time of the deadline will be evaluated by the judges.",
];

const RULES = [
  { icon: "🧠", rule: "The solution must directly address your selected problem statement. Off-topic submissions will be disqualified." },
  { icon: "🖼️", rule: "The presentation must include: Problem Overview, Proposed Solution, Architecture/Tech Stack, UI Mockups, and Team Details." },
  { icon: "🚫", rule: "Plagiarism or use of pre-built products will result in immediate disqualification." },
  { icon: "⏰", rule: "Submissions after the deadline (shown in the timer above) will NOT be accepted or evaluated." },
  { icon: "👥", rule: "All team members must be registered on this portal. Unregistered members cannot participate." },
  { icon: "📄", rule: "Slides must be in PPT, PPTX, or PDF format. Maximum file size: 50MB." },
  { icon: "🔒", rule: "Drive file must be set to 'Anyone with the link — Viewer'. Private links cannot be reviewed." },
];

export default function Round1Page() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [round1Unlocked, setRound1Unlocked] = useState(false);
  const [round2Unlocked, setRound2Unlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; participantId: string } | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [activePs, setActivePs] = useState<ProblemStatement | null>(null);

  const [pptUrl, setPptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/auth"); return; }

        const [{ data: settings }, { data: profile }, { data: membership }] = await Promise.all([
          supabase.from("event_settings").select("round1_unlocked, round2_open").eq("id", 1).single(),
          supabase.from("profiles").select("full_name, participant_id").eq("id", user.id).single(),
          supabase.from("team_members").select("team_id").eq("profile_id", user.id).maybeSingle(),
        ]);

        setRound1Unlocked(settings?.round1_unlocked || false);
        setRound2Unlocked(settings?.round2_open || false);
        if (profile) setUserProfile({ fullName: profile.full_name, participantId: profile.participant_id });

        if (membership) {
          const { data: teamData } = await supabase.from("teams").select("*").eq("id", membership.team_id).single();
          setTeam(teamData);
          if (teamData?.problem_statement_id) {
            setActivePs(getProblemStatementById(teamData.problem_statement_id) || null);
          }
          if (teamData?.ppt_url) {
            setPptUrl(teamData.ppt_url);
            setHasExistingSubmission(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptUrl.trim()) { setSubmitError("Please paste your Google Drive file link."); return; }
    if (!pptUrl.includes("drive.google.com") && !pptUrl.includes("docs.google.com") && !pptUrl.startsWith("https://")) {
      setSubmitError("Please enter a valid Google Drive share link.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ppt_url: pptUrl, github_link: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitSuccess(true);
      setHasExistingSubmission(true);
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
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
        round1Unlocked={round1Unlocked}
        round2Unlocked={round2Unlocked}
        userProfile={userProfile ? { fullName: userProfile.fullName, participantId: userProfile.participantId } : null}
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-64 pt-24 md:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 min-h-screen">

        {/* ── LOCKED STATE ─────────────────────────────────────────── */}
        {!round1Unlocked ? (
          <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Round 1 is Locked</h2>
            <p className="text-sm text-outline font-body mb-6">
              The organizers haven't opened Round 1 yet. Keep an eye on the dashboard countdown.
            </p>
            <Link href="/dashboard">
              <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : !team ? (
          /* ── NO TEAM ─────────────────────────────────────────────── */
          <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <AlertTriangle className="w-10 h-10 text-error mx-auto mb-4" />
            <h2 className="text-xl font-headline font-bold text-error mb-2">No Team Found</h2>
            <p className="text-sm text-outline font-body mb-6">You must create or join a team before participating in Round 1.</p>
            <Link href="/dashboard"><Button variant="primary" size="md">Go to Dashboard</Button></Link>
          </div>
        ) : !activePs ? (
          /* ── NO PROBLEM STATEMENT ────────────────────────────────── */
          <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-headline font-bold text-on-surface mb-2">No Problem Statement Selected</h2>
            <p className="text-sm text-outline font-body mb-6">Your team must select a problem statement from the dashboard first.</p>
            <Link href="/dashboard"><Button variant="primary" size="md">Go to Dashboard</Button></Link>
          </div>
        ) : (
          /* ── MAIN ROUND 1 CONTENT ─────────────────────────────────── */
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-headline font-bold tracking-wider mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  ROUND 1 — LIVE
                </div>
                <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
                  Build Sprint
                </h1>
                <p className="text-sm text-outline font-body mt-1.5">
                  Design your solution, build your deck, and submit before the deadline.
                </p>
              </div>
              <div className="shrink-0">
                <ServerClockRenderer placement="round_1" />
              </div>
            </div>

            {/* ── Problem Statement Banner ─────────────────────────── */}
            <div className="p-5 rounded-2xl bg-primary-container/10 border border-primary/30 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-container/30 border border-primary/40">
                      {activePs.id}
                    </span>
                    <span className="text-xs uppercase font-headline font-bold tracking-wider text-primary/70">
                      {activePs.domain}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface font-headline leading-snug">
                    {activePs.title}
                  </h3>
                  <p className="text-xs text-outline mt-1.5 leading-relaxed">{activePs.shortDesc}</p>
                </div>
              </div>
            </div>

            {/* ── Main content area ───────────────────────────────── */}
            <div className="space-y-6">

              {/* ── Info sections ──────────────────────── */}
              <div className="space-y-5">

                {/* Step 1: Upload to Drive */}
                <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold font-mono shrink-0">1</div>
                    <h2 className="text-base font-headline font-bold text-on-surface">Upload Your PPT to Google Drive</h2>
                  </div>

                  <p className="text-xs text-outline font-body mb-4 leading-relaxed">
                    Open the shared Synergy drive folder below and upload your presentation file. Make sure your file is named correctly and sharing is set to <strong className="text-on-surface">"Anyone with the link — Viewer"</strong>.
                  </p>

                  <a
                    href={DRIVE_UPLOAD_FOLDER}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#1a73e8]/10 hover:bg-[#1a73e8]/20 border border-[#1a73e8]/40 hover:border-[#1a73e8]/60 text-[#4285f4] font-headline font-bold text-sm transition-all duration-200 group"
                  >
                    <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Open Synergy Submission Folder
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>

                  <div className="mt-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-outline font-mono leading-relaxed">
                    📂 File name format: &nbsp;<span className="text-primary font-bold">teamname.pptx</span>
                  </div>
                </div>

                {/* Step 2: Guidelines (collapsible) */}
                <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl overflow-hidden">
                  <button
                    onClick={() => setGuidelinesOpen(!guidelinesOpen)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold font-mono shrink-0">2</div>
                      <h2 className="text-base font-headline font-bold text-on-surface">Submission Guidelines</h2>
                    </div>
                    {guidelinesOpen ? (
                      <ChevronUp className="w-4 h-4 text-outline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-outline" />
                    )}
                  </button>
                  {guidelinesOpen && (
                    <div className="px-5 pb-5 space-y-2.5 animate-in fade-in duration-200">
                      {SUBMISSION_GUIDELINES.map((g, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <p className="text-xs text-outline leading-relaxed">{g}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rules (collapsible) */}
                <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl overflow-hidden">
                  <button
                    onClick={() => setRulesOpen(!rulesOpen)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                      <h2 className="text-base font-headline font-bold text-on-surface">Rules & Regulations</h2>
                    </div>
                    {rulesOpen ? (
                      <ChevronUp className="w-4 h-4 text-outline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-outline" />
                    )}
                  </button>
                  {rulesOpen && (
                    <div className="px-5 pb-5 space-y-3 animate-in fade-in duration-200">
                      {RULES.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                          <span className="text-base shrink-0">{r.icon}</span>
                          <p className="text-xs text-outline leading-relaxed">{r.rule}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PPT Template (only shown if URL is set) */}
                {PPT_TEMPLATE_URL ? (
                  <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-headline font-bold text-on-surface">PPT Template</h2>
                    </div>
                    <p className="text-xs text-outline mb-4">
                      See rules and regulations from there as well, and check the PPT template there.
                    </p>
                    <a
                      href={PPT_TEMPLATE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold font-headline hover:bg-primary-hover transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Access Drive Folder
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-outline-variant/50 text-center">
                    <p className="text-xs text-outline">
                      📎 PPT template will be shared here soon by the organizers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Problem Statement Full Details ────────────────────── */}
            <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
              <h2 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Full Problem Statement Details
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

          </div>
        )}
      </main>
    </div>
  );
}
